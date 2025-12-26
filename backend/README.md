# Pinnacle Backend

Backend API for the Pinnacle recruitment platform.

## Setup

### 1. Clone the Repository

```bash
git clone <repo-url>
cd Pinnacle/backend
```

### 2. Install Dependencies

```bash
pnpm install
pnpm run prepare
```

### 3. Environment Variables

Copy the example environment file and update with your values:

```bash
cp .env.example .env
```

Update the following variables in `.env`:

- `DATABASE_URL` - PostgreSQL connection string (default: `postgresql://postgres:password@localhost:5433/pinnacle?schema=public`)
- `GOOGLE_CLIENT_ID` - Your Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Your Google OAuth Client Secret
- `JWT_SECRET` - A secure random string for JWT signing
- `JWT_REFRESH_SECRET` - A secure random string for refresh token signing

### 4. Database Setup

Start the PostgreSQL database using Docker:

```bash
docker compose -f docker-compose.yml up -d
```

This will:

- Start Postgres inside Docker
- Expose it on localhost:5433
- Create the database with the correct name, user, and password

Run Prisma migrations to create the database schema:

```bash
pnpm prisma migrate dev
```

This will:

- Create tables in the database
- Generate the Prisma Client

Generate Prisma Client (if not done automatically):

```bash
pnpm prisma generate
```

### 5. (Optional) View the Database

To open Prisma Studio (DB UI):

```bash
pnpm prisma studio
```

To stop the database:

```bash
docker compose -f docker-compose.yml down
```

## Development

### Commands

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

### Pre-Push Protection

Automated checks run before every push:

- Code formatting
- ESLint validation
- TypeScript type checking
- Build compilation

## Resume Storage with Minio

### Overview

Users can generate resume PDFs and store them in Minio (S3-compatible object storage). Each saved resume can have an associated PDF file stored in the `resumes` bucket.

### Database Schema

The `ResumeFile` model stores metadata about stored PDFs:

```prisma
model ResumeFile {
  id         String   @id @default(uuid())
  resumeId   String   @unique
  bucket     String   // Storage bucket name
  objectKey  String   // Unique file path in bucket
  mimeType   String   // application/pdf
  size       Int      // File size in bytes
  createdAt  DateTime @default(now())
  resume     Resume   @relation(fields: [resumeId], references: [id], onDelete: Cascade)
}
```

### API Endpoints

#### 1. Generate and Store Resume PDF

**POST** `/api/resume/generate/:userId`

```json
{
  "resumeId": "uuid-of-saved-resume",
  "saveToStorage": true
}
```

Response when saved to storage:

```json
{
  "message": "Resume generated and saved successfully",
  "fileId": "uuid",
  "downloadUrl": "https://presigned-url...",
  "resumeId": "uuid"
}
```

Returns PDF file directly if `saveToStorage` is false or `resumeId` is not provided.

#### 2. Get Resume Download URL

**GET** `/api/resume/download/:resumeId`

Returns a presigned URL valid for 1 hour to download the stored PDF.

#### 3. Get Resume File Metadata

**GET** `/api/resume/file-info/:resumeId`

#### 4. Delete Resume PDF

**DELETE** `/api/resume/file/:resumeId`

#### 5. Get Saved Resumes

**GET** `/api/resume/saved`

Now includes `file` property with metadata if PDF is stored.

### Environment Variables for Minio

Add these to your `.env` file:

```env
MINIO_ACCESS_KEY=minio
MINIO_SECRET_KEY=minio123
```

### Important Notes

1. **Automatic Updates**: When generating a new PDF for an existing resume, the old PDF is automatically deleted and replaced.

2. **Presigned URLs**: Download URLs expire after 1 hour for security. Call the endpoint again to get a fresh URL.

3. **Storage vs Direct Download**:
   - Use `saveToStorage: true` when user wants to keep the PDF for later
   - Use `saveToStorage: false` or omit for one-time generation/download

4. **File Deletion**: Deleting a saved resume (soft delete) does NOT automatically delete the PDF. Call `/api/resume/file/:resumeId` explicitly if needed.

5. **File Naming**: PDFs are stored with unique keys: `{resumeId}/{timestamp}-{hash}-{filename}.pdf`

## License

See [LICENSE](../LICENSE) file.
