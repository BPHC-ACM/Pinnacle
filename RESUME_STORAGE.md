# Resume Storage Integration with Minio

This document explains how the resume PDF storage has been integrated with Minio (S3-compatible object storage).

## Overview

Users can now generate resume PDFs and store them in Minio cloud storage. Each saved resume can have an associated PDF file stored in the `resumes` bucket.

## Database Schema

### ResumeFile Model
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

## API Endpoints

### 1. Generate and Store Resume PDF
**POST** `/api/resume/generate/:userId`

**Body:**
```json
{
  "resumeId": "uuid-of-saved-resume",
  "saveToStorage": true
}
```

**Response (when saved to storage):**
```json
{
  "message": "Resume generated and saved successfully",
  "fileId": "uuid",
  "downloadUrl": "https://presigned-url...",
  "resumeId": "uuid"
}
```

**Response (direct download):**
- Returns PDF file directly if `saveToStorage` is false or `resumeId` is not provided

### 2. Get Resume Download URL
**GET** `/api/resume/download/:resumeId`

Returns a presigned URL valid for 1 hour to download the stored PDF.

**Response:**
```json
{
  "downloadUrl": "https://presigned-url...",
  "expiresIn": 3600
}
```

### 3. Get Resume File Metadata
**GET** `/api/resume/file-info/:resumeId`

**Response:**
```json
{
  "id": "uuid",
  "resumeId": "uuid",
  "bucket": "resumes",
  "objectKey": "path/to/file.pdf",
  "mimeType": "application/pdf",
  "size": 123456,
  "createdAt": "2025-12-22T00:00:00.000Z"
}
```

### 4. Delete Resume PDF
**DELETE** `/api/resume/file/:resumeId`

Deletes the PDF file from storage and removes the ResumeFile record.

**Response:**
```json
{
  "message": "Resume PDF deleted successfully"
}
```

### 5. Get Saved Resumes (Updated)
**GET** `/api/resume/saved`

Now includes `file` property with metadata if PDF is stored.

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Software Engineer Resume",
    "template": "modern",
    "data": { /* resume data */ },
    "file": {
      "id": "uuid",
      "bucket": "resumes",
      "size": 123456,
      "createdAt": "2025-12-22T00:00:00.000Z"
    },
    "createdAt": "2025-12-22T00:00:00.000Z",
    "updatedAt": "2025-12-22T00:00:00.000Z"
  }
]
```

## Usage Examples

### Example 1: Generate and Save Resume
```javascript
// 1. Create a saved resume first
const resume = await fetch('/api/resume/saved', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'My Resume',
    template: 'modern',
    data: { /* resume data */ }
  })
});
const { id: resumeId } = await resume.json();

// 2. Generate PDF and save to storage
const response = await fetch('/api/resume/generate/my-user-id', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    resumeId,
    saveToStorage: true
  })
});

const { downloadUrl } = await response.json();
console.log('PDF stored! Download URL:', downloadUrl);
```

### Example 2: Download Stored Resume
```javascript
// Get download URL
const response = await fetch('/api/resume/download/resume-uuid');
const { downloadUrl } = await response.json();

// Open in new tab or download
window.open(downloadUrl, '_blank');
```

### Example 3: Check if Resume has PDF
```javascript
const response = await fetch('/api/resume/saved');
const resumes = await response.json();

resumes.forEach(resume => {
  if (resume.file) {
    console.log(`${resume.title} has PDF (${resume.file.size} bytes)`);
  } else {
    console.log(`${resume.title} has no PDF`);
  }
});
```

## Storage Service Architecture

### ResumeStorageService
Located at: `src/services/resume-service/storage/resume-storage.service.ts`

**Methods:**
- `uploadResumePDF(resumeId, pdfBuffer, fileName)` - Upload PDF to Minio
- `getResumeDownloadUrl(resumeId, expiresInSeconds)` - Get presigned download URL
- `deleteResumePDF(resumeId)` - Delete PDF from storage
- `getResumeFileMetadata(resumeId)` - Get file metadata
- `hasStoredPDF(resumeId)` - Check if PDF exists

### File Naming Convention
PDFs are stored with unique keys:
```
{resumeId}/{timestamp}-{hash}-{filename}.pdf
```

Example: `abc-123/1703203200000-a1b2c3d4-John_Doe_Resume.pdf`

## Environment Variables

Make sure these are set in your `.env` file:

```env
MINIO_ACCESS_KEY=minio
MINIO_SECRET_KEY=minio123
```

## Minio Configuration

Default configuration in `src/db/minio.ts`:
```typescript
{
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
}
```

## Notes

1. **Automatic Updates**: When generating a new PDF for an existing resume, the old PDF is automatically deleted and replaced.

2. **Presigned URLs**: Download URLs expire after 1 hour for security. Call the endpoint again to get a fresh URL.

3. **Storage vs Direct Download**: 
   - Use `saveToStorage: true` when user wants to keep the PDF for later
   - Use `saveToStorage: false` or omit for one-time generation/download

4. **File Deletion**: Deleting a saved resume (soft delete) does NOT automatically delete the PDF. Call `/api/resume/file/:resumeId` explicitly if needed.

5. **Multiple Resumes**: Users can have multiple saved resume versions, each with its own stored PDF.

## Migration

Run the migration to create the `ResumeFile` table:
```bash
pnpm prisma migrate dev
```

Ensure Minio is running:
```bash
docker-compose up -d
```
