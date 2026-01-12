'use client';

import { useRouter } from 'next/navigation';
import { Job } from '@/types/job.type';
import { Button } from '@/components/ui/button';

export default function JobCard({ job }: { job: Job }) {
  const router = useRouter();
  const postedDate =
    job.createdAt && !isNaN(new Date(job.createdAt).getTime())
      ? new Date(job.createdAt).toLocaleDateString()
      : '—';

  const deadlineDate =
    job.deadline && !isNaN(new Date(job.deadline).getTime())
      ? new Date(job.deadline).toLocaleDateString()
      : '—';

  const location = job.location ?? 'Not specified';
  const salary = job.salary ?? 'Not disclosed';
  const status = job.status ?? 'UNKNOWN';

  const goToJob = () => {
    router.push(`/jobs/${job.id}`);
  };

  return (
    <div
      onClick={goToJob}
      className="p-5 rounded-xl border border-border bg-card hover:shadow-md transition cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goToJob();
        }
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>

          <p className="text-sm text-muted-foreground">{location}</p>
        </div>

        <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary">
          {job.type}
        </span>
      </div>

      {/* Description */}
      <p className="mt-3 text-sm text-foreground line-clamp-3">{job.description}</p>

      {/* Meta info */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>💰 {salary}</span>
        <span>📌 Status: {status}</span>
        <span>⏳ Deadline: {deadlineDate}</span>
        <span>🗓 Posted on {postedDate}</span>
      </div>

      {/* Actions */}
      <div className="mt-4 flex justify-end">
        <Button
          size="sm"
          disabled={status !== 'OPEN'}
          onClick={(e) => {
            e.stopPropagation();
            console.log('Apply clicked for job:', job.id);
          }}
        >
          {status === 'OPEN' ? 'Apply' : 'Closed'}
        </Button>
      </div>
    </div>
  );
}
