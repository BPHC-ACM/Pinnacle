'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import JobCard from '@/components/job/JobCard';
import { Job } from '@/types/job.type';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/jobs');
      setJobs(res.data.data || []);
    } catch (error) {
      console.error(error);
      setMessage('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="max-w-7xl mx-auto w-full px-6 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Job Openings</h1>

        {loading ? (
          <div className="py-20 text-center text-muted-foreground">Loading jobs...</div>
        ) : message ? (
          <div className="py-20 text-center text-red-500">{message}</div>
        ) : jobs.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            No jobs available right now.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
