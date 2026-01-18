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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFreeze(student.id, student.isFrozen)}
                  disabled={loading}
                >
                  {student.isFrozen ? 'Unfreeze' : 'Freeze'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {students.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No students found.</p>
      )}
    </div>
  );
}
