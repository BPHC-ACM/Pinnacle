'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { api } from '@/lib/api-client';

// Icon components
const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

interface Job {
  id: string;
  title: string;
  company: { name: string; id: string };
  location: string;
  createdAt: string;
  deadline?: string;
  status?: string;
  jobType: string;
  description?: string;
}

interface Application {
  id: string;
  jobId: string;
  status: string;
  createdAt: string;
}

export default function JobsPage() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'applied'>('all');
  const [sector, setSector] = useState('All Sectors');
  const [positionType, setPositionType] = useState('All');
  const [status, setStatus] = useState('All');
  const [sortBy, setSortBy] = useState('Created At');
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/');
    } else {
      fetchData();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchData = async () => {
    try {
      const [jobsResponse, applicationsResponse] = await Promise.all([
        api.get('/jobs'),
        api.get('/applications'),
      ]);
      setJobs(Array.isArray(jobsResponse.data) ? jobsResponse.data : []);
      setApplications(Array.isArray(applicationsResponse.data) ? applicationsResponse.data : []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setJobs([]);
      setApplications([]);
    } finally {
      setLoading(false);
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

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
    if (activeTab === 'applied' && applicationStatus === 'Yet to apply') return false;
    if (positionType !== 'All' && job.jobType !== positionType) return false;
    if (status !== 'All' && applicationStatus !== status) return false;
    if (
      searchQuery &&
      !job.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !job.company.name.toLowerCase().includes(searchQuery.toLowerCase())
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
    <div className="flex flex-col min-h-screen bg-background relative">
      {/* Grid background pattern */}
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

      {/* Header */}
      <header className="w-full border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => router.push('/dashboard')}>
            <Logo size="md" />
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button onClick={logout} variant="outline" size="sm">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent/5 transition-colors"
              >
                Home
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium bg-primary-500/10 text-primary-500 transition-colors">
                Job Profiles
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent/5 transition-colors"
              >
                My Profile
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent/5 transition-colors">
                Interviews
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent/5 transition-colors">
                Assessments
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent/5 transition-colors">
                Events
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent/5 transition-colors">
                Competitions
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent/5 transition-colors">
                Resume
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent/5 transition-colors">
                Launchpad
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent/5 transition-colors">
                Help
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-6">Job Profile</h1>

            {/* Filters */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Job Sector
                  </label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option>All Sectors</option>
                    <option>Technology</option>
                    <option>Finance</option>
                    <option>Healthcare</option>
                    <option>Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Position Type
                  </label>
                  <select
                    value={positionType}
                    onChange={(e) => setPositionType(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option>All</option>
                    <option>Internship</option>
                    <option>Full-time</option>
                    <option>Part-time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option>All</option>
                    <option>Yet to apply</option>
                    <option>Applied</option>
                    <option>Under Review</option>
                    <option>Accepted</option>
                    <option>Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option>Created At</option>
                    <option>Company Name</option>
                    <option>Deadline</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <div className="flex-1 relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by job title or company"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <Button
                  onClick={() => {
                    setSector('All Sectors');
                    setPositionType('All');
                    setStatus('All');
                    setSortBy('Created At');
                    setSearchQuery('');
                  }}
                  variant="outline"
                  size="sm"
                >
                  Clear all filters
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-border">
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

            {/* Jobs List */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading jobs...</div>
              ) : filteredJobs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No jobs found matching your filters.
                </div>
              ) : (
                filteredJobs.map((job) => {
                  const applicationStatus = getApplicationStatus(job.id);
                  const daysAgo = getDaysAgo(job.createdAt);
                  const closesIn = getClosesIn(job.deadline);

                  return (
                    <div
                      key={job.id}
                      className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(`/jobs/${job.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center">
                              <span className="text-lg font-bold text-primary-500">
                                {job.company.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {job.company.name} • {job.location}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                            <span>{daysAgo} days ago</span>
                            {closesIn && (
                              <>
                                <span>•</span>
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
                              </>
                            )}
                          </div>
                        </div>
                        <div
                          className={`px-4 py-2 rounded-lg text-sm font-medium border ${getStatusColor(applicationStatus)}`}
                        >
                          {applicationStatus}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} Pinnacle. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a
                href="/privacy"
                className="text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
