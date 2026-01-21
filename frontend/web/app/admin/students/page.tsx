'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { adminService } from '@/services/admin.service';
import type { PlacementStatus, ProfileStatus, ApplicationWithDetails } from '@/types/admin.types';

interface Student {
  id: string;
  name: string;
  email: string;
  batch: number;
  department: string;
  cgpa: number;
  placementStatus: PlacementStatus;
  profileStatus: ProfileStatus;
  appliedJobs: number;
  shortlisted: number;
  interviewed: number;
  offered: number;
}

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [placementFilter, setPlacementFilter] = useState<string>('ALL');
  const [profileFilter, setProfileFilter] = useState<string>('ALL');
  const [cgpaMin, setCgpaMin] = useState<number>(0);
  const [cgpaMax, setCgpaMax] = useState<number>(10);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [frozenStudents, setFrozenStudents] = useState<Set<string>>(new Set());
  const [deletingStudents, setDeletingStudents] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await adminService.getAllApplications({}, { page: 1, limit: 1000 });

        // Extract unique students from applications
        const studentMap = new Map<string, Student>();
        response.data.forEach((app: ApplicationWithDetails) => {
          const userId = app.user?.id || app.userId;
          if (!studentMap.has(userId)) {
            studentMap.set(userId, {
              id: userId,
              name: app.user?.name || 'N/A',
              email: app.user?.email || 'N/A',
              batch: 2024, // Default, you may want to extract from user profile
              department: 'CSE', // Default, you may want to extract from user profile
              cgpa: 0, // Default, you may want to extract from user profile
              placementStatus: 'PLACED' as PlacementStatus,
              profileStatus: 'COMPLETE' as ProfileStatus,
              appliedJobs: 0,
              shortlisted: 0,
              interviewed: 0,
              offered: 0,
            });
          }

          const student = studentMap.get(userId)!;
          student.appliedJobs++;

          if (app.status === 'SHORTLISTED') student.shortlisted++;
          if (app.status === 'INTERVIEWING') student.interviewed++;
          if (app.status === 'HIRED') student.offered++;
        });

        setStudents(Array.from(studentMap.values()));
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Get unique values for filters
  const batches = Array.from(new Set(students.map((s) => s.batch))).sort((a, b) => b - a);
  const departments = Array.from(new Set(students.map((s) => s.department))).sort();

  // Filter students
  const filteredStudents = students.filter((student) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !student.name.toLowerCase().includes(query) &&
        !student.email.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Batch filter
    if (batchFilter !== 'ALL' && student.batch.toString() !== batchFilter) {
      return false;
    }

    // Department filter
    if (departmentFilter !== 'ALL' && student.department !== departmentFilter) {
      return false;
    }

    // Placement status filter
    if (placementFilter !== 'ALL' && student.placementStatus !== placementFilter) {
      return false;
    }

    // Profile status filter
    if (profileFilter !== 'ALL' && student.profileStatus !== profileFilter) {
      return false;
    }

    // CGPA filter
    if (student.cgpa < cgpaMin || student.cgpa > cgpaMax) {
      return false;
    }

    return true;
  });

  // Paginate
  const totalPages = Math.ceil(filteredStudents.length / pageSize);
  const paginatedStudents = filteredStudents.slice((page - 1) * pageSize, page * pageSize);

  // Select all
  const toggleSelectAll = () => {
    if (selectedStudents.length === paginatedStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(paginatedStudents.map((s) => s.id));
    }
  };

  // Toggle individual
  const toggleSelect = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const getPlacementBadge = (status: PlacementStatus) => {
    const variants: Record<PlacementStatus, 'default' | 'success' | 'warning'> = {
      UNPLACED: 'default',
      PLACED: 'success',
      DEFERRED: 'warning',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getProfileBadge = (status: ProfileStatus) => {
    const variants: Record<ProfileStatus, 'destructive' | 'default' | 'secondary'> = {
      INCOMPLETE: 'destructive',
      COMPLETE: 'default',
      LOCKED: 'secondary',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const handleFreezeStudent = async (studentId: string, currentlyFrozen: boolean) => {
    try {
      await adminService.freezeStudent(studentId, !currentlyFrozen);
      if (currentlyFrozen) {
        setFrozenStudents((prev) => {
          const newSet = new Set(prev);
          newSet.delete(studentId);
          return newSet;
        });
      } else {
        setFrozenStudents((prev) => new Set(prev).add(studentId));
      }
      toast({
        title: 'Success',
        description: `Student ${currentlyFrozen ? 'unfrozen' : 'frozen'} successfully`,
      });
    } catch {
      toast({
        title: 'Error',
        description: `Failed to ${currentlyFrozen ? 'unfreeze' : 'freeze'} student`,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete ${studentName}? This action can be reversed by a super admin.`
      )
    ) {
      return;
    }

    setDeletingStudents((prev) => new Set(prev).add(studentId));
    try {
      await adminService.deleteStudent(studentId);
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      toast({
        title: 'Success',
        description: 'Student deleted successfully',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete student',
        variant: 'destructive',
      });
    } finally {
      setDeletingStudents((prev) => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-muted-foreground mt-2">Manage student profiles and eligibility</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            Bulk Upload
          </Button>
          <Button variant="outline">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export
          </Button>
        </div>
      </div>

      {students.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading students...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Filter students by various criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Search */}
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by name, roll no, email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md text-sm bg-background"
                  />
                </div>

                {/* Batch filter */}
                <select
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm bg-background"
                >
                  <option value="ALL">All Batches</option>
                  {batches.map((batch) => (
                    <option key={batch} value={batch.toString()}>
                      {batch}
                    </option>
                  ))}
                </select>

                {/* Department filter */}
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm bg-background"
                >
                  <option value="ALL">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>

                {/* Placement status filter */}
                <select
                  value={placementFilter}
                  onChange={(e) => setPlacementFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm bg-background"
                >
                  <option value="ALL">All Status</option>
                  <option value="UNPLACED">Unplaced</option>
                  <option value="PLACED">Placed</option>
                  <option value="DEFERRED">Deferred</option>
                </select>

                {/* Profile status filter */}
                <select
                  value={profileFilter}
                  onChange={(e) => setProfileFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm bg-background"
                >
                  <option value="ALL">All Profiles</option>
                  <option value="INCOMPLETE">Incomplete</option>
                  <option value="COMPLETE">Complete</option>
                  <option value="LOCKED">Locked</option>
                </select>

                {/* CGPA range */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">CGPA:</span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={cgpaMin}
                    onChange={(e) => setCgpaMin(parseFloat(e.target.value))}
                    className="w-20 px-2 py-1 border rounded text-sm bg-background"
                  />
                  <span className="text-sm text-muted-foreground">to</span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={cgpaMax}
                    onChange={(e) => setCgpaMax(parseFloat(e.target.value))}
                    className="w-20 px-2 py-1 border rounded text-sm bg-background"
                  />
                </div>

                {/* Clear filters */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setBatchFilter('ALL');
                    setDepartmentFilter('ALL');
                    setPlacementFilter('ALL');
                    setProfileFilter('ALL');
                    setCgpaMin(0);
                    setCgpaMax(10);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {selectedStudents.length > 0 && (
            <Card className="border-primary">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''}{' '}
                    selected
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Lock Profiles
                    </Button>
                    <Button variant="outline" size="sm">
                      Unlock Profiles
                    </Button>
                    <Button variant="outline" size="sm">
                      Export Selected
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/admin/notifications')}
                    >
                      Send Notification
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedStudents([])}>
                      Clear Selection
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Students List</CardTitle>
                  <CardDescription>
                    Showing {paginatedStudents.length} of {filteredStudents.length} students
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={
                            selectedStudents.length === paginatedStudents.length &&
                            paginatedStudents.length > 0
                          }
                          onChange={toggleSelectAll}
                          className="rounded"
                        />
                      </TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>CGPA</TableHead>
                      <TableHead>Placement</TableHead>
                      <TableHead>Profile</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={() => toggleSelect(student.id)}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {student.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <button
                                onClick={() => router.push(`/admin/students/${student.id}`)}
                                className="font-medium hover:text-primary hover:underline text-left"
                              >
                                {student.name}
                              </button>
                              <p className="text-xs text-muted-foreground">{student.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{student.department}</TableCell>
                        <TableCell>{student.batch}</TableCell>
                        <TableCell>
                          <span className={student.cgpa >= 8 ? 'font-semibold text-green-600' : ''}>
                            {student.cgpa.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>{getPlacementBadge(student.placementStatus)}</TableCell>
                        <TableCell>{getProfileBadge(student.profileStatus)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant={frozenStudents.has(student.id) ? 'default' : 'outline'}
                              size="sm"
                              onClick={() =>
                                handleFreezeStudent(student.id, frozenStudents.has(student.id))
                              }
                            >
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                              </svg>
                              {frozenStudents.has(student.id) ? 'Unfreeze' : 'Freeze'}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteStudent(student.id, student.name)}
                              disabled={deletingStudents.has(student.id)}
                            >
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              {deletingStudents.has(student.id) ? 'Deleting...' : 'Delete'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
