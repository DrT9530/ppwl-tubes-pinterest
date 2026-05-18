# 🤖 AI Development Guide — Pinterest Clone (PPWL Capstone)

> **Instruksi**: Copy-paste seluruh isi file ini ke AI assistant kamu (ChatGPT, Cursor, Gemini, dsb) sebagai *system prompt* atau pesan pertama sebelum mulai coding. AI akan langsung paham konteks project, arsitektur, konvensi, dan apa yang harus dikerjakan.

---

# System Role & Context

You are an expert Fullstack Developer. We are building a **Pinterest Clone** (PPWL Capstone Project) using a modern monorepo architecture. The project is already partially built. You MUST follow the existing patterns exactly.

---

# Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | Bun workspaces + TypeScript |
| Frontend | React 19 (Vite 8), TailwindCSS v4, React Router v7, Zustand v5, TanStack Query v5, React Hook Form + Zod, Lucide React icons |
| Backend | ElysiaJS v1.2, Prisma ORM (PostgreSQL), JWT (`@elysiajs/jwt`), bcryptjs, Arctic (Google OAuth) |
| Storage | Cloudinary for image uploads |
| Shared | `packages/shared` — DTOs, API types, Zod validators |

---

# Repository Structure

```
ppwl-tubes-pinterest/
├── apps/
│   ├── backend/
│   │   ├── prisma/schema.prisma          # Database schema (SUDAH FINAL)
│   │   └── src/
│   │       ├── index.ts                  # Entry point, register routes di sini
│   │       ├── lib/
│   │       │   ├── prisma.ts             # Prisma client singleton
│   │       │   └── arctic.ts             # Google OAuth config
│   │       ├── middleware/
│   │       │   └── auth.ts               # jwtPlugin, authGuard, optionalAuth
│   │       └── modules/
│   │           ├── auth/                  # ✅ DONE — register, login, google oauth, logout, me
│   │           │   ├── auth.routes.ts
│   │           │   └── index.ts
│   │           ├── profile/               # ✅ DONE — edit profile, avatar, password
│   │           │   ├── profile.routes.ts
│   │           │   └── index.ts
│   │           ├── post/                  # ❌ BELUM ADA — Chris
│   │           ├── comment/               # ❌ BELUM ADA — Evelyn
│   │           ├── like/                  # ❌ BELUM ADA — Shalwa
│   │           └── notification/          # ❌ BELUM ADA — Shalwa
│   │
│   └── frontend/
│       └── src/
│           ├── App.tsx                    # Router, QueryClient, Auth init
│           ├── main.tsx                   # Entry point
│           ├── index.css                  # Design system (Pin-Sans font, design tokens)
│           ├── components/
│           │   ├── Navbar.tsx             # ✅ Main navbar (with search, user dropdown)
│           │   ├── AuthModal.tsx          # ✅ Login/Register modal
│           │   ├── OnboardingModal.tsx    # ✅ Post-signup onboarding flow
│           │   ├── LandingNavbar.tsx      # ✅ Landing page navbar
│           │   └── ProtectedRoute.tsx     # ✅ Route guard
│           ├── pages/
│           │   ├── LandingPage.tsx        # ✅ Guest landing
│           │   ├── HomePage.tsx           # ⚠️ PLACEHOLDER — perlu Masonry feed
│           │   ├── ProfilePage.tsx        # ✅ User profile
│           │   ├── LoginPage.tsx          # ✅ Redirect to modal
│           │   └── RegisterPage.tsx       # ✅ Redirect to modal
│           ├── services/
│           │   ├── api.ts                 # ✅ ApiClient class (GET, POST, PATCH, DELETE)
│           │   └── auth.service.ts        # ✅ Auth API calls
│           └── stores/
│               └── auth.store.ts          # ✅ Zustand auth state
│
└── packages/
    └── shared/src/
        ├── types/                         # DTO interfaces
        │   ├── api.types.ts               # ApiResponse<T>, PaginatedResponse<T>
        │   ├── user.types.ts              # UserDTO, AuthResponse
        │   ├── post.types.ts              # PostDTO
        │   ├── comment.types.ts           # CommentDTO, ReplyDTO
        │   └── notification.types.ts      # NotificationDTO
        ├── validators/                    # Zod schemas
        │   ├── auth.schema.ts
        │   ├── post.schema.ts             # createPostSchema
        │   ├── comment.schema.ts          # createCommentSchema
        │   └── profile.schema.ts
        └── constants/
```

---

# Database Schema (Prisma) — SUDAH FINAL, JANGAN DIUBAH

```prisma
model User {
  id           String    @id @default(cuid())
  email        String    @unique
  username     String    @unique
  passwordHash String?
  avatarUrl    String?
  provider     Provider  @default(EMAIL)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  posts         Post[]
  comments      Comment[]
  replies       Reply[]
  likes         Like[]
  savedPins     SavedPin[]
  notifications Notification[]
  @@map("users")
}

model Post {
  id        String   @id @default(cuid())
  imageUrl  String
  caption   String?
  creatorId String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  creator   User      @relation(fields: [creatorId], references: [id], onDelete: Cascade)
  comments  Comment[]
  likes     Like[]
  savedPins SavedPin[]
  @@map("posts")
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  postId    String
  userId    String
  createdAt DateTime @default(now())
  post    Post    @relation(fields: [postId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  replies Reply[]
  @@map("comments")
}

model Reply {
  id        String   @id @default(cuid())
  content   String
  commentId String
  userId    String
  createdAt DateTime @default(now())
  comment Comment @relation(fields: [commentId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("replies")
}

model Like {
  id        String   @id @default(cuid())
  postId    String
  userId    String
  createdAt DateTime @default(now())
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([postId, userId])
  @@map("likes")
}

model Notification {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType
  postId    String?
  actorId   String?
  read      Boolean          @default(false)
  createdAt DateTime         @default(now())
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("notifications")
}

enum Provider { EMAIL  GOOGLE }
enum NotificationType { LIKE  COMMENT  REPLY }
```

---

# 🚨🚨🚨 3 GOLDEN RULES — WAJIB DIPATUHI SEBELUM NGODING 🚨🚨🚨

## GOLDEN RULE 1: JAGA CONSISTENCY
- **SEMUA** endpoint backend HARUS return format yang sama: `{ success: boolean, message: string, data?: any }`
- **SEMUA** error response HARUS return: `{ success: false, message: "..." }`
- **JANGAN** pernah return format lain (misal langsung return array, atau return tanpa field `success`).
- Gunakan `satisfies ApiResponse<T>` di akhir return statement untuk enforce type safety.
- Nama variabel: camelCase di TypeScript, snake_case di database (Prisma `@@map` sudah handle).

## GOLDEN RULE 2: JAGA SHARED TYPES
- **SEBELUM** coding backend/frontend, SELALU cek dulu `packages/shared/src/types/` dan `validators/` — apakah DTO/schema yang kamu butuhkan sudah ada.
- **JIKA** kamu butuh type/schema baru (misal `UpdatePostInput`), BUAT di `packages/shared` DULU, baru pakai di backend & frontend.
- **JANGAN** membuat type duplikat di backend atau frontend. Semua type yang dipakai bersama HARUS ada di shared.
- **SETELAH** menambah type/schema baru, WAJIB re-export di `packages/shared/src/types/index.ts` atau `validators/index.ts`.
- Import selalu dari `"shared/types"` atau `"shared/validators"`, BUKAN dari path relatif.

## GOLDEN RULE 3: JAGA BACKEND REGISTRATION
- **SETIAP** kali membuat module backend baru (misal `post/`, `comment/`, `like/`), kamu HARUS:
  1. Buat file `<module>.routes.ts` + `index.ts` di `apps/backend/src/modules/<module>/`
  2. Di `index.ts`: `export { <module>Routes } from "./<module>.routes";`
  3. **DAFTARKAN** di `apps/backend/src/index.ts` dengan menambahkan `.use(<module>Routes)` di chain Elysia app
- **JIKA LUPA** mendaftarkan route di `index.ts`, endpoint-mu TIDAK AKAN BERFUNGSI meskipun kode route-nya benar.
- **JANGAN** lupa import module-nya di `index.ts`: `import { postRoutes } from "./modules/post";`

---

# ⚠️ ATURAN WAJIB — SEMUA ANGGOTA HARUS IKUTI

## 1. API Response Format (WAJIB KONSISTEN)

Semua endpoint backend HARUS mengembalikan format ini:

```ts
// Success
{ success: true, message: "...", data: { ... } }

// Error
{ success: false, message: "..." }

// Paginated
{ success: true, message: "...", data: [...], meta: { page, limit, total, hasNext } }
```

Tipe sudah didefinisikan di `packages/shared/src/types/api.types.ts`:
```ts
interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: { page: number; limit: number; total: number; hasNext: boolean; };
}
```

## 2. Backend Module Pattern

Setiap module backend HARUS mengikuti pola yang sudah ada:

```
apps/backend/src/modules/<nama-module>/
├── <nama>.routes.ts   # Route handlers
└── index.ts           # Re-export: export { <nama>Routes } from "./<nama>.routes";
```

**Contoh route file** (ikuti pola `auth.routes.ts`):
```ts
import { Elysia, t } from "elysia";
import { prisma } from "../../lib/prisma";
import { authGuard, optionalAuth } from "../../middleware/auth";

export const postRoutes = new Elysia({ prefix: "/posts" })
  // Public routes (menggunakan optionalAuth agar bisa cek isLiked)
  .use(optionalAuth)
  .get("/", async ({ query, user }) => {
    // ... implementasi
    return { success: true, message: "...", data: [...] };
  })

  // Protected routes (di bawah authGuard, user dijamin ada)
  .use(authGuard)
  .post("/", async ({ body, user, set }) => {
    // ... implementasi
    return { success: true, message: "...", data: { ... } };
  });
```

**PENTING tentang authGuard & optionalAuth:**
- `authGuard` = FUNCTION `(app: Elysia) => app.use(jwtPlugin).derive(...)` — user WAJIB login, akan return 401 jika tidak
- `optionalAuth` = FUNCTION `(app: Elysia) => app.use(jwtPlugin).derive(...)` — user BOLEH null, tidak akan block request
- Keduanya menyediakan `{ user, userId }` di context. Pada `optionalAuth`, user bisa `null`.
- Import: `import { authGuard, optionalAuth } from "../../middleware/auth";`

**Setelah membuat module baru, DAFTARKAN di `apps/backend/src/index.ts`:**
```ts
import { postRoutes } from "./modules/post";
// ...
const app = new Elysia()
  .use(authRoutes)
  .use(profileRoutes)
  .use(postRoutes)      // ← tambahkan di sini
  .listen(PORT);
```

## 3. Frontend Service Pattern

Buat service file per fitur di `apps/frontend/src/services/`:

```ts
// services/post.service.ts
import { api } from "./api";
import type { ApiResponse, PostDTO, PaginatedResponse } from "shared/types";

export const postService = {
  getFeed: (page = 1, limit = 20) =>
    api.get<PaginatedResponse<PostDTO>>(`/posts`, { params: { page, limit } }),

  getById: (id: string) =>
    api.get<ApiResponse<PostDTO>>(`/posts/${id}`),

  create: (formData: FormData) =>
    api.upload<ApiResponse<PostDTO>>("/posts", formData),  // ← butuh method upload baru
};
```

**PENTING — ApiClient (`services/api.ts`):**
- Sudah ada method: `get`, `post`, `patch`, `delete`
- Token otomatis dikirim via `Authorization: Bearer <token>` dari `localStorage("auth_token")`
- Base URL: `VITE_API_BASE_URL` atau default `/api`
- **Kamu mungkin perlu menambahkan method `upload` untuk FormData** (tanpa Content-Type header, biar browser set multipart otomatis)

## 4. Frontend State Management Rules

| Jenis State | Gunakan | Contoh |
|-------------|---------|--------|
| Auth (user, token, isAuthenticated) | **Zustand** (`auth.store.ts`) | ✅ Sudah ada |
| Server data (posts, comments, likes) | **TanStack Query** | `useQuery`, `useMutation`, `useInfiniteQuery` |
| Form input | **useState** atau **React Hook Form** | Local component state |
| UI state (modal open, sidebar) | **useState** atau **Zustand** | Tergantung scope |

**JANGAN** simpan data posts/comments/likes di Zustand. Gunakan TanStack Query.

## 5. Shared Types & Validators

Sebelum mulai coding, cek dulu apakah type/validator yang kamu butuhkan sudah ada di `packages/shared/src/`.

**Yang sudah ada:**
- `UserDTO`, `AuthResponse`, `PostDTO`, `CommentDTO`, `ReplyDTO`, `NotificationDTO`
- `ApiResponse<T>`, `PaginatedResponse<T>`
- `registerSchema`, `loginSchema`, `createPostSchema`, `createCommentSchema`

**Jika perlu menambah schema/type baru:**
1. Tambahkan di folder `packages/shared/src/types/` atau `validators/`
2. Re-export di `index.ts` masing-masing folder
3. Import di backend/frontend: `import type { PostDTO } from "shared/types";`

## 6. Styling & Design Rules

- **Font**: Pin-Sans (sudah di-load di `index.css`)
- **Warna utama**: `#E60023` (Pinterest Red), `#111111` (text), `#767676` (secondary text), `#CDCDCD` (border)
- **Radius**: `rounded-lg` (8px), `rounded-2xl` (16px), `rounded-3xl` (24px), `rounded-full`
- **Gunakan design tokens dari CSS**: `var(--color-pinterest-red)`, `var(--color-text-primary)`, dll
- **Icons**: Gunakan `lucide-react` (sudah terinstall). Contoh: `import { Heart, MessageCircle } from "lucide-react";`
- **Animasi**: Gunakan tokens yang ada: `var(--animate-fade-in)`, `var(--animate-slide-up)`
- **JANGAN** install library UI tambahan tanpa persetujuan Atha

---

# 🎯 BUSINESS RULES (WAJIB ENFORCE)

| Rule | Enforce di |
|------|-----------|
| Maksimal **2 post** per user | Backend `POST /posts` — hitung `prisma.post.count({ where: { creatorId } })` |
| Hanya terima **image** (no video) | Backend `POST /posts` — validasi MIME type: `image/jpeg`, `image/png`, `image/webp`, `image/gif` |
| Maksimal **5 comment** per user (total, bukan per post) | Backend `POST /posts/:id/comments` — hitung total comment user |
| Reply hanya **1 level** (reply ke comment, bukan ke reply lain) | Schema sudah enforce: Reply -> Comment (bukan Reply -> Reply) |
| Guest bisa lihat feed & detail post | Frontend: tampilkan konten, sembunyikan tombol Like/Comment/Create |
| Guest TIDAK bisa create/like/comment | Backend: gunakan `authGuard`, Frontend: tampilkan Auth Modal |

---

# 📋 TASK PER ANGGOTA

## 🟢 Bila — Home Feed
**Branch**: `feature/feed`

### Backend:
- `GET /posts` — Fetch feed terbaru, support pagination (`?page=1&limit=20`)
  - Gunakan `optionalAuth` (supaya bisa cek `isLiked` jika user login)
  - Include: creator info, like count, comment count
  - Order by `createdAt DESC`
  - Return `PaginatedResponse<PostDTO>`

### Frontend:
- Bangun **Masonry/Grid layout** di `HomePage.tsx` (gaya Pinterest)
- Implementasi **infinite scroll** menggunakan `useInfiniteQuery` dari TanStack Query
- Tambahkan **skeleton loading** saat fetch data
- **Lazy image loading** (gunakan `loading="lazy"` di `<img>`)
- Setiap card menampilkan: gambar, caption (truncated), creator avatar+nama
- Klik card → navigasi ke `/post/:id` (detail post)

### File yang perlu dibuat/edit:
```
apps/backend/src/modules/post/post.routes.ts    # GET /posts endpoint
apps/backend/src/modules/post/index.ts
apps/backend/src/index.ts                        # Register postRoutes
apps/frontend/src/pages/HomePage.tsx             # Masonry feed
apps/frontend/src/services/post.service.ts       # API calls
apps/frontend/src/hooks/usePostFeed.ts           # TanStack Query hook (useInfiniteQuery)
```

---

## 🟡 Chris — Post & Upload Image
**Branch**: `feature/post`

### Backend:
- `POST /posts` — Upload gambar ke Cloudinary, simpan post
  - Gunakan `authGuard`
  - Accept `multipart/form-data` (field: `image` + `caption`)
  - Validasi: hanya image, max 2 post per user
  - Upload ke Cloudinary, simpan `imageUrl` ke database
- `GET /posts/:id` — Detail post (creator, comments + replies, like count, isLiked)
  - Gunakan `optionalAuth`
- `PATCH /posts/:id` — Edit caption (hanya owner)
- `DELETE /posts/:id` — Hapus post (hanya owner, hapus juga dari Cloudinary)

### Frontend:
- Buat halaman/modal **Upload Pin** (`/create` atau modal)
  - Input: drag-drop/browse image + caption text
  - Preview image sebelum upload
  - Validasi: hanya image, tampilkan error kalau bukan image
- Buat halaman **Post Detail** (`/post/:id`)
  - Layout: gambar di kiri, info + comments di kanan (desktop)
  - Tampilkan: gambar, caption, creator info, like button, comment section

### File yang perlu dibuat/edit:
```
apps/backend/src/modules/post/post.routes.ts    # CRUD endpoints
apps/backend/src/modules/post/index.ts
apps/backend/src/lib/cloudinary.ts              # Cloudinary upload helper
apps/backend/src/index.ts                        # Register postRoutes
apps/frontend/src/pages/PostDetailPage.tsx       # Post detail view
apps/frontend/src/components/CreatePostModal.tsx # Upload UI
apps/frontend/src/services/post.service.ts       # API calls
apps/frontend/src/App.tsx                        # Tambah route /post/:id dan /create
```

### Setup Cloudinary di Backend:
```ts
// apps/backend/src/lib/cloudinary.ts
// Gunakan Cloudinary REST API langsung (tanpa SDK):
// POST https://api.cloudinary.com/v1_1/<cloud_name>/image/upload
// Env vars yang dibutuhkan: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
```

---

## 🔵 Evelyn — Comment System
**Branch**: `feature/comment`

### Backend:
- `POST /posts/:id/comments` — Tambah komentar
  - Gunakan `authGuard`
  - Validasi: max 5 komentar per user (total semua post)
  - Buat notification untuk post owner (type: `COMMENT`)
- `POST /comments/:id/reply` — Balas komentar
  - Gunakan `authGuard`
  - Buat notification untuk comment owner (type: `REPLY`)
  - Reply TIDAK bisa dibalas lagi (1 level only — schema sudah enforce)

### Frontend:
- Bangun **Comment Section** component (dipakai di PostDetailPage)
  - Tampilkan list comments + replies per comment
  - Input untuk tambah comment baru
  - Tombol "Reply" di setiap comment → munculkan input reply
  - Tampilkan avatar + username + timestamp
  - Jika guest → klik comment input → tampilkan Auth Modal

### File yang perlu dibuat/edit:
```
apps/backend/src/modules/comment/comment.routes.ts  # Comment + Reply endpoints
apps/backend/src/modules/comment/index.ts
apps/backend/src/index.ts                            # Register commentRoutes
apps/frontend/src/components/CommentSection.tsx       # Comment list + input
apps/frontend/src/services/comment.service.ts         # API calls
apps/frontend/src/hooks/useComments.ts                # TanStack Query hooks
```

---

## 🟣 Shalwa — Like & Notification
**Branch**: `feature/notification`

### Backend:
- `POST /posts/:id/like` — Toggle like/unlike
  - Gunakan `authGuard`
  - Jika belum like → create Like + create Notification (type: `LIKE`) untuk post owner
  - Jika sudah like → delete Like (unlike, JANGAN buat notification)
  - Return: `{ liked: boolean, likeCount: number }`
- `GET /notifications` — Fetch notifications untuk user yang login
  - Gunakan `authGuard`
  - Include: actor info (siapa yang like/comment)
  - Order by `createdAt DESC`
  - Mark as read (optional: `PATCH /notifications/read`)

### Frontend:
- **Like Button** component (dipakai di feed card + post detail)
  - Optimistic UI update (TanStack Query `useMutation` + `onMutate`)
  - Animasi heart saat like
  - Jika guest → klik like → tampilkan Auth Modal
- **Notification Dropdown** (di Navbar, icon Bell 🔔)
  - Badge merah jika ada unread notifications
  - Klik → dropdown list notifications
  - Setiap notification menampilkan: "[actor] liked your post" / "[actor] commented on your post"
  - Gunakan **Sonner** untuk toast notification (PRD requirement — mungkin perlu install: `bun add sonner`)

### File yang perlu dibuat/edit:
```
apps/backend/src/modules/like/like.routes.ts            # Like toggle
apps/backend/src/modules/like/index.ts
apps/backend/src/modules/notification/notification.routes.ts  # Fetch notifications
apps/backend/src/modules/notification/index.ts
apps/backend/src/index.ts                                # Register routes
apps/frontend/src/components/LikeButton.tsx              # Like with optimistic UI
apps/frontend/src/components/NotificationDropdown.tsx    # Notification popup
apps/frontend/src/services/like.service.ts
apps/frontend/src/services/notification.service.ts
apps/frontend/src/stores/notification.store.ts           # Zustand: unread count, badge
apps/frontend/src/components/Navbar.tsx                  # Update: integrate notification dropdown
```

---

# 🔧 Setup Lokal untuk Semua Anggota

```bash
# 1. Clone & install
git clone <repo-url>
cd ppwl-tubes-pinterest
bun install

# 2. Setup backend env
cp apps/backend/.env.example apps/backend/.env
# Edit .env: isi DATABASE_URL, JWT_SECRET, CLOUDINARY_*, GOOGLE_CLIENT_*

# 3. Sync database
cd apps/backend
bunx prisma db push
bunx prisma generate

# 4. Jalankan
cd ../..
bun run dev:be   # Backend di http://localhost:3000
bun run dev:fe   # Frontend di http://localhost:5173
```

---

# 🌿 Git Workflow

```bash
# 1. Pastikan up-to-date dengan main
git checkout main
git pull origin main

# 2. Buat branch fitur
git checkout -b feature/<nama-fitur>

# 3. Coding...

# 4. Commit dengan pesan yang jelas
git add .
git commit -m "feat(post): implement POST /posts with cloudinary upload"

# 5. Push & buat Pull Request
git push origin feature/<nama-fitur>
# Buat PR di GitHub → minta review Atha sebelum merge
```

**Commit message format**: `feat(module): deskripsi singkat`
- `feat(post): add masonry grid feed layout`
- `feat(comment): implement reply to comment endpoint`
- `fix(auth): fix token not persisted after google login`

---

# ❌ JANGAN LAKUKAN

1. **JANGAN ubah `schema.prisma`** tanpa konfirmasi Atha
2. **JANGAN ubah `auth.ts` middleware** tanpa konfirmasi Atha
3. **JANGAN install library baru** tanpa konfirmasi Atha
4. **JANGAN edit file yang bukan domain kamu** (kecuali `index.ts` untuk register route)
5. **JANGAN simpan server data di Zustand** — gunakan TanStack Query
6. **JANGAN buat endpoint tanpa format response standar** (`{ success, message, data }`)
7. **JANGAN push langsung ke `main`** — selalu buat branch + PR
