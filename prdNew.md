# PRD — Pinterest Clone (PPWL Capstone Project)

# Project Overview

Membangun aplikasi social media berbasis visual yang mengadaptasi konsep utama Pinterest menggunakan arsitektur fullstack monorepo berbasis Bun + Typescript.

Aplikasi memungkinkan user untuk:

* Melihat feed/postingan tanpa login
* Login/Register menggunakan email-password atau Google OAuth
* Upload gambar/postingan
* Like postingan
* Comment postingan
* Mendapatkan notifikasi interaksi
* Mengelola profile pengguna

Project wajib:

* Responsive mobile & desktop
* Menggunakan backend API
* Deploy frontend & backend ke AWS/Vercel
* Menggunakan database PostgreSQL

---

# Tech Stack

## Monorepo

* Bun
* Typescript

---

# Frontend

* React
* Vite
* TailwindCSS
* ShadcnUI
* React Router
* Zustand
* TanStack Query
* React Hook Form
* Zod
* Sonner

---

# Backend

* ElysiaJS
* Prisma ORM
* JWT Authentication
* bcrypt
* Google OAuth

---

# Database

* PostgreSQL
* AWS RDS

---

# Deployment

* Frontend → AWS S3 / Vercel
* Backend → AWS Lambda
* Database → AWS RDS

---

# Image Storage

* Cloudinary (recommended)

---

# Team Responsibilities (Feature-Based Fullstack)

| Member | Responsibility                         |
| ------ | -------------------------------------- |
| Atha   | Auth, Profile, Integration, Deployment |
| Bila   | Home Feed                              |
| Chris  | Post & Upload Image                    |
| Evelyn | Comment                                |
| Shalwa | Like & Notification                    |
| Naomy  | Testing, QA, Documentation             |

---

# Development Approach

Setiap anggota bertanggung jawab terhadap:

* Frontend feature
* Backend API feature
* Validation
* Database relation/domain feature
* Feature integration testing

Tujuan pendekatan ini:

* Mengurangi mismatch FE & BE
* Mempermudah debugging
* Mempercepat development
* Menjaga consistency feature

---

# Core Features

# 1. Authentication & Authorization

## Features

* Register email/password
* Login email/password
* Google OAuth Login
* Logout
* JWT authentication
* Protected route

---

## Rules

Guest dapat:

* melihat home feed
* melihat detail post

Guest tidak dapat:

* membuat post
* like post
* comment post

---

## User Profile

User dapat:

* edit avatar
* edit nama
* edit email
* edit password

---

# 2. Home Feed

## Features

* Masonry/grid layout ala Pinterest
* Responsive mobile & desktop
* Feed postingan terbaru
* Open detail post

---

## UI Requirements

* Lazy image loading
* Skeleton loading
* Responsive layout

---

# 3. Post & Upload Image

## Features

* Create post
* Upload image
* Edit post
* Delete post
* Detail post page

---

## Rules

* Maksimal 2 postingan per user
* Hanya menerima image
* Tidak menerima video upload

---

## Detail Post

Berisi:

* Gambar utama
* Caption/deskripsi
* Creator info
* Comment section

---

# 4. Comment System

## Features

* Add comment
* 1 level reply comment

---

## Rules

* Maksimal 5 komentar per user
* Tidak wajib edit/delete komentar
* Harus login untuk comment

---

# 5. Like & Notification

## Like

* Like/unlike postingan

---

## Notification

Notifikasi muncul ketika:

* postingan mendapat like
* postingan mendapat comment

---

## Notification Behavior

* Tidak menggunakan realtime websocket
* Notification update menggunakan refresh/re-fetch

---

# Database Main Entities

## Main Tables

* users
* posts
* comments
* post_likes
* notifications

---

# Database Relation

## users

Memiliki:

* posts
* comments
* likes
* notifications

## posts

Memiliki:

* comments
* likes

## comments

Mendukung:

* 1 level reply comment

---

# Suggested Monorepo Structure

```txt
apps/
  frontend/
  backend/

packages/
  shared/
```

---

# Shared Package Responsibilities

## Shared Types

Digunakan bersama frontend & backend:

* DTO types
* API response types
* Constants
* Validation schema

---

# Frontend Architecture

## Zustand (Global Client State)

### Auth Store

Menyimpan:

* user
* token
* auth status

### Notification Store

Menyimpan:

* notifications
* unread count

### UI Store

Menyimpan:

* sidebar state
* modal state
* theme state

---

# TanStack Query (Server State)

Digunakan untuk:

* posts
* comments
* likes
* profile data

---

# API Standardization

## Response Format

```ts
{
  success: boolean,
  message: string,
  data?: any
}
```

Semua endpoint wajib konsisten.

---

# Naming Convention

## Typescript

* camelCase

## Database

* snake_case

---

# Suggested API Endpoints

# Auth

```txt
POST /auth/register
POST /auth/login
POST /auth/google
POST /auth/logout
GET  /auth/me
```

---

# Posts

```txt
GET    /posts
GET    /posts/:id
POST   /posts
PATCH  /posts/:id
DELETE /posts/:id
```

---

# Comments

```txt
POST /posts/:id/comments
POST /comments/:id/reply
```

---

# Likes

```txt
POST /posts/:id/like
```

---

# Notifications

```txt
GET /notifications
```

---

# State Management Rules

## Gunakan Zustand untuk:

* auth
* token/session
* notification badge
* UI state

---

## Jangan Gunakan Zustand untuk:

* form input
* local modal kecil
* server data posts/comments

---

# Git Workflow

## Branch Structure

```txt
main
develop
feature/auth
feature/feed
feature/post
feature/comment
feature/notification
```

---

## Workflow

1. Create feature branch
2. Development
3. Pull request
4. Review
5. Merge ke develop
6. Final merge ke main

---

# Current Capstone Target

## Backend

* AWS Lambda ready
* Database schema ready
* Dummy SQL data ready
* Auth endpoint ready

---

## Frontend

* Landing page ready
* Feature UI ready
* Feed request GET dari backend
* Comment request GET dari backend
* Notification popup menggunakan Sonner

---

# MVP Development Priority

# Phase 1

* Monorepo setup
* Prisma schema
* Shared types
* Landing page
* Auth setup

---

# Phase 2

* Feed API
* Feed UI
* Dummy SQL data
* Comment API
* Comment UI

---

# Phase 3

* Like system
* Notification system
* Protected route

---

# Phase 4

* Deployment
* Testing
* Bug fixing
* Documentation

---

# Recommended Folder Structure

## Frontend

```txt
src/
  components/
  features/
  pages/
  layouts/
  hooks/
  lib/
  services/
  stores/
```

---

## Backend

```txt
src/
  modules/
    auth/
    post/
    comment/
    notification/
```

---

# Main Risks

## High Risk

* AWS deployment
* Image upload handling
* JWT integration
* Merge conflict
* Responsive masonry layout

---

# Mitigation

* Integrasi harian
* Shared types
* Consistent API format
* Early deployment testing

---

# Final Goal

Membangun aplikasi Pinterest Clone yang:

* Responsive
* Fullstack integrated
* Menggunakan modern React architecture
* Memiliki authentication yang aman
* Sesuai spesifikasi PPWL
* Siap deployment production
