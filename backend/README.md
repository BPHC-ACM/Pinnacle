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

## CDN Integration for File Uploads

### Overview

The application uses **Minio** (S3-compatible object storage) for storing and serving files through CDN. The following file types are supported:

1. **User Profile Pictures** - Profile images for users
2. **Company Logos** - Brand logos for companies (displayed on job postings via company relation)
3. **Job Description Documents** - PDF/Word documents for detailed job descriptions
4. **Resume PDFs** - Generated resume files (covered in previous section)

### Storage Buckets

The following Minio buckets are created automatically on application startup:

- `profile-pictures` - User profile images
- `company-logos` - Company brand logos
- `job-documents` - Job description documents
- `resumes` - Generated resume PDFs

### File Upload Limits & Restrictions

#### Images (Profile Pictures, Company Logos)

- **Allowed MIME Types**: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- **Maximum Size**: 5 MB
- **Storage**: Files are stored with unique keys: `{entityId}/{timestamp}-{hash}-{filename}`

#### Documents (Job Descriptions)

- **Allowed MIME Types**: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Maximum Size**: 10 MB
- **Storage**: Files are stored with unique keys: `{jobId}/{timestamp}-{hash}-{filename}`

### Security Features

1. **Authentication Required** - All upload endpoints require valid JWT tokens
2. **Admin Authorization** - Company and job-related uploads require admin role
3. **File Type Validation** - Only allowed MIME types are accepted
4. **File Size Limits** - Maximum sizes enforced (5MB for images, 10MB for documents)
5. **Presigned URLs** - Files are served via presigned URLs with 1-year expiration
6. **Unique File Names** - Files are stored with hash-based unique keys to prevent conflicts

### Important Notes

1. **Automatic URL Updates**: Uploading a new file automatically replaces the old URL in the database
2. **Manual Deletion**: Old files are NOT automatically deleted from storage when new files are uploaded (to prevent breaking cached URLs)
3. **Presigned URLs**: URLs expire after 1 year. Consider implementing a refresh mechanism in the frontend
4. **Multiple Uploads**: Users can upload multiple times, but only the latest URL is stored
5. **External URLs**: The system maintains external URLs (e.g., Google OAuth profile pictures) until a new file is uploaded

## License

See [LICENSE](../LICENSE) file.
