import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from 'components/ui/button';
import type { Job } from 'types/job.type';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function getJob(id: string): Promise<Job> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    notFound();
  }

  const json = await res.json();
  const job: Job | undefined = json?.data ?? json?.job ?? json;

  if (!job) {
    notFound();
  }

  return job;
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const job = await getJob(id);
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

  const isOpen = status === 'OPEN';

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Back button */}
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/jobs">← Back to jobs</Link>
        </Button>
      </div>
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{job.title}</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {location} • {job.type}
          </p>
        </div>

        <span
          className={`text-xs px-3 py-1 rounded-full ${
            isOpen ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'
          }`}
        >
          {status}
        </span>
      </div>

      {/* Meta */}
      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Salary</p>
          <p className="font-medium text-foreground">{salary}</p>
        </div>

        <div>
          <p className="text-muted-foreground">Deadline</p>
          <p className="font-medium text-foreground">{deadlineDate}</p>
        </div>

        <div>
          <p className="text-muted-foreground">Posted on</p>
          <p className="font-medium text-foreground">{postedDate}</p>
        </div>

        <div>
          <p className="text-muted-foreground">Questions</p>
          <p className="font-medium text-foreground">{job.questions?.length ?? 0}</p>
        </div>
      </div>

      {/* Description */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">Job Description</h2>

        <p className="mt-3 whitespace-pre-line text-sm text-foreground">{job.description}</p>
      </div>

      {/* Actions */}
      <div className="mt-10 flex justify-end">
        <Button size="lg" disabled={!isOpen}>
          {isOpen ? 'Apply for this job' : 'Applications closed'}
        </Button>
      </div>
    </div>
  );
}
