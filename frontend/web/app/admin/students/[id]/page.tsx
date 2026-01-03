'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminService } from '@/services/admin.service';
import type { ApplicationWithDetails } from '@/types/admin.types';

interface StudentData {
  id: string;
  name: string;
  email: string;
  applications: ApplicationWithDetails[];
}

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      setLoading(true);
      try {
        const response = await adminService.getAllApplications({}, { page: 1, limit: 1000 });
        const userApplications = response.data.filter(
          (app) => (app.user?.id || app.userId) === studentId
        );

        if (userApplications.length > 0) {
          const firstApp = userApplications[0];
          setStudent({
            id: studentId,
            name: firstApp.user?.name || 'N/A',
            email: firstApp.user?.email || 'N/A',
            applications: userApplications,
          });
        }
      } catch (error) {
        console.error('Error fetching student:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Student Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested student could not be found.</p>
          <Button onClick={() => router.push('/admin/students')}>Back to Students</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/admin/students')}>
            ← Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Student Profile</h1>
            <p className="text-muted-foreground mt-1">View detailed student information</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">
                {student.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">{student.name}</CardTitle>
              <p className="text-muted-foreground">{student.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Applications</p>
              <p className="font-medium">{student.applications.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Shortlisted</p>
              <p className="font-medium text-blue-600">
                {student.applications.filter((a) => a.status === 'SHORTLISTED').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Accepted</p>
              <p className="font-medium text-green-600">
                {student.applications.filter((a) => a.status === 'ACCEPTED').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
          <p className="text-sm text-muted-foreground">All job applications by this student</p>
        </CardHeader>
        <CardContent>
          {student.applications.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No applications found</p>
          ) : (
            <div className="space-y-4">
              {student.applications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{app.job?.title || 'Unknown Job'}</h4>
                    <p className="text-sm text-muted-foreground">
                      Applied: {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={
                      app.status === 'ACCEPTED'
                        ? 'success'
                        : app.status === 'REJECTED'
                        ? 'destructive'
                        : app.status === 'SHORTLISTED'
                        ? 'default'
                        : 'outline'
                    }
                  >
                    {app.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
