# CEKIV2 Backend API

Dokumen ini menjelaskan seluruh endpoint yang ada saat ini, cara pakai, kebutuhan environment, serta bentuk data (request/response).

## Base URL

- Local: `http://localhost:3000`
- Production (Vercel): pakai domain deployment kamu, mis. `https://cekiv2.vercel.app`

## Kebutuhan Environment (Wajib)

Aplikasi akan crash saat startup jika env berikut tidak tersedia/valid:

- `DATABASE_URL` (PostgreSQL URL)
  - Contoh: `postgresql://user:pass@host/db?sslmode=require`
- `JWT_PRIVATE_KEY` (PEM private key untuk sign JWT, algoritma RS256)
- `JWT_PUBLIC_KEY` (PEM public key untuk verify JWT, algoritma RS256)

Opsional:

- `JWT_EXPIRES_IN` (detik) — *saat ini belum dipakai di konfigurasi signOptions (default: `1d`)*

### Format JWT key di ENV

Disarankan simpan PEM sebagai **satu baris** dengan newline di-escape (lebih aman saat di-set via Vercel/CI):

- `-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----`

Di code, nilai env akan dinormalisasi dari `\n` menjadi newline asli.

## Autentikasi

Mayoritas endpoint game memakai JWT guard.

- Header yang dibutuhkan:
  - `Authorization: Bearer <access_token>`
  - `Content-Type: application/json`

### POST /auth/register

Buat user baru.

Request body:
```json
{
  "username": "string (min 3)",
  "password": "string (min 6)"
}
```

Response:
```json
{
  "id": "uuid-string",
  "username": "string"
}
```

### POST /auth/login

Login dan dapatkan JWT.

Request body:
```json
{
  "username": "string",
  "password": "string"
}
```

Response:
```json
{
  "access_token": "jwt-string"
}
```

## Game Sessions

Semua endpoint di bawah ini butuh header `Authorization: Bearer <token>`.

### Data Model Ringkas

- **GameSession**
  - `id: string` (UUID)
  - `userId: string` (UUID pemilik session)
  - `targetScore: number` (default 1000)
  - `isFinished: boolean`
  - `players: Player[]` (diurutkan dari backend untuk ranking)

- **Player**
  - `id: string` (UUID)
  - `name: string`
  - `totalScore: number` (akumulatif, bisa positif/negatif)
  - `rank?: number` (1..n, urutan dari backend)

### Aturan Domain Penting

- Game **multi ronde**; skor player bersifat **akumulatif** (`totalScore`).
- Skor delta ronde harus **integer kelipatan 5** (boleh negatif).
- Tidak boleh add/edit/delete player **setelah ronde pertama dibuat**.
- Session dianggap selesai jika ada player dengan `totalScore >= targetScore`.
- Reset skor ke 0 terjadi karena perbandingan relatif (bukan karena negatif):
  - **TERLEWATI**: sebelum ronde A > B, sesudah ronde A < B → A reset.
  - **TIE-BREAK**: sebelum ronde A == B, deltaA < deltaB → A reset.
- Evaluasi reset dilakukan **setelah semua delta ronde diaplikasikan**, dan reset dilakukan **batch**.

### POST /game-sessions

Buat session baru.

Request body:
```json
{
  "targetScore": 1000
}
```

`targetScore` opsional (min 1).

Response: `GameSessionResponse`
```json
{
  "id": "uuid",
  "userId": "uuid",
  "targetScore": 1000,
  "isFinished": false,
  "players": []
}
```

### GET /game-sessions/:id

Ambil session + ranking (diurutkan backend).

Response: `GameSessionResponse`
```json
{
  "id": "uuid",
  "userId": "uuid",
  "targetScore": 1000,
  "isFinished": false,
  "players": [
    {
      "id": "uuid",
      "name": "A",
      "totalScore": 1120,
      "rank": 1
    }
  ]
}
```

### POST /game-sessions/:id/players

Tambah player ke session (hanya sebelum ronde dimulai).

Request body:
```json
{
  "name": "string"
}
```

Response: `GameSessionResponse`

### PATCH /game-sessions/:id/players/:playerId

Ubah nama player (hanya sebelum ronde dimulai).

Request body:
```json
{
  "name": "string"
}
```

Response: `GameSessionResponse`

### DELETE /game-sessions/:id/players/:playerId

Hapus player (hanya sebelum ronde dimulai).

Response: `GameSessionResponse`

## Rounds

### POST /game-sessions/:id/rounds/all

Buat 1 ronde tipe `ALL` dengan delta untuk semua player.

Request body:
```json
{
  "scores": [
    { "playerId": "uuid", "score": 120 },
    { "playerId": "uuid", "score": 30 }
  ]
}
```

Aturan request:
- `scores` harus berisi **semua player** dalam session
- `playerId` tidak boleh duplicate
- `score` harus integer kelipatan 5

Response: `GameSessionResponse` (setelah delta diterapkan + aturan reset)

### POST /game-sessions/:id/rounds/ngandang

Buat ronde tipe `NGANDANG`. Saat ini implementasi:
- `winnerPlayerId` dapat `+250`
- player lain `+0`

Request body:
```json
{
  "winnerPlayerId": "uuid"
}
```

Response: `GameSessionResponse`

## History & Rollback

History ronde adalah sumber kebenaran; rollback **tidak menghapus** ronde, melainkan **void** ronde lalu recompute total lewat replay.

### GET /game-sessions/:id/rounds

Ambil seluruh ronde secara kronologis (termasuk yang voided).

Response: `GameRoundHistory[]`
```json
[
  {
    "id": "uuid",
    "type": "ALL",
    "createdAt": "2026-01-04T00:00:00.000Z",
    "winnerPlayerId": null,
    "isVoided": false,
    "voidedAt": null,
    "roundPlayers": [
      { "playerId": "uuid", "playerName": "A", "score": 120 },
      { "playerId": "uuid", "playerName": "B", "score": 30 }
    ]
  }
]
```

### POST /game-sessions/:id/rounds/rollback-last

Rollback ke state sebelum ronde terakhir (ronde terakhir di-void).

Response: `GameSessionResponse`

### POST /game-sessions/:id/rounds/:roundId/rollback

Rollback ke state sebelum `roundId` (round tersebut dan semua setelahnya di-void).

Response: `GameSessionResponse`

## User

### GET /user

Endpoint ini ada, tapi perhatikan:
- Saat ini tidak memakai JWT guard.
- Signature controller menerima `username: string` tanpa decorator (`@Query`/`@Param`), jadi perilakunya bisa tidak sesuai harapan.

Response (saat berhasil):
```json
{
  "username": "string"
}
```

## Contoh cURL cepat

### 1) Register
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"secret123"}'
```

### 2) Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"secret123"}'
```

### 3) Create session
```bash
curl -X POST http://localhost:3000/game-sessions \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"targetScore":1000}'
```

### 4) Add players
```bash
curl -X POST http://localhost:3000/game-sessions/<SESSION_ID>/players \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"A"}'

curl -X POST http://localhost:3000/game-sessions/<SESSION_ID>/players \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"B"}'
```

### 5) Create round ALL
```bash
curl -X POST http://localhost:3000/game-sessions/<SESSION_ID>/rounds/all \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"scores":[{"playerId":"<A_ID>","score":120},{"playerId":"<B_ID>","score":30}]}'
```

### 6) History
```bash
curl http://localhost:3000/game-sessions/<SESSION_ID>/rounds \
  -H "Authorization: Bearer <TOKEN>"
```

### 7) Rollback last
```bash
curl -X POST http://localhost:3000/game-sessions/<SESSION_ID>/rounds/rollback-last \
  -H "Authorization: Bearer <TOKEN>"
```

## Error umum

- `400 Bad Request`: validasi gagal (mis. score bukan kelipatan 5, duplicate playerId, rounds sudah mulai tapi masih add player)
- `401 Unauthorized`: token invalid/missing
- `403 Forbidden`: akses session milik user lain
- `404 Not Found`: session/player/round tidak ditemukan
