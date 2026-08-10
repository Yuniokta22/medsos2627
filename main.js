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
// 4.
async function muatTimeline() {
  // periksa apakah elemen timeline ada di halaman 
  // agar tidak terjadi error jika fungsi ini di halaman admin.html
  // jadi elemen timen timeline tidakada, keluar dari fungsi (returan)
  if (!document.getElementById("timeline")) return
  
  // buat query untuk memanggil dokumen dari koleksi medsos
  // urutan berdasarkan waktu secara menurun (setatus terbaru di atas)
  const q = query(medsosCollection, orderBy("waktu", "desc"))
  
  // buat variabel untuk menampung id status yang sudah disukai
  // mengunakan lokalStorage agar data tetap ada meskipun halaman direfresh
  const daftarLike = JSON.parse(localStorage.getItem("SUDAH_LIKE")) || []
  
  // menggunakan onSnapshot untuk "mendengarkan"
  // perubahan data secara real-time dari firestore
  onSnapshot(q, (snapshot) => {
    // buat variabel untuk menampung HTML timeline
    let output = ""
    
    // loop setiap dokumen di snapshot
    snapshot.forEach((doc) => {
      // ambil data dari dokumen
      const data = doc.data()
      
      // ambil id dokumen
      const id = doc.id
      
      // ambil id status yang sudah disukai dari lokalStorage
      // menggunakan fungsi includes untuk memeriksa apakah id status ada di daftarLike
      let sudahLike = daftarLike.includes(id) ? "liked" : ""
      
      // buat HTML untuk setiap status
      output += `
            <div class="post-card">
                <div class="post-content">
                    ${data.konten}
                </div>
                <button id="btn-like-${id}" class="btn-like ${sudahLike} " onclick="sukaStatus('${id}')">❤️ ${data.likes} suka </button>
            </div>
         `
    })
    
    // tampilkan HTML timeline di elemen dengan id "timeline"
    document.getElementById("timeline").innerHTML = output
  })
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

// Daftar fungsi ke window scope agar bisa di akses ke HTML
window.postingStatus = postingStatus
window.sukaStatus = sukaStatus

// panggil fungsi muatTimeLine untuk  memuat timeline saat halaman dimuat
muatTimeline()