'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';
import { UserRole } from '@/types/auth.types';

// Import sub-components
import StudentManagement from '@/components/admin/StudentManagement';
import AttendanceTracking from '@/components/admin/AttendanceTracking';
import JobEligibilityManager from '@/components/admin/JobEligibilityManager';
import JobScheduling from '@/components/admin/JobScheduling';
import RoleManagement from '@/components/admin/RoleManagement';

interface DashboardStats {
  totalStudents: number;
  frozenStudents: number;
  activeJobs: number;
  pendingApplications: number;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load dashboard stats',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const userRole = user?.role as UserRole;

  // Check if user has required permissions
  const canManageStudents = ['SPT'].includes(userRole);
  const canTrackAttendance = ['JPT', 'SPT'].includes(userRole);
  const canManageEligibility = ['SPT'].includes(userRole);
  const canScheduleJobs = ['SPT'].includes(userRole);
  const canManageRoles = ['SPT'].includes(userRole); // Only SPT can manage roles

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Role: <span className="font-semibold">{userRole}</span>
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalStudents}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Frozen Students</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-600">{stats.frozenStudents}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{stats.activeJobs}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{stats.pendingApplications}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs for different functionalities */}
      <Tabs defaultValue={canTrackAttendance ? 'attendance' : 'students'} className="space-y-4">
        <TabsList>
          {canTrackAttendance && <TabsTrigger value="attendance">Attendance</TabsTrigger>}
          {canManageStudents && <TabsTrigger value="students">Student Management</TabsTrigger>}
          {canManageEligibility && <TabsTrigger value="eligibility">Eligibility</TabsTrigger>}
          {canScheduleJobs && <TabsTrigger value="scheduling">Job Scheduling</TabsTrigger>}
          {canManageRoles && <TabsTrigger value="roles">Role Management</TabsTrigger>}
        </TabsList>

        {canTrackAttendance && (
          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>OA/PPT Attendance Tracking</CardTitle>
                <CardDescription>
                  Mark and track attendance for OA, PPT, and Interviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AttendanceTracking />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {canManageStudents && (
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Student Management</CardTitle>
                <CardDescription>Manage student accounts, freeze, and delete</CardDescription>
              </CardHeader>
              <CardContent>
                <StudentManagement />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {canManageEligibility && (
          <TabsContent value="eligibility">
            <Card>
              <CardHeader>
                <CardTitle>Job Eligibility Management</CardTitle>
                <CardDescription>Configure eligibility criteria for jobs</CardDescription>
              </CardHeader>
              <CardContent>
                <JobEligibilityManager />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {canScheduleJobs && (
          <TabsContent value="scheduling">
            <Card>
              <CardHeader>
                <CardTitle>Job Scheduling</CardTitle>
                <CardDescription>Update OA, PPT, and interview schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <JobScheduling />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {canManageRoles && (
          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <CardTitle>Role Management</CardTitle>
                <CardDescription>
                  Grant and revoke admin roles (SPT, JPT) with full audit trail
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RoleManagement />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
