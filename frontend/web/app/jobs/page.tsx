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
import { Sector, ApplicationStatus as AppStatusEnum } from '@/types/enums';
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
  const [activeTab, setActiveTab] = useState<'all' | 'applied'>('all');
  const [sector, setSector] = useState<string>(Sector.ALL_SECTORS);
  const [positionType, setPositionType] = useState('All');
  const [status, setStatus] = useState('All');
  const [sortBy, setSortBy] = useState('Created At');
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

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

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/');
    } else {
      fetchData();
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (page > 1) {
      fetchMoreJobs();
    }
  }, [page]);

  const fetchData = async () => {
    setLoading(true);
    setPage(1);
    try {
      const [jobsResponse, applicationsResponse] = await Promise.all([
        api.get('/jobs?page=1&limit=20'),
        api.get('/applications'),
      ]);

      const jobsData = jobsResponse.data?.data || [];
      const appsData = applicationsResponse.data?.data || applicationsResponse.data;
      const meta = jobsResponse.data?.meta;

      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setApplications(Array.isArray(appsData) ? appsData : []);
      setHasMore(meta ? meta.page < meta.totalPages : false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setJobs([]);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreJobs = async () => {
    setFetchingMore(true);
    try {
      const response = await api.get(`/jobs?page=${page}&limit=20`);
      const newJobs = response.data?.data || [];
      const meta = response.data?.meta;

      setJobs((prev) => [...prev, ...newJobs]);
      setHasMore(meta ? meta.page < meta.totalPages : false);
    } catch (error) {
      console.error('Failed to fetch more jobs:', error);
    } finally {
      setFetchingMore(false);
    }
  };

  if (!user) {
    return null;
  }

  const getApplicationStatus = (jobId: string) => {
    const application = applications.find((app) => app.jobId === jobId);
    if (!application) return 'Yet to apply';
    return application.status;
  };

  const getClosesIn = (deadline?: string) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Closed';
    if (diffDays === 0) return 'Closes today';
    if (diffDays === 1) return 'Closes in 1 day';
    return `Closes in ${diffDays} days`;
  };

  const filteredJobs = jobs.filter((job) => {
    const applicationStatus = getApplicationStatus(job.id);
    const jType = job.jobType || job.type;
    const jobSector = job.company?.industry;

    if (activeTab === 'applied' && applicationStatus === 'Yet to apply') return false;
    if (sector !== Sector.ALL_SECTORS && jobSector !== sector) return false;
    if (positionType !== 'All' && jType !== positionType) return false;
    if (status !== 'All' && applicationStatus !== status) return false;
    if (
      searchQuery &&
      !job.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!job.company?.name || !job.company.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
      return false;
    return true;
  });

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

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
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

      <div className="flex h-full max-w-7xl mx-auto w-full">
        <div className="flex-1 flex flex-col h-full min-w-0">
          <div className="py-6 pb-0 border-b border-border">
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
                      {Object.values(Sector).map((s) => (
                        <SelectItem key={s} value={s}>
                          {s === Sector.ALL_SECTORS
                            ? 'All Sectors'
                            : s
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
                    setSector(Sector.ALL_SECTORS);
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

            <div className="flex gap-2 border-b border-border">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'all'
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                All Jobs
              </button>
              <button
                onClick={() => setActiveTab('applied')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'applied'
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Applied Jobs
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden max-h-screen">
            <div className="flex-1 overflow-y-auto p-6 space-y-4 border-r border-border scrollbar-hide">
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
                    const closesIn = getClosesIn(job.deadline);
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
                          isSelected
                            ? 'border-primary-500 ring-1 ring-primary-500'
                            : 'border-border'
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
                              <div className="text-sm text-muted-foreground">
                                {closesIn && (
                                  <span
                                    className={
                                      closesIn.includes('Closed')
                                        ? 'text-red-500'
                                        : closesIn.includes('today') || closesIn.includes('1 day')
                                        ? 'text-red-500'
                                        : ''
                                    }
                                  >
                                    {closesIn}
                                  </span>
                                )}
                              </div>

                              <div>
                                {applicationStatus === 'Yet to apply' && isFrozen ? (
                                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                    Applications frozen
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

            <div className="hidden lg:block flex-2 w-150 shrink-0 bg-background/50">
              <JobDetailPane jobId={selectedJobId} onApplySuccess={fetchData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
