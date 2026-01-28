# Kagoshima Event Swipe

鹿児島市内のイベントを直感的に探せる「Tinder風」Webサービス。

## Features

- **Swipe Interface**: Like/Nope/Save gestures for events.
- **Mode Selection**: Curated scoring based on User Persona (Housewife, Worker, Student, Tourist).
- **Admin Panel**: Manage events, CRUD, CSV Import.
- **Saved List**: Review saved events locally.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Prisma (SQLite)
- Framer Motion

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

3. **Run Local Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

4. **Admin Access**
   - URL: `/admin`
   - Password: Defined in `.env` as `ADMIN_PASSWORD` (default: `admin123` if not set).

## Deployment (Vercel)

1. **Environment Variables on Vercel**:
   - `ADMIN_PASSWORD`: Set your secret password.
   - `DATABASE_URL`: For Vercel, you cannot use local SQLite for persistent data easily unless using Vercel Blob/Postgres.
   - **IMPORTANT**: This project uses SQLite. On Vercel (Serverless), SQLite file is not persistent across deployments.
   - **Recommended for Production**: Switch Prisma provider to Vercel Postgres or Neon.
     - Update `prisma/schema.prisma`: `provider = "postgresql"`
     - Update `.env` with Postgres URL.

2. **Build Command**: `npm run build`

## Project Structure

- `src/app`: Page routes
- `src/components`: UI components
- `src/lib`: Utilities and Prisma client
- `prisma`: Database schema and seeds

## CSV Import Format
Headers: `title`, `date` (YYYY-MM-DD HH:mm), `venue`, `area`, `price`, `desc`, `kids` (0/1), `indoor` (0/1)
