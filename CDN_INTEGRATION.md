# CDN Integration Documentation

This document explains the CDN integration for file uploads in the ACM-X-PU backend.

## Overview

The application uses **Minio** (S3-compatible object storage) for storing and serving files through CDN. The following file types are supported:

1. **User Profile Pictures** - Profile images for users
2. **Company Logos** - Brand logos for companies
3. **Job Logos** - Images for job postings
4. **Job Description Documents** - PDF/Word documents for detailed job descriptions
5. **Resume PDFs** - Generated resume files (already implemented)

## Storage Buckets

The following Minio buckets are created automatically on application startup:

- `profile-pictures` - User profile images
- `company-logos` - Company brand logos
- `job-images` - Job posting images
- `job-documents` - Job description documents
- `resumes` - Generated resume PDFs

## File Upload Limits & Restrictions

### Images (Profile Pictures, Company Logos, Job Logos)
- **Allowed MIME Types**: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- **Maximum Size**: 5 MB
- **Storage**: Files are stored with unique keys: `{entityId}/{timestamp}-{hash}-{filename}`

### Documents (Job Descriptions)
- **Allowed MIME Types**: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Maximum Size**: 10 MB
- **Storage**: Files are stored with unique keys: `{jobId}/{timestamp}-{hash}-{filename}`

## API Endpoints

### User Profile Picture

#### Upload Profile Picture
```http
POST /api/upload/profile-picture
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data

Body: {
  file: (binary)
}
```

**Response:**
```json
{
  "url": "https://presigned-url...",
  "message": "Profile picture uploaded successfully"
}
```

#### Delete Profile Picture
```http
DELETE /api/upload/profile-picture
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "message": "Profile picture deleted successfully"
}
```

---

### Company Logo (Admin Only)

#### Upload Company Logo
```http
POST /api/upload/company-logo/:companyId
Authorization: Bearer {jwt_admin_token}
Content-Type: multipart/form-data

Body: {
  file: (binary)
}
```

**Response:**
```json
{
  "url": "https://presigned-url...",
  "message": "Company logo uploaded successfully"
}
```

#### Delete Company Logo
```http
DELETE /api/upload/company-logo/:companyId
Authorization: Bearer {jwt_admin_token}
```

**Response:**
```json
{
  "message": "Company logo deleted successfully"
}
```

---

### Job Logo (Admin Only)

#### Upload Job Logo
```http
POST /api/upload/job-logo/:jobId
Authorization: Bearer {jwt_admin_token}
Content-Type: multipart/form-data

Body: {
  file: (binary)
}
```

**Response:**
```json
{
  "url": "https://presigned-url...",
  "message": "Job logo uploaded successfully"
}
```

---

### Job Description Document (Admin Only)

#### Upload Job Document
```http
POST /api/upload/job-document/:jobId
Authorization: Bearer {jwt_admin_token}
Content-Type: multipart/form-data

Body: {
  file: (binary)
}
```

**Response:**
```json
{
  "url": "https://presigned-url...",
  "message": "Job document uploaded successfully"
}
```

## Usage Examples

### Frontend - Upload Profile Picture

```typescript
async function uploadProfilePicture(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload/profile-picture', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const data = await response.json();
  console.log('Profile picture URL:', data.url);
}
```

### Frontend - Upload Company Logo (Admin)

```typescript
async function uploadCompanyLogo(companyId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/upload/company-logo/${companyId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
    body: formData,
  });

  const data = await response.json();
  console.log('Company logo URL:', data.url);
}
```

### Frontend - Upload Job Document (Admin)

```typescript
async function uploadJobDocument(jobId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/upload/job-document/${jobId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
    body: formData,
  });

  const data = await response.json();
  console.log('Job document URL:', data.url);
}
```

## Database Schema

### User Model
```prisma
model User {
  id      String  @id @default(uuid())
  email   String  @unique
  name    String
  picture String? // CDN URL for profile picture
  // ...
}
```

### Company Model
```prisma
model Company {
  id   String  @id @default(uuid())
  name String
  logo String? // CDN URL for company logo
  // ...
}
```

### Job Model
```prisma
model Job {
  id                  String  @id @default(uuid())
  title               String
  description         String?
  descriptionDocument String? // CDN URL for job description document
  logo                String? // CDN URL for job logo
  // ...
}
```

## Environment Variables

Required Minio configuration in `.env`:

```env
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minio
MINIO_SECRET_KEY=minio123
```

## Security Features

1. **Authentication Required** - All upload endpoints require valid JWT tokens
2. **Admin Authorization** - Company and job-related uploads require admin role
3. **File Type Validation** - Only allowed MIME types are accepted
4. **File Size Limits** - Maximum sizes enforced (5MB for images, 10MB for documents)
5. **Presigned URLs** - Files are served via presigned URLs with 1-year expiration
6. **Unique File Names** - Files are stored with hash-based unique keys to prevent conflicts

## Error Handling

Common error responses:

```json
// No file provided
{
  "error": "No file uploaded"
}

// Invalid file type
{
  "error": "Invalid file type. Allowed: image/jpeg, image/png, image/webp, image/gif"
}

// File too large
{
  "error": "File too large. Maximum size: 5MB"
}

// Unauthorized
{
  "error": "Authentication required"
}

// Not found
{
  "error": "Company not found"
}
```

## Notes

1. **Automatic URL Updates**: Uploading a new file automatically replaces the old URL in the database
2. **Manual Deletion**: Old files are NOT automatically deleted from storage when new files are uploaded (to prevent breaking cached URLs)
3. **Presigned URLs**: URLs expire after 1 year. Consider implementing a refresh mechanism in the frontend
4. **Multiple Uploads**: Users can upload multiple times, but only the latest URL is stored
5. **Direct Database Updates**: URLs in the database can be manually set via API (useful for migrating existing images)

## Migration from External CDNs

If you have existing images hosted on external CDNs (e.g., Google OAuth profile pictures):

1. The system will maintain external URLs until a new file is uploaded
2. No automatic migration - external URLs remain valid
3. To migrate: Download external image → Upload via API → Database automatically updates

## Performance Considerations

1. **Presigned URLs**: 1-year expiration reduces backend load for URL generation
2. **Bucket Separation**: Different buckets for different file types improve organization
3. **Memory Storage**: Multer uses memory storage for small files (< 5-10MB)
4. **Parallel Uploads**: Multiple files can be uploaded simultaneously
5. **CDN Caching**: Consider adding CloudFront or similar CDN in front of Minio for production
