# QAConnector

QAConnector is a social network REST API built with Express.js and MongoDB, designed for QA professionals to connect, share posts, manage profiles, and interact securely.

## Features
- User registration and authentication (JWT)
- Profile creation, update, and retrieval
- CRUD operations for posts
- Like, comment, and delete posts
- Modular test framework using Jest and Supertest

## Project Structure
```
config/         # Configuration files (MongoDB URI, JWT secret, etc.)
middleware/     # Express middleware (auth, validation)
models/         # Mongoose models (User, Profile, Post)
routes/api/     # API route handlers (users, auth, profile, posts)
tests/          # Modular test files and utilities
```

## Getting Started
### 1. Install dependencies
```powershell
npm install
```

### 2. Set up environment
- Edit `config/default.json` and `config/test.json` for your MongoDB URI and secrets.

### 3. Run the server
```powershell
npm start
```
Or for development with auto-reload:
```powershell
npm run dev
```

### 4. Run tests
```powershell
npm test
```

## API Endpoints
- `POST /api/users` — Register user
- `POST /api/auth` — Authenticate user
- `GET /api/profile` — Get all profiles
- `POST /api/profile` — Create/update profile
- `POST /api/posts` — Create post
- ...and more (see route files)

## Testing
- Tests are organized in `tests/` and use modular utility functions and test data for maintainability.

## Author
Gobinda

## License
MIT
