'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Job {
  id: string;
  title: string;
  company: { name: string };
}

interface Student {
  id: string;
  name: string;
  studentId: string;
  branch: string;
}

interface AttendanceRecord {
  userId: string;
  attended: boolean;
  remarks?: string;
}

export default function AttendanceTracking() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [eventType, setEventType] = useState<'OA' | 'PPT' | 'INTERVIEW'>('OA');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Map<string, AttendanceRecord>>(
    new Map(),
  );
  const [loading, setLoading] = useState(false);

  // Check if user is JPT (restricted to OA and PPT only)
  const isJPT = user?.role === 'JPT';
  const canAccessInterview = ['SPT'].includes(user?.role || '');

  const fetchJobs = useCallback(async () => {
    try {
      const response = await api.get('/jobs?limit=100');
      setJobs(response.data.data || []);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load jobs',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const fetchJobApplications = useCallback(async () => {
    try {
      const response = await api.get(`/api/jobs/${selectedJob}/applications`);
      // Extract unique students from applications
      const uniqueStudents = new Map();
      response.data.forEach(
        (app: { user?: { id: string; name: string; studentId?: string; branch?: string } }) => {
          if (app.user && !uniqueStudents.has(app.user.id)) {
            uniqueStudents.set(app.user.id, {
              id: app.user.id,
              name: app.user.name,
              studentId: app.user.studentId || 'N/A',
              branch: app.user.branch || 'N/A',
            });
          }
        },
      );
      setStudents(Array.from(uniqueStudents.values()));
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load applicants',
        variant: 'destructive',
      });
    }
  }, [selectedJob, toast]);

  const fetchExistingAttendance = useCallback(async () => {
    try {
      const response = await api.get(`/api/jobs/${selectedJob}/attendance?eventType=${eventType}`);
      const existingRecords = new Map<string, AttendanceRecord>();
      response.data.forEach((record: { userId: string; attended: boolean; remarks?: string }) => {
        existingRecords.set(record.userId, {
          userId: record.userId,
          attended: record.attended,
          remarks: record.remarks,
        });
      });
      setAttendanceRecords(existingRecords);
    } catch (error) {
      console.error('Failed to load existing attendance:', error);
    }
  }, [selectedJob, eventType]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    if (selectedJob) {
      fetchJobApplications();
      fetchExistingAttendance();
    }
  }, [selectedJob, eventType, fetchJobApplications, fetchExistingAttendance]);

  const updateAttendance = (userId: string, attended: boolean, remarks?: string) => {
    const newRecords = new Map(attendanceRecords);
    newRecords.set(userId, { userId, attended, remarks });
    setAttendanceRecords(newRecords);
  };

  const handleSubmit = async () => {
    if (!selectedJob) {
      toast({
        title: 'Error',
        description: 'Please select a job',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const recordsArray = Array.from(attendanceRecords.values());
      await api.post(`/api/jobs/${selectedJob}/attendance/bulk`, {
        eventType,
        attendanceRecords: recordsArray,
      });

      toast({
        title: 'Success',
        description: `Attendance marked for ${recordsArray.length} student(s)`,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to mark attendance',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAll = (attended: boolean) => {
    const newRecords = new Map(attendanceRecords);
    students.forEach((student) => {
      newRecords.set(student.id, {
        userId: student.id,
        attended,
        remarks: attendanceRecords.get(student.id)?.remarks,
      });
    });
    setAttendanceRecords(newRecords);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Select Job</Label>
          <Select value={selectedJob} onValueChange={setSelectedJob}>
            <SelectTrigger>
              <SelectValue placeholder="Select a job" />
            </SelectTrigger>
            <SelectContent>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.company.name} - {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Event Type</Label>
          <Select
            value={eventType}
            onValueChange={(value) => setEventType(value as 'OA' | 'PPT' | 'INTERVIEW')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OA">Online Assessment</SelectItem>
              <SelectItem value="PPT">Pre-Placement Talk</SelectItem>
              {canAccessInterview && <SelectItem value="INTERVIEW">Interview</SelectItem>}
            </SelectContent>
          </Select>
          {isJPT && (
            <p className="text-sm text-muted-foreground mt-1">
              JPT can only manage OA and PPT attendance
            </p>
          )}
        </div>

        <div className="flex items-end gap-2">
          <Button variant="outline" onClick={() => handleMarkAll(true)}>
            Mark All Present
          </Button>
          <Button variant="outline" onClick={() => handleMarkAll(false)}>
            Mark All Absent
          </Button>
        </div>
      </div>

      {selectedJob && students.length > 0 && (
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Attended</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const record = attendanceRecords.get(student.id);
                return (
                  <TableRow key={student.id}>
                    <TableCell>{student.studentId}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.branch}</TableCell>
                    <TableCell>
                      <Checkbox
                        checked={record?.attended || false}
                        onCheckedChange={(checked) =>
                          updateAttendance(student.id, checked as boolean, record?.remarks)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Add remarks..."
                        value={record?.remarks || ''}
                        onChange={(e) =>
                          updateAttendance(student.id, record?.attended || false, e.target.value)
                        }
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="mt-4 flex justify-end">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : 'Save Attendance'}
            </Button>
          </div>
        </div>
      )}

      {selectedJob && students.length === 0 && (
        <p className="text-center text-muted-foreground">No applicants found for this job.</p>
      )}
    </div>
  );
}
