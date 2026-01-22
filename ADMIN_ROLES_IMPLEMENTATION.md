# Admin Roles Implementation Summary

## Overview
Implemented a two-tier admin access system with **SPT (Student Placement Team)** having maximum access and **JPT (Job Placement Team)** having limited admin access restricted to OA and PPT attendance only.

## Changes Made

### 1. Database Schema (AdminRole Table)
**File:** `packages/database/prisma/schema.prisma`

Added new `AdminRole` model to track admin role grants:
- **Purpose:** Audit trail of who granted admin access and when
- **Fields:**
  - `userId` - User who received admin access
  - `role` - Role granted (SPT or JPT)
  - `grantedBy` - SPT who granted the role
  - `grantedAt` - Timestamp of grant
  - `revokedAt` - Timestamp of revocation (null if active)
  - `revokedBy` - SPT who revoked the role
  - `isActive` - Whether role is currently active
  - `remarks` - Optional notes

**Migration:** Created migration file at `packages/database/prisma/migrations/20260122_add_admin_role_table/migration.sql`

### 2. Backend - Middleware Updates
**File:** `backend/src/middleware/role.middleware.ts`

Added `restrictJPTAttendance` middleware:
- **Purpose:** Enforce JPT restriction to OA and PPT attendance only
- **Logic:**
  - SPT and SUPER_ADMIN: Full access to all attendance types
  - JPT: Only OA (Online Assessment) and PPT (Pre-Placement Talk) attendance
  - Returns 403 error if JPT tries to access INTERVIEW attendance

### 3. Backend - Route Protection
**File:** `backend/src/routes/job.routes.ts`

Updated attendance routes to apply new middleware:
```typescript
// JPT can only mark OA and PPT attendance
router.post('/:jobId/attendance', 
  authenticateToken, 
  requireJPT, 
  restrictJPTAttendance,  // NEW: Restricts JPT access
  validateBody(markAttendanceSchema), 
  markAttendance
);
```

### 4. Backend - Role Management Controller
**File:** `backend/src/controllers/role-management.controller.ts`

Updated functions to use AdminRole table:

**`grantRole()`:**
- Creates entry in `AdminRole` table when granting SPT/JPT access
- Tracks who granted the role and when
- Optional remarks field for notes
- Validates no duplicate active roles

**`revokeRole()`:**
- Updates `AdminRole` entries to mark as inactive
- Records who revoked and when
- Updates User role back to USER

**`getAdminRoleHistory()` (NEW):**
- Returns history of all role grants and revocations
- Shows grantor and revoker details
- Useful for audit and compliance

### 5. Backend - Role Management Routes
**File:** `backend/src/routes/role-management.routes.ts`

Added new route:
- `GET /api/admin/roles/history` - View admin role grant/revoke history

Updated schemas to include optional `remarks` field.

## Access Matrix

| Role | Attendance Access | Can Grant Roles | Can View History |
|------|------------------|-----------------|------------------|
| **SUPER_ADMIN** | All (OA, PPT, INTERVIEW) | ❌ | ✅ |
| **SPT** | All (OA, PPT, INTERVIEW) | ✅ (Can grant SPT/JPT/ADMIN) | ✅ |
| **JPT** | OA, PPT only | ❌ | ❌ |
| **ADMIN** | All (OA, PPT, INTERVIEW) | ❌ | ❌ |
| **USER** | None | ❌ | ❌ |

## API Endpoints

### Role Management (SPT Only)
- `GET /api/admin/roles` - List all admin users
- `GET /api/admin/roles/search?q=query` - Search users to grant roles
- `GET /api/admin/roles/history?userId=xxx` - View role history
- `POST /api/admin/roles/grant` - Grant SPT/JPT/ADMIN role
  ```json
  {
    "userId": "uuid",
    "role": "SPT" | "JPT" | "ADMIN",
    "remarks": "Optional reason"
  }
  ```
- `POST /api/admin/roles/revoke` - Revoke admin role
  ```json
  {
    "userId": "uuid",
    "remarks": "Optional reason"
  }
  ```

### Attendance (JPT restricted to OA/PPT)
- `POST /api/jobs/:jobId/attendance` - Mark single attendance
- `POST /api/jobs/:jobId/attendance/bulk` - Bulk mark attendance
- `GET /api/jobs/:jobId/attendance` - View attendance records
- `GET /api/jobs/:jobId/attendance/stats` - View attendance statistics

## Next Steps

### Database Migration
When database is running:
```bash
cd packages/database
pnpm prisma migrate dev
pnpm prisma generate
```

### Frontend Integration
Create admin panel UI components:
1. **Role Management Page** - For SPTs to grant/revoke roles
2. **Role History View** - Audit trail of role changes
3. **Restricted Access UI** - Show JPT users they can only access OA/PPT

### Testing
1. Test SPT can grant roles and see history
2. Test JPT cannot access INTERVIEW attendance
3. Test JPT can access OA and PPT attendance
4. Test role revocation works correctly
5. Test AdminRole table audit trail

## Security Notes

- ✅ Only SPT can grant/revoke admin roles
- ✅ SUPER_ADMIN role cannot be revoked
- ✅ All role changes are audited in AdminRole table
- ✅ JPT restricted to OA and PPT attendance only
- ✅ Transaction-safe role updates (User + AdminRole updated atomically)
