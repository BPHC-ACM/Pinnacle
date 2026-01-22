'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { adminService } from '@/services/admin.service';
import type { JobWithStats, JobStatus } from '@/types/admin.types';
import { EditJobDialog } from './_components/EditJobDialog';

export default function AdminJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<JobStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllJobs(filter !== 'ALL' ? { status: filter } : {}, {
        page,
        limit: 10,
      });
      setJobs(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (err) {
      setError('Failed to load jobs');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page]);

  const handlePauseJob = async (jobId: string) => {
    try {
      await adminService.pauseJob(jobId);
      fetchJobs();
    } catch (err) {
      console.error('Error pausing job:', err);
      alert('Failed to pause job');
    }
  };

  const handleReopenJob = async (jobId: string) => {
    try {
      await adminService.reopenJob(jobId);
      fetchJobs();
    } catch (err) {
      console.error('Error reopening job:', err);
      alert('Failed to reopen job');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      await adminService.deleteJob(jobId);
      fetchJobs();
    } catch (err) {
      console.error('Error deleting job:', err);
      alert('Failed to delete job');
    }
  };

  const getStatusBadge = (status: JobStatus) => {
    const variants: Record<
      JobStatus,
      { variant: 'outline' | 'success' | 'destructive' | 'warning'; label: string }
    > = {
      DRAFT: { variant: 'outline', label: 'Draft' },
      PENDING: { variant: 'warning', label: 'Pending' },
      OPEN: { variant: 'success', label: 'Open' },
      CLOSED: { variant: 'destructive', label: 'Closed' },
      PAUSED: { variant: 'warning', label: 'Paused' },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const [editJob, setEditJob] = useState<JobWithStats | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Jobs Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage all job postings and their applications
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Jobs</CardTitle>
            <div className="flex gap-2">
              {(['ALL', 'OPEN', 'CLOSED', 'PAUSED'] as const).map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setFilter(status);
                    setPage(1);
                  }}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">{error}</div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No jobs found</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.company?.name || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          <span className="font-medium">{job.applicationStats.total} total</span>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <span>✓ {job.applicationStats.shortlisted}</span>
                            <span>⏱ {job.applicationStats.interviewing}</span>
                            <span>✔ {job.applicationStats.hired}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'No deadline'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => {
                              setEditJob(job);
                              setEditDialogOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/admin/jobs/${job.id}/applications`)}
                          >
                            View Applications
                          </Button>
                          {job.status === 'OPEN' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePauseJob(job.id)}
                            >
                              Pause
                            </Button>
                          )}
                          {(job.status === 'PAUSED' || job.status === 'CLOSED') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReopenJob(job.id)}
                            >
                              Reopen
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteJob(job.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {editJob && (
        <EditJobDialog
          job={editJob}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={() => {
            setEditDialogOpen(false);
            fetchJobs();
          }}
        />
      )}
    </div>
  );
}
