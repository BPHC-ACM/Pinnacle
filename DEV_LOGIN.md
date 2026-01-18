# Dev Login for Testing

## Test Admin Credentials

For testing the admin frontend without Google OAuth, use these credentials:

- **Email**: `admin@gmail.com`
- **Password**: `admin_pw`

## How to Use

### Option 1: Using the Dev Login Page

1. Start the backend server:

   ```bash
   cd backend
   pnpm run dev
   ```

2. Start the frontend:

   ```bash
   cd frontend/web
   pnpm run dev
   ```

3. Navigate to: `http://localhost:3000/dev-login`

4. Enter the credentials above and click Login

5. You'll be redirected to the admin dashboard

### Option 2: Using curl to get tokens

```bash
curl -X POST http://localhost:3000/api/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"admin_pw"}'
```

Response:

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {
    "id": "...",
    "email": "admin@gmail.com",
    "name": "Admin User",
    "role": "ADMIN"
  }
}
```

## Important Notes

- This endpoint is **ONLY available in development mode** (NODE_ENV !== 'production')
- The admin user is created automatically when you run the database seed
- The dev login endpoint is at: `POST /api/auth/dev-login`
- Tokens are stored in localStorage when using the web interface

## Backend Implementation

The dev login controller checks:

1. If NODE_ENV is production → returns 403
2. If credentials match admin@gmail.com / admin_pw
3. Finds or creates the admin user with ADMIN role
4. Returns JWT access and refresh tokens

## Frontend Implementation

The dev login page at `/dev-login`:

- Pre-fills the admin credentials
- Posts to the dev-login endpoint
- Stores tokens in localStorage
- Redirects to /admin/dashboard

## Security

⚠️ **WARNING**: This is only for development testing. Never use this in production!
