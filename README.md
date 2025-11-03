# ACM-X-PU

## Setup

### 1. Install Dependencies

```bash
pnpm install
pnpm run prepare
```

### 2. Environment Variables

Copy the example environment file and update with your values:

```bash
cp .env.example .env
```

Update the following variables in `.env`:

- `GOOGLE_CLIENT_ID` - Your Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Your Google OAuth Client Secret
- `JWT_SECRET` - A secure random string for JWT signing
- `JWT_REFRESH_SECRET` - A secure random string for refresh token signing

### 3. Database Setup

Start the PostgreSQL database using Docker:

```bash
docker compose -f docker.compose.yml up -d
```

Run Prisma migrations:

```bash
pnpm prisma migrate dev
```

Generate Prisma Client:

```bash
pnpm prisma generate
```

To stop the database:

```bash
docker compose -f docker.compose.yml down
```

## Commands

```bash
pnpm run dev          # Development mode
pnpm run build        # Build
pnpm start            # Run production build
pnpm run lint         # Check linting
pnpm run lint:fix     # Fix linting issues
pnpm run format       # Format code
pnpm run type-check   # TypeScript check
pnpm run validate     # Run all checks
```

## Pre-Push Protection

Automated checks run before every push:

- Code formatting
- ESLint validation
- TypeScript type checking
- Build compilation

## License

See [LICENSE](LICENSE) file.
