'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';
import { JobDetailPane } from '@/components/job/JobDetailPane';
import { Sector, ApplicationStatus as AppStatusEnum } from '@repo/types';
import { JobCardSkeleton } from '@/components/skeletons/JobCardSkeleton';

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

interface Job {
  id: string;
  title: string;
  company: { name: string; id: string; industry?: string };
  location: string;
  createdAt: string;
  deadline?: string;
  status?: string;
  jobType?: string;
  type?: string;
  description?: string;
}

interface Application {
  id: string;
  jobId: string;
  status: string;
  createdAt: string;
}

export default function JobsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Removed activeTab state
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const [sector, setSector] = useState<string>('ALL_SECTORS');

  const [positionType, setPositionType] = useState('All');
  const [status, setStatus] = useState('All');
  const [sortBy, setSortBy] = useState('Created At');
  const [searchQuery, setSearchQuery] = useState('');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      const response = await api.get('/applications');
      const appsData = response.data?.data || response.data;
      setApplications(Array.isArray(appsData) ? appsData : []);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    }
  }, []);

  const fetchJobs = useCallback(
    async (p: number, isNewSearch: boolean = false) => {
      if (isNewSearch) {
        setLoading(true);
      } else {
        setFetchingMore(true);
      }

      try {
        const params = new URLSearchParams();
        params.append('page', p.toString());
        params.append('limit', '20');

        if (searchQuery) params.append('q', searchQuery);
        if (sector !== 'ALL_SECTORS') params.append('industry', sector);
        if (positionType !== 'All') params.append('jobType', positionType);

        const sortMap: Record<string, string> = {
          'Created At': 'createdAt',
          Deadline: 'deadline',
          'Company Name': 'createdAt',
        };
        if (sortBy && sortMap[sortBy]) {
          params.append('sortBy', sortMap[sortBy]);
        }

        const response = await api.get(`/jobs?${params.toString()}`);
        const newJobs = response.data?.data || [];
        const meta = response.data?.meta;

        if (isNewSearch) {
          setJobs(newJobs);
        } else {
          setJobs((prev) => [...prev, ...newJobs]);
        }

        setHasMore(meta ? meta.page < meta.totalPages : false);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setLoading(false);
        setFetchingMore(false);
      }
    },
    [searchQuery, sector, positionType, sortBy]
  );

  const refreshData = useCallback(() => {
    fetchApplications();
  }, [fetchApplications]);

  // 3. Infinite Scroll Observer
  const lastJobElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading || fetchingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, fetchingMore, hasMore]
  );

  // --- Effects ---

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchApplications();
    }
  }, [isAuthenticated, fetchApplications]);

  // Debounced Search
  useEffect(() => {
    if (!isAuthenticated) return;
    const timeoutId = setTimeout(() => {
      setPage(1);
      fetchJobs(1, true);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, isAuthenticated, fetchJobs]);

  // Immediate Filters (Sector, Position, Sort)
  useEffect(() => {
    if (!isAuthenticated) return;
    setPage(1);
    fetchJobs(1, true);
  }, [sector, positionType, sortBy, isAuthenticated, fetchJobs]);

  // Pagination
  useEffect(() => {
    if (page > 1) {
      fetchJobs(page, false);
    }
  }, [page, fetchJobs]);

  if (!user) return null;

  // --- Helpers ---

  const getApplicationStatus = (jobId: string) => {
    const application = applications.find((app) => app.jobId === jobId);
    if (!application) return 'Yet to apply';
    return application.status;
  };

  // Fixed logic to handle text and color safely
  const getDeadlineInfo = (deadline?: string) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'Closed', className: 'text-red-500' };
    if (diffDays === 0) return { text: 'Closes today', className: 'text-red-500' };
    if (diffDays === 1) return { text: 'Closes in 1 day', className: 'text-red-500' };

    const isUrgent = diffDays <= 3;
    return {
      text: `Closes in ${diffDays} days`,
      className: isUrgent ? 'text-red-500' : 'text-muted-foreground',
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Yet to apply':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Applied':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Under Review':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'Accepted':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const applicationStatus = getApplicationStatus(job.id);
    // Removed activeTab logic
    if (status !== 'All' && applicationStatus !== status) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-150vh bg-background overflow-hidden relative pb-8">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none -z-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="flex flex-col h-400 border-b max-w-7xl mx-auto w-full">
        <div className="w-full flex-none flex flex-col min-w-0">
          <div className="py-6 pb-0 border-border">
            <h1 className="text-3xl font-bold text-foreground mb-6">Job Profile</h1>

            {/* Filters */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Job Sector
                  </label>
                  <Select value={sector} onValueChange={setSector}>
                    <SelectTrigger className="w-full bg-background border-border">
                      <SelectValue placeholder="Select Sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL_SECTORS">All Sectors</SelectItem>
                      {Object.values(Sector).map((s) => (
                        <SelectItem key={s} value={s}>
                          {s
                            .replace(/_/g, ' ')
                            .toLowerCase()
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Position Type
                  </label>
                  <Select value={positionType} onValueChange={setPositionType}>
                    <SelectTrigger className="w-full bg-background border-border">
                      <SelectValue placeholder="Position Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full bg-background border-border">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="Yet to apply">Yet to apply</SelectItem>
                      {Object.values(AppStatusEnum).map((s) => (
                        <SelectItem key={s} value={s}>
                          {s
                            .replace(/_/g, ' ')
                            .toLowerCase()
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Sort by</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full bg-background border-border">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Created At">Created At</SelectItem>
                      <SelectItem value="Company Name">Company Name</SelectItem>
                      <SelectItem value="Deadline">Deadline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <div className="flex-1 relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <Input
                    type="text"
                    placeholder="Search by job title or company"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 bg-background border-border"
                  />
                </div>
                <Button
                  onClick={() => {
                    setSector('ALL_SECTORS');
                    setPositionType('All');
                    setStatus('All');
                    setSortBy('Created At');
                    setSearchQuery('');
                  }}
                  variant="outline"
                  size="sm"
                >
                  Clear filters
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 w-full overflow-hidden border-t min-h-0">
          <div className="w-full lg:w-1/3 overflow-y-auto py-6 pr-6 pl-6 md:pl-0 space-y-4 border-r border-border scrollbar-hide">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <JobCardSkeleton key={i} />)
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No jobs found matching your filters.
              </div>
            ) : (
              <>
                {filteredJobs.map((job, index) => {
                  const applicationStatus = getApplicationStatus(job.id);
                  const deadlineInfo = getDeadlineInfo(job.deadline);
                  const isSelected = selectedJobId === job.id;

                  const isDeadlineFuture = job.deadline
                    ? new Date(job.deadline) > new Date()
                    : true;
                  const isFrozen = job.status === 'CLOSED' && isDeadlineFuture;

                  const isLastElement = index === filteredJobs.length - 1;

                  return (
                    <div
                      key={job.id}
                      ref={isLastElement ? lastJobElementRef : null}
                      className={`bg-card border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer ${
                        isSelected ? 'border-primary-500 ring-1 ring-primary-500' : 'border-border'
                      }`}
                      onClick={() => setSelectedJobId(job.id)}
                    >
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-md bg-primary-500/10 flex items-center justify-center shrink-0">
                          <span className="text-lg font-bold text-primary-500">
                            {job.company?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="mb-2">
                            <h3 className="text-lg font-semibold text-foreground wrap-break-word">
                              {job.title}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {job.company?.name} • {job.location}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="text-sm">
                              {deadlineInfo && (
                                <span className={deadlineInfo.className}>{deadlineInfo.text}</span>
                              )}
                            </div>

                            <div>
                              {applicationStatus === 'Yet to apply' && isFrozen ? (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                  Frozen
                                </span>
                              ) : (
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                    applicationStatus
                                  )}`}
                                >
                                  {applicationStatus}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {fetchingMore &&
                  Array.from({ length: 2 }).map((_, i) => (
                    <JobCardSkeleton key={`skeleton-nav-${i}`} />
                  ))}
              </>
            )}
          </div>

          <div className="hidden lg:block w-2/3 bg-background/50">
            <JobDetailPane
              jobId={selectedJobId}
              onApplySuccess={refreshData}
              applicationStatus={selectedJobId ? getApplicationStatus(selectedJobId) : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
