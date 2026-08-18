# Secure Note-Taking & Aggregation Hub

A secure note-taking platform featuring role-based access control (RBAC), JWT authentication, request validation, and optimized MongoDB index/aggregation patterns.

---

## 🛠️ Technical Stack
* **Backend**: Node.js, Express.js, TypeScript, Mongoose (MongoDB ODM)
* **Frontend**: Vanilla HTML5, CSS3 (Custom design system), Vanilla JavaScript
* **Security & Auth**: JWT (JSON Web Tokens), Bcrypt (Password Hashing)
* **Validation**: Zod (Schema Validation)
* **API Utilities**: Morgan (Logging), Express Rate Limit (DDoS/Brute-force protection)

---

## 📂 Project Structure
```
├── src/
│   ├── app.ts                 # Express application initialization & middleware setup
│   ├── server.ts              # Database connection & server listener
│   ├── config/                # Environment variables configuration
│   ├── errors/                # Global API error handlers
│   ├── helpars/               # Pagination & JWT utility helpers
│   ├── shared/                # Express catchAsync & sendResponse wrappers
│   └── app/
│       ├── middlewares/       # Auth guards & global request validators
│       ├── routes/            # Central application router
│       └── modules/           # Feature modules (Auth, User, Note, Post)
│           ├── Auth/          # Login & registration logic
│           ├── User/          # User CRUD & interests/lookup aggregations
│           ├── Note/          # Paginated Note CRUD with RBAC
│           └── Post/          # Public Post creation & retrieval
├── frontend/                  # Frontend single page application UI
```

---

## 🚀 Local Installation & Setup

### 1. Backend Setup
1. **Clone the repository** and navigate to the project directory:
   ```bash
   cd careguidebdTask
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the root directory (or update the existing one) with:
   ```env
   DATABASE_URL="mongodb+srv://<username>:<password>@cluster.mongodb.net/databaseName"
   PORT=5555
   BCRYPT_SALT_ROUNDS=12
   JWT_SECRET="your-jwt-secret-string"
   EXPIRES_IN="60d"
   ```
4. **Start the development server**:
   ```bash
   npm run dev
   ```
   *The console will display confirmation that the database is connected and the server is listening.*

### 2. Frontend Setup
1. Open [`frontend/app.js`](file:///c:/Amlan/careguidebdTask/frontend/app.js) and ensure the API base URL points to your local server:
   ```javascript
   const API_BASE_URL = 'http://localhost:5555/api/v1';
   ```
2. Serve the `frontend/` directory using a local web server (e.g., Live Server in VS Code, or command-line servers):
   ```bash
   npx http-server ./frontend -p 3000
   ```
3. Navigate to `http://localhost:3000` in your web browser.

---

## 🔒 Roles & Access Control
* **USER**:
  * Can register and authenticate via JWT.
  * Can create, read, update, and delete their own notes.
  * Can write public posts and view the interest directory.
* **ADMIN**:
  * Inherits all User permissions.
  * Can manage all users (create, read, update, and delete any user account).
  * Can view everyone's notes.

---

## ⚡ Indexing Strategy

To achieve maximum performance and prevent full collection scans (`COLLSCAN`), the indexing strategy explicitly defines schemas with the `.index` method as follows:

### 1. User Collection (`UserSchema`)
* **`{ email: 1 }` (Unique)**: Optimizes user lookups during authentication.
* **`{ interests: 1 }`**: Multikey Index for analyzing user interest arrays in Scenario 1.
* **`{ createdAt: -1 }`**: Speeds up admin list operations and sorting.

### 2. Note Collection (`NoteSchema`)
* **`{ userId: 1, createdAt: -1 }`**: Compound Index supporting the equality filter (`userId`) and sort order (`createdAt` desc) for user note feeds (follows the ESR rule).
* **`{ createdAt: -1 }`**: Supports admin notes sorting.

### 3. Post Collection (`PostSchema`)
* **`{ userId: 1 }`**: Crucial index to prevent collection scans during `$lookup` aggregation joins from the `User` collection.

---

## 🧩 MongoDB Aggregation Tasks

### Scenario 1: Group Users by Interests
* **Endpoint**: `GET /api/v1/users/by-interests`
* **Access**: USER, ADMIN
* **Pipeline**:
  1. `$unwind`: Normalizes the user profile interests array.
  2. `$group`: Groups users by the unwound interests, assembling matching user metadata (`_id`, `email`) into a target bucket array.

### Scenario 2: User Posts ($lookup)
* **Endpoint**: `GET /api/v1/users/:id/posts`
* **Access**: USER, ADMIN
* **Pipeline**:
  1. `$match`: Selects the target user profile by unique `_id`.
  2. `$lookup`: Joins related posts belonging to the user from the `posts` collection using the indexed `userId` key.

---

## 📡 API Reference

### Authentication
* `POST /api/v1/auth/register` - Create a new user profile
* `POST /api/v1/auth/login` - Authenticate and acquire JWT Access Token

### Notes CRUD
* `POST /api/v1/notes` - Create a note (Authenticated)
* `GET /api/v1/notes?page=1&limit=10` - List notes (User gets own notes; Admin gets all notes)
* `GET /api/v1/notes/:id` - Get a note by ID (RBAC protected)
* `PUT /api/v1/notes/:id` - Update a note (Owner only)
* `DELETE /api/v1/notes/:id` - Delete a note (Owner only)

### Public Posts
* `POST /api/v1/posts` - Publish a public post (Authenticated)
* `GET /api/v1/posts?page=1&limit=10` - List all public posts (Public access)

### Users & Aggregations (Admin-managed)
* `GET /api/v1/users/by-interests` - Group users by interest directory
* `GET /api/v1/users/:id/posts` - Get user profile and complete stream of posts (Scenario 2)
* `POST /api/v1/users` - Admin: Create new user
* `GET /api/v1/users?page=1&limit=8` - Admin: List users
* `GET /api/v1/users/:id` - Admin: Fetch user profile
* `PUT /api/v1/users/:id` - Admin: Update user
* `DELETE /api/v1/users/:id` - Admin: Delete user
