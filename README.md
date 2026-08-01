# BlogSphere — Full Stack Blogging Platform

A premium full-stack blogging platform. **Next.js 15** frontend (App Router, React 19, TypeScript, Tailwind CSS, Framer Motion) with an **Express + MongoDB** REST API.

```
├── app/            # Next.js 15 App Router pages
├── components/     # Reusable UI components
├── context/        # AuthContext (authentication state)
├── providers/      # Theme + Auth + Toaster providers
├── hooks/          # Custom hooks
├── services/       # Axios API layer
├── lib/            # Helpers (image URL resolution)
├── types/          # TypeScript types
├── utils/          # Formatting & class utilities
├── public/         # Static assets
└── backend/        # Express + MongoDB REST API (see backend/README.md)
```

## Getting Started

### 1. Backend (port 3000)

```bash
cd backend
npm install
copy .env.example .env   # paste your MongoDB Atlas URI + JWT secret
npm run dev
```

### 2. Frontend (port 3001)

```bash
npm install
copy .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:3000/api
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

> **Important:** Add `http://localhost:3001` to the backend's `CORS_ORIGIN` in `backend/.env`, otherwise cookie-based authentication will not work.

## Environment Variables (frontend)

| Variable               | Description                     |
|------------------------|---------------------------------|
| NEXT_PUBLIC_API_URL    | Backend API base URL            |
| NEXT_PUBLIC_SITE_URL   | Frontend site URL               |

## Scripts

| Command             | Description            |
|---------------------|------------------------|
| `npm run dev`       | Start dev server (3001) |
| `npm run build`     | Production build       |
| `npm start`         | Start production server |
| `npm run lint`      | Run ESLint             |

## Pages

- `/` — Landing page (Hero, Features, Latest Blogs, Categories, CTA)
- `/blogs` — Blog listing with search, category filter, sorting, pagination
- `/blogs/:id` — Blog detail with likes & comments
- `/login` / `/register` — Authentication
- `/dashboard` — Writer dashboard with stats and quick actions
- `/create-blog` — Create a post
- `/edit-blog/:id` — Edit / delete a post
- `/profile` — Profile management

## Deployment Notes

- Set `NEXT_PUBLIC_API_URL` to your deployed backend URL.
- Add your backend host to `images.remotePatterns` in `next.config.ts` if it's not `localhost` or `res.cloudinary.com`.
- Deploy the frontend to Vercel and the backend to any Node.js host (Render, Railway, Fly.io, etc.).
