# 🚀 Push Notification FCM (Firebase Cloud Messaging) Full-Stack App

Sistem Notifikasi FCM Lengkap berbasis **TypeScript** yang terdiri dari **Web Admin Dashboard**, **Express Backend API + PostgreSQL Prisma ORM**, dan **React Native Expo Mobile Client**.

---

## 🛠️ Arsitektur & Teknologi

Seluruh project dibuat 100% menggunakan **TypeScript**:

1. **`admin/` (Web Dashboard Admin)**
   - **Framework**: React + Vite + TypeScript
   - **Styling**: Tailwind CSS v3 (Modern Dark Theme, Glassmorphic UI)
   - **Fitur**: 
     - Form Input Teks Bebas (Judul & Pesan kustom oleh Admin)
     - Live Mobile Preview real-time sebelum notifikasi dikirim
     - Pilihan target: Broadcast ke seluruh user atau ke device spesifik
     - Preset teks cepat (Flash Sale, Update App, Voucher, Keamanan)
     - Manajemen Device & Riwayat Notifikasi dari PostgreSQL DB

2. **`backend/` (Express API Server)**
   - **Framework**: Node.js + Express + TypeScript
   - **Database & ORM**: PostgreSQL + Prisma ORM
   - **Push Engine**: `firebase-admin` (Native FCM) & `expo-server-sdk`
   - **Fitur**:
     - `POST /api/users/register`: Pendaftaran token device ke PostgreSQL via `prisma.user.upsert()`
     - `POST /api/notifications/send`: Pengiriman notifikasi ke target spesifik & pencatatan log di DB
     - `POST /api/notifications/send-all`: Pengiriman broadcast ke seluruh device di DB
     - `GET /api/notifications/history`: Penarikan riwayat pengiriman notifikasi dari DB

3. **`mobile/` (React Native App)**
   - **Framework**: React Native + Expo + TypeScript
   - **Fitur**:
     - Registrasi token push otomatis ke PostgreSQL Backend
     - In-App Floating Toast & Heads-Up System Notification
     - Realtime listener menerima notifikasi teks dari Admin
     - Uji coba notifikasi lokal & log riwayat pesan masuk

---

## 📂 Struktur Direktori

```
notifikasi fcm react native/
├── admin/                  # Web Dashboard Admin (React + TypeScript + Tailwind CSS)
│   ├── src/
│   │   ├── components/     # Navbar, DevicesTable, SendNotificationModal, dll.
│   │   ├── App.tsx         # Halaman Utama Dashboard Admin
│   │   └── index.css       # Style Tailwind CSS
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                # Server API (Express + TypeScript + Prisma PostgreSQL)
│   ├── prisma/
│   │   └── schema.prisma   # Skema Database PostgreSQL (User & NotificationLog)
│   ├── src/
│   │   ├── config/         # Config Database (Prisma) & Firebase Admin
│   │   ├── controllers/    # Logic UserController & NotificationController
│   │   ├── routes/         # User & Notification Routes
│   │   └── server.ts       # Main Express Server
│   ├── .env.example
│   └── package.json
│
└── mobile/                 # App Mobile (React Native + TypeScript)
    ├── components/
    │   └── FloatingToast.tsx # Komponen Toast Melayang Kustom
    ├── App.tsx             # Main App Mobile Client
    └── package.json
```

---

## ⚡ Langkah Menjalankan Project

### 1. Konfigurasi Backend (`backend/`)
1. Buka terminal di folder `backend`:
   ```bash
   cd backend
   npm install
   ```
2. Buat / sesuaikan file `.env`:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fcm_db?schema=public"
   FIREBASE_SERVICE_ACCOUNT_PATH="./serviceAccountKey.json"
   ```
3. Generate Skema & Push ke PostgreSQL DB:
   ```bash
   npx prisma db push
   ```
4. Jalankan Server Backend:
   ```bash
   npm run dev
   ```

*(Opsional untuk FCM Native: Salurkan file `serviceAccountKey.json` dari Firebase Console ke folder `backend/`)*

---

### 2. Jalankan Admin Dashboard (`admin/`)
1. Buka terminal di folder `admin`:
   ```bash
   cd admin
   npm install
   ```
2. Jalankan Dashboard Admin Web:
   ```bash
   npm run dev
   ```
3. Akses di browser: `http://localhost:3000`

---

### 3. Jalankan Mobile Client (`mobile/`)
1. Buka terminal di folder `mobile`:
   ```bash
   cd mobile
   npm install
   ```
2. Jalankan Aplikasi Mobile:
   ```bash
   npx expo start
   ```
3. Buka di HP fisik (menggunakan aplikasi Expo Go) atau Emulator Android / iOS.

---

## 📲 Cara Kerja Pengiriman Notifikasi dari Admin ke User

1. User membuka aplikasi **Mobile** -> Token device terdaftar ke **PostgreSQL DB** melalui API backend.
2. Admin membuka **Web Admin Portal** (`http://localhost:3000`).
3. Admin mengetikkan **Judul & Isi Notifikasi Kustom** pada modal kirim notifikasi (dengan pratinjau live di HP).
4. Admin menekan **"Kirim Ke Mobile User"**.
5. Backend Express menerima request -> Mengirimkan push notification via **FCM** -> Mencatat log pengiriman ke **PostgreSQL DB** via **Prisma ORM**.
6. Aplikasi Mobile penerima langsung menampilkan **Heads-Up Banner** di baris status HP dan **In-App Toast** melayang!
