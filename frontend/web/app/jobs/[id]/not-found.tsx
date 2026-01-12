import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function JobNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
      <h1 className="text-3xl font-semibold text-foreground">Job not found</h1>

      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        The job you&apos;re looking for doesn&apos;t exist, has been removed, or is no longer
        accepting applications.
      </p>

      <div className="mt-6 flex gap-3">
        <Button asChild variant="default">
          <Link href="/jobs">Browse jobs</Link>
        </Button>

        <Button asChild variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
