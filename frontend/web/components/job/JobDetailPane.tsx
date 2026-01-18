'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { api } from '@/lib/api-client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Question {
  id: string;
  question: string;
  required: boolean;
}

interface ExtendedJob {
  id: string;
  title: string;
  companyId: string;
  company?: { name: string; id: string };
  location: string | null;
  createdAt: string;
  deadline: string | null;
  status: 'OPEN' | 'CLOSED';
  type: string | null;
  description: string | null;
  salary: string | null;
  questions?: Question[];
}

interface JobDetailPaneProps {
  jobId: string | null;
  onClose?: () => void;
  onApplySuccess?: () => void;
  applicationStatus?: string;
}

export function JobDetailPane({
  jobId,
  onApplySuccess,
  applicationStatus = 'Yet to apply',
}: JobDetailPaneProps) {
  const [job, setJob] = useState<ExtendedJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [applying, setApplying] = useState(false);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [hasJustApplied, setHasJustApplied] = useState(false);

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      setHasJustApplied(false);
      return;
    }

    const fetchJob = async () => {
      setLoading(true);
      setError(null);
      setHasJustApplied(false);
      try {
        const res = await api.get(`/jobs/${jobId}`);
        // Handle different possible response structures
        const data = res.data?.data ?? res.data?.job ?? res.data;
        setJob(data);
        // Reset answers when job changes
        setAnswers({});
      } catch (err) {
        console.error(err);
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleApplyClick = () => {
    if (!job) return;

    // If there are required questions, show dialog
    if (job.questions && job.questions.length > 0) {
      setIsApplyDialogOpen(true);
    } else {
      // If no questions, apply directly
      submitApplication();
    }
  };

  const submitApplication = async () => {
    if (!jobId) return;
    try {
      setApplying(true);
      await api.post(`/jobs/${jobId}/applications`, {
        answers, // Send answers (will be empty object if no questions)
      });
      setHasJustApplied(true);
      setIsApplyDialogOpen(false);
      if (onApplySuccess) {
        onApplySuccess();
      }
    } catch (error) {
      console.error('Failed to apply:', error);
      // You might want to show an error toast here
    } finally {
      setApplying(false);
    }
  };

  if (!jobId) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground p-6 text-center">
        <div className="space-y-2">
          <p className="text-lg font-medium">No Job Selected</p>
          <p className="text-sm">Select a job from the list to view details</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Loading details...
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="h-full flex items-center justify-center text-red-500">
        {error || 'Job not found'}
      </div>
    );
  }

  const postedDate = job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '—';
  const deadlineDate = job.deadline ? new Date(job.deadline).toLocaleDateString() : '—';
  const location = job.location ?? 'Not specified';
  const salary = job.salary ?? 'Not disclosed';
  const status = job.status ?? 'UNKNOWN';
  const isOpen = status === 'OPEN';

  return (
    <div className="h-full flex flex-col bg-card border border-border overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        <div className="flex justify-between items-start gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">{job.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {job.company?.name ? `${job.company.name} • ` : ''}
              {location} • {job.type || 'Full-time'}
            </p>
          </div>
          <span
            className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
              isOpen ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'
            }`}
          >
            {status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-8 bg-muted/30 p-4 rounded-lg">
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Salary</p>
            <p className="font-medium text-foreground">{salary}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Deadline</p>
            <p className="font-medium text-foreground">{deadlineDate}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Posted on</p>
            <p className="font-medium text-foreground">{postedDate}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Questions</p>
            <p className="font-medium text-foreground">{job.questions?.length ?? 0}</p>
          </div>
        </div>

        <div className="mb-8">
          <Button
            size="lg"
            disabled={!isOpen || applying || applicationStatus !== 'Yet to apply' || hasJustApplied}
            className="w-full"
            onClick={handleApplyClick}
          >
            {applying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : applicationStatus !== 'Yet to apply' || hasJustApplied ? (
              'Applied'
            ) : isOpen ? (
              'Apply for this job'
            ) : (
              'Applications closed'
            )}
          </Button>
        </div>

        <div className="mb-8">
          <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: () => null,
                h2: () => null,
                h3: () => null,
                h4: () => null,
                h5: () => null,
                h6: () => null,
              }}
            >
              {job.description || 'No description provided.'}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Application Questions</DialogTitle>
            <DialogDescription>
              Please answer the following questions to complete your application.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-2">
            {job.questions?.map((q) => (
              <div key={q.id} className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {q.question} {q.required && <span className="text-red-500">*</span>}
                </label>
                <Input
                  placeholder="Type your answer here..."
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                  className="bg-background my-2 mx-1"
                />
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsApplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitApplication}
              disabled={
                applying ||
                (job.questions?.some((q) => q.required && !answers[q.id]?.trim()) ?? false)
              }
            >
              {applying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
