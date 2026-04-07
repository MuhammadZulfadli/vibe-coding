# Belajar Vibe Coding: Authentication Backend API

Aplikasi ini adalah sebuah backend *RESTful API* modern yang dikhususkan untuk melayani fitur Autentikasi Pengguna (Registrasi, Login, Autentikasi Sesi Terpusat, dan Logout). Proyek ini dibangun dari awal dengan fokus pada kecepatan dan pengembangan berbasis tipe (*type-safe*) yang kokoh menggunakan ekosistem **Bun**.

---

## 🛠️ Technology Stack & Libraries

Proyek ini menggunakan paduan *technology stack* yang sangat cepat dan modern:

- **Runtime**: [Bun](https://bun.sh/) - Cepat, bundler bawaan, dan *test runner* bawaan.
- **Web Framework**: [Elysia JS](https://elysiajs.com/) - Framework web end-to-end type-safe dengan performa sangat tinggi di Bun.
- **ORM & Database**: 
  - [Drizzle ORM](https://orm.drizzle.team/) untuk mapper database.
  - **MySQL (via `mysql2`)** untuk *Relational Database*.
- **Validasi Data**: Menggunakan standard dari *TypeBox* bawaan milik Elysia.
- **Security & Enkripsi**: `bcrypt` (untuk *hashing password*).

---

## 📂 Arsitektur dan Struktur Folder

Aplikasi ini mengadopsi pola MVC/Layering terpisah agar mudah untuk *maintenance* (pemeliharaan):

```text
.
├── src/
│   ├── db/                 # Konfigurasi koneksi MySQL & file schema Drizzle
│   │   ├── index.ts
│   │   └── schema.ts       
│   ├── middlewares/        # Plugin dan middleware bawaan untuk ekstensi framework
│   │   └── auth-middleware.ts  # Logic validasi sentralisasi token & header auth
│   ├── routes/             # Kumpulan definisi Endpoint (Controllers)
│   │   └── users-route.ts  # Rute untuk URL `/api/users/*`
│   ├── services/           # Business Logic dan query langsung ke database Layer
│   │   └── users-services.ts
│   └── index.ts            # Entry point aplikasi utama (Setup listener Elysia)
├── tests/                  # Direktori khusus Unit Testing menggunakan "bun test"
│   ├── setup.ts            # Utilitas untuk truncate/bersih bersih DB di setiap tes
│   └── users/              # Kumpulan Skenario Pengujian API Users (Register, Login, dll)
├── drizzle.config.ts       # Konfigurasi eksekusi migrasi Drizzle Kit
└── .env                    # Variabel environment sandi koneksi 
```

**Penamaan File**: Proyek menggunakan format *kebab-case*, misalnya `users-route.ts`, untuk pendefinisian berkas jamak.

---

## 🗄️ Database Schema

Kami menggunakan dua (2) tabel relasional MySQL utama yang didefinisikan lewat Drizzle:

1. **`users`**: Master tabel untuk menyimpan informasi pengguna yang teregistrasi.
   - `id` (INT, Primary Key, Auto Increment)
   - `name` (VARCHAR 255, Not Null)
   - `email` (VARCHAR 255, Not Null, Unique)
   - `password` (VARCHAR 255, Hashed, Not Null)
   - `createdAt` (Timestamp)

2. **`sessions`**: Tabel untuk menyimpan sesi login yang berhasil, berelasi dengan tabel masters.
   - `id` (INT, Primary Key)
   - `token` (VARCHAR 255, UUID dari autentikasi login)
   - `user` (VARCHAR 255, Nama Copy)
   - `userId` (INT, Foreign Key -> `users.id`)
   - `createdAt` (Timestamp)

---

## 🌐 Dokumentasi API Tersedia

Prefix Global Aplikasi: `/api/users/`

| HTTP Method | Endpoint | Keterangan | Header | Response Sukses |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/` | Mendaftarkan pengguna baru (Registrasi). Batas input data `maxLength: 255` | - | `201 OK` (`{"data": "OK"}`) |
| `POST` | `/login` | Memeriksa kredensial, jika benar mengembalikan token UUID dinamis sesi | - | `200 OK` (`{"data": "<UUID>"}`) |
| `GET` | `/current` | Menarik detail lengkap profil user saat ini bersumber dari token aktif | `Authorization: Bearer <token>` | `200 OK` (`{"data": { Profil... }}`) |
| `DELETE` | `/logout` | Menghapus token dari tabel `sessions` MySQL agar tak digunakan kembali | `Authorization: Bearer <token>` | `200 OK` (`{"data": "OK"}`) |

> Catatan: Akses invalid / Token usang akan selalu mengembalikan Code HTTP `401 Unauthorized` atau `400 Bad Request`.

---

## 🚀 Cara Setup dan Menjalankan Aplikasi Lokal

1. **Kloning Repositori & Instalasi Modul**
   ```bash
   git clone <url_repo>
   cd <nama_folder_proyek>
   bun install
   ```

2. **Konfigurasi Environment Lokal**
   Buat atau sesuaikan file bernama `.env` di direktori terdepan. Atur rahasia kredensial Database MySQL Anda, misalnya:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=belajar_vibe_coding
   DB_SOCKET_PATH=/run/mysqld/mysqld.sock # Gunakan Socket jika diperlukan, atau ganti format/port biasa.
   ```

3. **Inisiasi & Sinkronisasi Mode Skema Database (Drizzle Push)**
   Push Schema *TypeScript* ke Database MySQL lokal Anda:
   ```bash
   bun run db:push
   ```

4. **Menjalankan Server (Development Mode)**
   ```bash
   bun run dev
   ```
   Aplikasi akan diluncurkan di terminal dengan balasan: `🦊 Elysia is running at localhost:3000`

---

## 🧪 Cara Pengujian Aplikasi (Run Tests)

Aplikasi ini sudah diproteksi secara otomatis melalui ekosistem Unit Test internal Bun yang mencakup 14 batasan tes (*coverage* simulasi skenario sukses & gagal).

1. Menjalankan Uji Otomatis Lengkap di Konsol Terminal:
   ```bash
   bun test
   ```
   *Runner test Bun akan secara otomatis menjernihkan Database dan mencari file berakhiran `.test.ts` di folder `tests/`.*
