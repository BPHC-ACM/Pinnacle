'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
  branch: string;
  currentYear: number;
  isFrozen: boolean;
}

export default function StudentManagement() {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'freeze' | 'delete';
    studentId: string;
    studentName: string;
    isFrozen: boolean;
  }>({
    open: false,
    type: 'freeze',
    studentId: '',
    studentName: '',
    isFrozen: false,
  });

  const fetchStudents = useCallback(async () => {
    try {
      const response = await api.get(`/api/admin/students?search=${search}&limit=50`);
      setStudents(response.data.students || []);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load students',
        variant: 'destructive',
      });
    }
  }, [search, toast]);

  useEffect(() => {
    fetchStudents();
  }, [search, fetchStudents]);

  const toggleFreeze = async (userId: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      await api.post('/api/admin/students/freeze', {
        userId,
        isFrozen: !currentStatus,
      });

      toast({
        title: 'Success',
        description: `Student ${!currentStatus ? 'frozen' : 'unfrozen'} successfully`,
      });

      fetchStudents();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to update student status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setConfirmDialog({
        open: false,
        type: 'freeze',
        studentId: '',
        studentName: '',
        isFrozen: false,
      });
    }
  };

  const deleteStudent = async (userId: string) => {
    setLoading(true);
    try {
      await api.delete(`/api/admin/students/${userId}`);

      toast({
        title: 'Success',
        description: 'Student deleted successfully',
      });

      fetchStudents();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to delete student',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setConfirmDialog({
        open: false,
        type: 'delete',
        studentId: '',
        studentName: '',
        isFrozen: false,
      });
    }
  };

  const handleConfirmAction = () => {
    if (confirmDialog.type === 'freeze') {
      toggleFreeze(confirmDialog.studentId, confirmDialog.isFrozen);
    } else {
      deleteStudent(confirmDialog.studentId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search by name, email, or student ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell>{student.studentId || 'N/A'}</TableCell>
              <TableCell>{student.name}</TableCell>
              <TableCell>{student.email}</TableCell>
              <TableCell>{student.branch || 'N/A'}</TableCell>
              <TableCell>{student.currentYear || 'N/A'}</TableCell>
              <TableCell>
                {student.isFrozen ? (
                  <Badge variant="destructive">Frozen</Badge>
                ) : (
                  <Badge variant="default">Active</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setConfirmDialog({
                        open: true,
                        type: 'freeze',
                        studentId: student.id,
                        studentName: student.name,
                        isFrozen: student.isFrozen,
                      })
                    }
                    disabled={loading}
                  >
                    {student.isFrozen ? 'Unfreeze' : 'Freeze'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      setConfirmDialog({
                        open: true,
                        type: 'delete',
                        studentId: student.id,
                        studentName: student.name,
                        isFrozen: student.isFrozen,
                      })
                    }
                    disabled={loading}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {students.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No students found.</p>
      )}

      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.type === 'freeze'
                ? confirmDialog.isFrozen
                  ? 'Unfreeze Student'
                  : 'Freeze Student'
                : 'Delete Student'}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.type === 'freeze' ? (
                confirmDialog.isFrozen ? (
                  <>
                    Are you sure you want to <strong>unfreeze</strong>{' '}
                    <strong>{confirmDialog.studentName}</strong>? They will be able to apply for
                    jobs again.
                  </>
                ) : (
                  <>
                    Are you sure you want to <strong>freeze</strong>{' '}
                    <strong>{confirmDialog.studentName}</strong>? They will not be able to apply for
                    any jobs.
                  </>
                )
              ) : (
                <>
                  Are you sure you want to <strong>permanently delete</strong>{' '}
                  <strong>{confirmDialog.studentName}</strong>? This action cannot be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog({
                  open: false,
                  type: 'freeze',
                  studentId: '',
                  studentName: '',
                  isFrozen: false,
                })
              }
            >
              Cancel
            </Button>
            <Button
              variant={confirmDialog.type === 'delete' ? 'destructive' : 'default'}
              onClick={handleConfirmAction}
              disabled={loading}
            >
              {confirmDialog.type === 'freeze'
                ? confirmDialog.isFrozen
                  ? 'Unfreeze'
                  : 'Freeze'
                : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
