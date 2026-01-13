import { Skeleton } from '@/components/ui/skeleton';

export function JobCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-4">
      <div className="flex gap-4">
        <Skeleton className="h-12 w-12 rounded-md shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="mb-2 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex items-center justify-between mt-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
