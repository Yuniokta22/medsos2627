// 1. Impor module yang diperlukan dari firebase dan firestore
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
    increment
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"

// 2. Konfigurasi Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA6I1Tvw61wzc6-2MVmcWXfZ17IwDYj7u4",
    authDomain: "rpl25-b6db4.firebaseapp.com",
    projectId: "rpl25-b6db4",
    storageBucket: "rpl25-b6db4.firebasestorage.app",
    messagingSenderId: "643920833293",
    appId: "1:643920833293:web:f5ac7fdc746e4e410d5e44"
}

// 3. Inisialisasi aplikasi Firebase dan Firestore
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const medsosCollection = collection(db, "medsos")

// 4. Fungsi untuk menambahkan status ke Firestore
// (digunakan di halaman admin.html)
async function postingStatus() {
    // buat variabel untuk mengambil isi status
    let teks = document.getElementById("isiStatus").value.trim()

    // abaikan jika teks kosong
    // langsung keluar dari fungsi ini
    if (teks === "") return

    try {
        // buat dokumen baru di Firestore
        await addDoc(medsosCollection, {
            konten: teks,
            likes: 0,
            waktu: serverTimestamp()
        })

        // kosongkan input teks setelah berhasil menambahkan status
        document.getElementById("isiStatus").value = ""

        // tampilkan pesan sukses
        alert("Status berhasil ditambahkan!")
    } catch (error) {
        // tampilkan pesan error jika gagal menambahkan status
        alert("Gagal menambahkan status. Silakan coba lagi.")
    }
}

// Daftarkan fungsi ke window scope agar bisa diakses dari HTML
window.postingStatus = postingStatus
