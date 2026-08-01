# BlogSphere - Full Stack Blogging Platform (Backend)

A production-ready REST API for a full-stack blogging platform built with Node.js, Express, MongoDB, and JWT authentication.

---

## Project Overview

BlogSphere provides a secure, scalable backend API for managing blog posts, user authentication, comments, and likes. It follows the MVC architecture pattern and is designed to be consumed by any frontend framework.

---

## Folder Structure

```
backend/
├── config/
│   └── db.js                    # MongoDB connection
├── controllers/
│   ├── authController.js        # Authentication logic
│   ├── blogController.js        # Blog & comment logic
│   └── userController.js        # User profile logic
├── middleware/
│   ├── authMiddleware.js        # JWT protection
│   ├── errorHandler.js          # Global error handler
│   └── validateMiddleware.js    # Request validation
├── models/
│   ├── User.js                  # User schema
│   ├── Blog.js                  # Blog schema
│   └── Comment.js               # Comment schema
├── routes/
│   ├── authRoutes.js            # Auth endpoints
│   ├── blogRoutes.js            # Blog endpoints
│   ├── commentRoutes.js         # Comment endpoints
│   └── userRoutes.js            # User endpoints
├── utils/
│   └── generateToken.js         # JWT token generator
├── uploads/                     # Uploaded files directory
├── server.js                    # Entry point
├── .env.example                 # Environment variables template
├── package.json
└── README.md
```

---

## Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your own values
```

---

## Environment Variables

| Variable                | Description                          |
|------------------------|--------------------------------------|
| PORT                   | Server port (default: 3000)         |
| MONGO_URI              | MongoDB Atlas connection string      |
| JWT_SECRET             | JWT signing secret                   |
| NODE_ENV               | Environment (development/production) |
| CLOUDINARY_CLOUD_NAME  | Cloudinary cloud name (optional)     |
| CLOUDINARY_API_KEY     | Cloudinary API key (optional)        |
| CLOUDINARY_API_SECRET  | Cloudinary API secret (optional)     |
| CORS_ORIGIN            | Allowed CORS origin                  |

---

## Run Commands

```bash
# Development
npm run dev

# Production
npm start
```

---

## API Endpoints

### Authentication

| Method | Endpoint          | Description       | Auth |
|--------|-------------------|-------------------|------|
| POST   | /api/auth/register | Register new user | No   |
| POST   | /api/auth/login   | Login user         | No   |
| POST   | /api/auth/logout  | Logout user        | No   |
| GET    | /api/auth/me      | Get current user   | Yes  |

### Blogs

| Method | Endpoint                  | Description          | Auth |
|--------|---------------------------|----------------------|------|
| GET    | /api/blogs                | Get all blogs (search, pagination, sorting, filtering) | No |
| GET    | /api/blogs/:id            | Get single blog     | No   |
| POST   | /api/blogs                | Create blog         | Yes  |
| PUT    | /api/blogs/:id            | Update blog         | Yes* |
| DELETE | /api/blogs/:id            | Delete blog         | Yes* |
| POST   | /api/blogs/:id/like       | Toggle like         | Yes  |
| POST   | /api/blogs/:id/comments  | Add comment         | Yes  |

### Comments

| Method | Endpoint          | Description   | Auth |
|--------|-------------------|---------------|------|
| DELETE | /api/comments/:id | Delete comment | Yes* |

### Query Parameters for GET /api/blogs

| Parameter | Description                     | Example               |
|-----------|---------------------------------|-----------------------|
| search    | Search in title/content/category | `?search=react`      |
| category  | Filter by category               | `?category=Technology` |
| sort      | Sort order (latest/oldest/popular) | `?sort=oldest`     |
| page      | Page number                      | `?page=2`            |
| limit     | Results per page                 | `?limit=10`          |

### Health Check

| Method | Endpoint   | Description      |
|--------|------------|------------------|
| GET    | /api/health | API health check  |

**Auth Key:**
- **Yes*** — Only the owner of the resource can perform this action.
- **Yes** — Any authenticated user can perform this action.

---

## API Response Format

### Success

```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

### Failure

```json
{
  "success": false,
  "message": "...",
  "errors": [ ... ]
}
```

---

## Security Features

- Helmet.js for secure HTTP headers
- Rate limiting (100 requests per 15 minutes per IP)
- CORS with configurable origin
- JWT stored in HttpOnly cookies
- bcrypt password hashing (12 salt rounds)
- Input validation via express-validator
- MongoDB injection protection via Mongoose
- XSS protection

---

## Deployment Notes

1. Set `NODE_ENV=production` in your environment.
2. Set `CORS_ORIGIN` to your frontend URL.
3. Use a strong `JWT_SECRET`.
4. Add `secure: true` to cookies in production (already handled in code).
5. Uploads folder - in production, prefer cloud storage like Cloudinary.
6. Ensure MongoDB Atlas IP whitelist includes your server IP.

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT, bcrypt
- **File Upload:** Multer
- **Security:** Helmet, Rate Limiting, CORS