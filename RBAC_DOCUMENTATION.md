# Role-Based Access Control (RBAC) Documentation

## Overview

Pinnacle implements a comprehensive role-based access control system with five distinct user roles, each with specific permissions and access levels. This document outlines the roles, their permissions, and the delegation workflow.

## User Roles

### 1. USER (Default Role)
- **Description**: Standard students who can apply for jobs and manage their profiles
- **Permissions**:
  - View and apply to jobs
  - Manage personal profile
  - Upload and manage resumes
  - View applications status
  - Receive notifications
  - View announcements

### 2. ADMIN
- **Description**: General administrative access
- **Permissions**:
  - All USER permissions
  - Create and manage companies
  - Create and manage job postings
  - View and manage all applications
  - Verify user profile items
  - Access admin dashboard
  - Export data

### 3. JPT (Junior Placement Team)
- **Description**: Limited admin access focused on attendance tracking
- **Permissions**:
  - All USER permissions
  - **Mark attendance** for OA (Online Assessments)
  - **Mark attendance** for PPT (Pre-Placement Talks)
  - Bulk mark attendance for multiple students
  - View attendance records
- **Restrictions**:
  - Cannot create jobs
  - Cannot manage companies
  - Cannot verify profiles
  - Cannot grant roles to other users

### 4. SPT (Senior Placement Team)
- **Description**: Senior admin with full access including delegation capabilities
- **Permissions**:
  - All ADMIN permissions
  - **Grant roles** to other users (SPT, JPT, ADMIN)
  - **Revoke roles** from users
  - Search and manage admin users
  - View all admin users list
  - All attendance management capabilities

### 5. SUPER_ADMIN
- **Description**: System-level administrator with complete access
- **Permissions**:
  - All SPT permissions
  - Delete students (soft delete)
  - Restore deleted students
  - System-level configurations
- **Note**: Cannot be revoked through the role management system

## Role Delegation Workflow

### Granting Roles (SPT Only)

SPTs can grant roles to users through the admin panel:

**Endpoint**: `POST /api/admin/roles/grant`

**Request Body**:
```json
{
  "userId": "user-uuid",
  "role": "SPT" | "JPT" | "ADMIN"
}
```

**Response**:
```json
{
  "message": "Role SPT granted successfully to John Doe",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "SPT",
    "updatedAt": "2026-01-21T10:30:00Z"
  }
}
```

### Revoking Roles (SPT Only)

SPTs can revoke roles, which reverts users back to USER role:

**Endpoint**: `POST /api/admin/roles/revoke`

**Request Body**:
```json
{
  "userId": "user-uuid"
}
```

**Response**:
```json
{
  "message": "Role revoked successfully for John Doe. User is now a regular USER",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "updatedAt": "2026-01-21T10:35:00Z"
  }
}
```

### Viewing Admin Users (SPT Only)

**Endpoint**: `GET /api/admin/roles`

Returns all users with admin roles (SUPER_ADMIN, SPT, JPT, ADMIN).

### Searching Users (SPT Only)

**Endpoint**: `GET /api/admin/roles/search?q=search_term`

Search for users by name, email, or student ID to grant roles.

## Attendance Management

### Mark Attendance (JPT and above)

JPTs are specifically designated for managing attendance at company events:

**Endpoint**: `POST /api/jobs/{jobId}/attendance`

**Event Types**:
- `OA` - Online Assessment
- `PPT` - Pre-Placement Talk
- `INTERVIEW` - Interview rounds

**Request Body**:
```json
{
  "userId": "student-uuid",
  "eventType": "PPT",
  "attended": true,
  "remarks": "Present and participated"
}
```

### Bulk Mark Attendance (JPT and above)

**Endpoint**: `POST /api/jobs/{jobId}/attendance/bulk`

**Request Body**:
```json
{
  "attendanceRecords": [
    {
      "userId": "student-uuid-1",
      "attended": true,
      "remarks": "Present"
    },
    {
      "userId": "student-uuid-2",
      "attended": false,
      "remarks": "Absent"
    }
  ]
}
```

### View Attendance Records (Admin and above)

**Endpoint**: `GET /api/jobs/{jobId}/attendance`

Returns all attendance records for a specific job.

**Endpoint**: `GET /api/jobs/{jobId}/attendance/stats`

Returns attendance statistics for a job.

## Middleware Implementation

### Authentication
All admin routes require authentication via JWT token:
```typescript
router.use(authenticateToken);
```

### Role-Based Authorization

#### SPT Access
```typescript
router.use(requireSPT); // Allows SUPER_ADMIN and SPT
```

#### JPT Access
```typescript
router.use(requireJPT); // Allows SUPER_ADMIN and JPT
```

#### Admin Access
```typescript
router.use(requireAdmin); // Allows SUPER_ADMIN, SPT, JPT, and ADMIN
```

## Frontend Integration

### Checking User Role

```typescript
import { useAuth } from '@/contexts/auth-context';

function AdminPanel() {
  const { user } = useAuth();
  
  const isSPT = user?.role === 'SPT' || user?.role === 'SUPER_ADMIN';
  const isJPT = user?.role === 'JPT' || user?.role === 'SUPER_ADMIN';
  
  if (isSPT) {
    // Show role management UI
  }
  
  if (isJPT) {
    // Show attendance management UI
  }
}
```

### API Calls from Frontend

```typescript
import { api } from '@/lib/api';

// Grant role (SPT only)
const grantRole = async (userId: string, role: 'SPT' | 'JPT' | 'ADMIN') => {
  const response = await api.post('/api/admin/roles/grant', {
    userId,
    role
  });
  return response.data;
};

// Mark attendance (JPT and above)
const markAttendance = async (
  jobId: string, 
  userId: string, 
  eventType: 'OA' | 'PPT' | 'INTERVIEW',
  attended: boolean
) => {
  const response = await api.post(`/api/jobs/${jobId}/attendance`, {
    userId,
    eventType,
    attended
  });
  return response.data;
};
```

## Security Considerations

1. **Role Hierarchy**: SUPER_ADMIN role cannot be granted or revoked through the delegation system
2. **Audit Logging**: All role changes are logged with admin ID, timestamp, and old/new roles
3. **Token-Based Auth**: All requests require valid JWT tokens
4. **Rate Limiting**: Admin endpoints have rate limiting to prevent abuse
5. **Input Validation**: All inputs are validated using Zod schemas

## Database Schema

The `User` model includes the role field:

```prisma
model User {
  id    String   @id @default(uuid())
  email String   @unique
  name  String
  role  UserRole @default(USER)
  // ... other fields
}

enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
  JPT
  SPT
}
```

## Testing

### Sample Users for Testing

The seeding script creates test users:
- **Admin**: `admin@university.edu` (password: `admin_pw`)
- **JPT**: `jpt@university.edu`
- **SPT**: `spt@university.edu`

### Test Scenarios

1. **Grant JPT Role**: SPT grants JPT role to a student for attendance duty
2. **Mark Attendance**: JPT marks attendance for students at PPT
3. **Bulk Attendance**: JPT uploads attendance sheet and marks all at once
4. **View Stats**: Admin views attendance statistics for a job
5. **Revoke Role**: SPT revokes JPT role when duty period ends

## Error Handling

Common error responses:

- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User lacks required role permissions
- `404 Not Found`: User or resource not found
- `400 Bad Request`: Invalid input data or role type

## API Summary

| Endpoint | Method | Role Required | Description |
|----------|--------|---------------|-------------|
| `/api/admin/roles` | GET | SPT | List all admin users |
| `/api/admin/roles/search` | GET | SPT | Search users |
| `/api/admin/roles/grant` | POST | SPT | Grant role to user |
| `/api/admin/roles/revoke` | POST | SPT | Revoke role from user |
| `/api/jobs/:jobId/attendance` | POST | JPT+ | Mark attendance |
| `/api/jobs/:jobId/attendance/bulk` | POST | JPT+ | Bulk mark attendance |
| `/api/jobs/:jobId/attendance` | GET | Admin+ | View attendance records |
| `/api/jobs/:jobId/attendance/stats` | GET | Admin+ | View attendance stats |

---

## Quick Start Guide

### For SPTs: Delegating Access

1. Navigate to Admin Dashboard → Role Management
2. Search for the user by name, email, or student ID
3. Select the appropriate role (JPT for attendance, SPT for senior team)
4. Click "Grant Role"
5. User immediately gains the new permissions

### For JPTs: Managing Attendance

1. Navigate to Job Details → Attendance Tab
2. Select event type (OA, PPT, or INTERVIEW)
3. Mark individual students or use bulk upload
4. Add remarks if needed
5. Submit attendance

For questions or issues, contact the development team or file an issue on GitHub.
