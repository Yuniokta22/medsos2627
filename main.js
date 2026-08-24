//1.Impor module yang diperlukan dari firbase dan firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js"
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"

// 2. Konfigurasi Firebase 
// Import the functions you need from the SDKs you need


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCT-GxvNBVM5AEzuxHy6Bm_P0G_aqLv7ss",
  authDomain: "uasgenap2026-5a55a.firebaseapp.com",
  projectId: "uasgenap2026-5a55a",
  storageBucket: "uasgenap2026-5a55a.firebasestorage.app",
  messagingSenderId: "701401299846",
  appId: "1:701401299846:web:5341bab344ff702dceca07"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 3. Inisialisasi aplikasi firebase firestote
const db = getFirestore(app)
const medsosCollection = collection(db, "medsos")

// 4. Fungsi untuk menambah setatus ke firestore
// (digunakan di halaman admin.html)
async function postingStatus() {
  // buat variabel untuk mengambil isi setatus 
  let teks = document.getElementById("isiStatus").value
  // abaikan jika teks kosong
  // langsung keluar dari fungsi ini
  if (teks === "") return
  
  try {
    // buat dokumen baru di firestore 
    await addDoc(medsosCollection, {
      konten: teks,
      likes: 0,
      waktu: serverTimestamp()
    })
    
    // kosongkan input teks setelah berhasil menambahkan status
    document.getElementById("isiStatus").value = ""
    
    // tampilkan pesan sukses
    alert("Status berhasil ditambahkan ")
  } catch (error) {
    // tampilkan pesan error jika gagal menambahkan Status 
    alert("gagal menambahkan Status.Silahkan coba lagi.")
    
    
  }
}
async function muatTimeline() {
  // Periksa apakah elemen timeline ada di halaman
  if (!document.getElementById("timeline")) return;

  // Query data medsos, urutkan berdasarkan waktu terbaru
  const q = query(medsosCollection, orderBy("waktu", "desc"));

  // Ambil daftar status yang sudah disukai
  const daftarLike = JSON.parse(localStorage.getItem("SUDAH_LIKE")) || [];

  // Menyimpan ID postingan yang sudah diketahui
  let postinganSebelumnya = JSON.parse(
    localStorage.getItem("POSTINGAN_SEBELUMNYA")
  ) || [];

  // Mendengarkan perubahan Firestore secara real-time
  onSnapshot(q, (snapshot) => {
    let output = "";
    let postinganSekarang = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const id = doc.id;

      // Simpan ID postingan saat ini
      postinganSekarang.push(id);

      // Cek apakah postingan sudah disukai
      let sudahLike = daftarLike.includes(id) ? "liked" : "";

      // Buat HTML postingan
      output += `
        <div class="post-card">
          <div class="post-content">
            ${data.konten}
          </div>

          <button 
            id="btn-like-${id}" 
            class="btn-like ${sudahLike}"
            onclick="sukaStatus('${id}')"
          >
            ❤️ ${data.likes} suka
          </button>
        </div>
      `;
    });

    // Cek apakah ada postingan baru
    const adaPostinganBaru = postinganSekarang.some(
      id => !postinganSebelumnya.includes(id)
    );

    // Putar suara jika ada postingan baru
    if (adaPostinganBaru && postinganSebelumnya.length > 0) {
      const suara = document.getElementById("suaraPostinganBaru");

      if (suara) {
        suara.currentTime = 0;
        suara.play().catch(error => {
          console.log("Suara belum diizinkan browser:", error);
        });
      }
    }

    // Simpan daftar postingan terbaru
    localStorage.setItem(
      "POSTINGAN_SEBELUMNYA",
      JSON.stringify(postinganSekarang)
    );

    // Tampilkan timeline
    document.getElementById("timeline").innerHTML = output;

    // Update data sebelumnya
    postinganSebelumnya = postinganSekarang;
  });
}
// 6. fungsi suka status 
async function sukaStatus(idDokumen) {
  // mengambil daftar status yang sudah disukai dari lokalStorage
  const daftarLikes = JSON.parse(localStorage.getItem("SUDAH_LIKE")) || []
  
  // periksa apakah status sudah disukai
  if (daftarLikes.includes(idDokumen)) {
    // jika sudah disukai, tampilkan pesan dan keluar dari fungsi
    alert("Anda sudah menyukai status ini.")
    return
  }
  
  try {
    // (1) update jumblah like di firestore
    await updateDoc(doc(db, "medsos", idDokumen), {
      likes: increment(1) // menambahkan 1 ke jumblah like
    })
    
    // (2) tambahkan id status ke daftarLike
    daftarLikes.push(idDokumen)
    
    // (3) simpan daftarLike ke lokalStorage
    localStorage.setItem("SUDAH_LIKE", JSON.stringify(daftarLikes))
    
    // (4) update tampilan tombol like
    const tombolLike = document.getElementById(`btn-like-${idDokumen}`)
    tombolLike.classList.add("Liked")
    
    // tampilkan pesan sukses
    alert("Terimakasih telah menyukai status ini!")
  } catch (error) {
    console.log(error)
    
    // tampilkan pesan error jika gagal menyukai status
    alert("Gagal menyukai status.")
  }
}

// 7. Fungsi untuk memuat daftar postingan di admin.html beserta tombol Hapus
function muatDaftarAdmin() {
    if (!document.getElementById("daftarAdmin")) return

    const q = query(medsosCollection, orderBy("waktu", "desc"))

    onSnapshot(q, (snapshot) => {
        let output = ""
        if (snapshot.empty) {
            output = "<p style='color: #8e8e8e; font-size: 14px;'>Belum ada postingan.</p>"
        } else {
            snapshot.forEach((doc) => {
                let data = doc.data()
                let id = doc.id

                output += `
                    <div class="post-card">
                        <div class="post-content">${data.konten}</div>
                        <button class="btn-delete" onclick="hapusStatus('${id}')">
                            🗑️ Hapus Post
                        </button>
                    </div>
                `
            })
        }
        document.getElementById("daftarAdmin").innerHTML = output
    })
}

// 8. Fungsi untuk menghapus status dari Firestore
async function hapusStatus(idDokumen) {
    // Konfirmasi sebelum menghapus
    if (!confirm("Apakah Anda yakin ingin menghapus postingan ini?")) return

    try {
        await deleteDoc(doc(db, "medsos", idDokumen))
        alert("🗑️ Postingan berhasil dihapus!")
    } catch (error) {
        console.error(error)
        tampilToast("❌ Gagal menghapus postingan.")
    }
}

        // Daftar fungsi ke window scope agar bisa di akses ke HTML
        window.postingStatus = postingStatus
        window.sukaStatus = sukaStatus
        window.hapusStatus = hapusStatus
        
        // panggil fungsi muatTimeLine untuk  memuat timeline saat halaman dimuat
        muatTimeline()
        muatDaftarAdmin()