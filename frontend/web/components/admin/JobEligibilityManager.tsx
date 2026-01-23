'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api-client';

interface Job {
  id: string;
  title: string;
  company: { name: string };
}

const BRANCHES = [
  'Computer Science',
  'Electronics and Communication',
  'Electrical and Electronics',
  'Mechanical',
  'Civil',
  'Chemical',
];

export default function JobEligibilityManager() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [loading, setLoading] = useState(false);

  const [criteria, setCriteria] = useState({
    minCgpa: '',
    maxActiveBacklogs: '',
    maxTotalBacklogs: '',
    allowedBranches: [] as string[],
    allowedYears: [] as number[],
  });

  const fetchJobs = useCallback(async () => {
    try {
      const response = await api.get('/jobs?limit=100');
      setJobs(response.data.data || []);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load jobs',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const fetchEligibility = useCallback(async () => {
    try {
      const response = await api.get(`/jobs/${selectedJob}/eligibility`);
      if (response.data) {
        setCriteria({
          minCgpa: response.data.minCgpa?.toString() || '',
          maxActiveBacklogs: response.data.maxActiveBacklogs?.toString() || '',
          maxTotalBacklogs: response.data.maxTotalBacklogs?.toString() || '',
          allowedBranches: response.data.allowedBranches || [],
          allowedYears: response.data.allowedYears || [],
        });
      }
    } catch {
      // No eligibility set yet
      setCriteria({
        minCgpa: '',
        maxActiveBacklogs: '',
        maxTotalBacklogs: '',
        allowedBranches: [],
        allowedYears: [],
      });
    }
  }, [selectedJob]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    if (selectedJob) {
      fetchEligibility();
    }
  }, [selectedJob, fetchEligibility]);

  const handleSubmit = async () => {
    if (!selectedJob) {
      toast({
        title: 'Error',
        description: 'Please select a job',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        minCgpa: criteria.minCgpa ? parseFloat(criteria.minCgpa) : undefined,
        maxActiveBacklogs: criteria.maxActiveBacklogs
          ? parseInt(criteria.maxActiveBacklogs)
          : undefined,
        maxTotalBacklogs: criteria.maxTotalBacklogs
          ? parseInt(criteria.maxTotalBacklogs)
          : undefined,
        allowedBranches: criteria.allowedBranches.length > 0 ? criteria.allowedBranches : undefined,
        allowedYears: criteria.allowedYears.length > 0 ? criteria.allowedYears : undefined,
      };

      await api.post(`/api/jobs/${selectedJob}/eligibility`, payload);

      toast({
        title: 'Success',
        description: 'Eligibility criteria updated successfully',
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to update eligibility',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleBranch = (branch: string) => {
    setCriteria((prev) => ({
      ...prev,
      allowedBranches: prev.allowedBranches.includes(branch)
        ? prev.allowedBranches.filter((b) => b !== branch)
        : [...prev.allowedBranches, branch],
    }));
  };

  const toggleYear = (year: number) => {
    setCriteria((prev) => ({
      ...prev,
      allowedYears: prev.allowedYears.includes(year)
        ? prev.allowedYears.filter((y) => y !== year)
        : [...prev.allowedYears, year],
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Select Job</Label>
        <Select value={selectedJob} onValueChange={setSelectedJob}>
          <SelectTrigger>
            <SelectValue placeholder="Select a job" />
          </SelectTrigger>
          <SelectContent>
            {jobs.map((job) => (
              <SelectItem key={job.id} value={job.id}>
                {job.company.name} - {job.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedJob && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Minimum CGPA</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g., 7.5"
                value={criteria.minCgpa}
                onChange={(e) => setCriteria({ ...criteria, minCgpa: e.target.value })}
              />
            </div>

            <div>
              <Label>Max Active Backlogs</Label>
              <Input
                type="number"
                placeholder="e.g., 0"
                value={criteria.maxActiveBacklogs}
                onChange={(e) => setCriteria({ ...criteria, maxActiveBacklogs: e.target.value })}
              />
            </div>

            <div>
              <Label>Max Total Backlogs</Label>
              <Input
                type="number"
                placeholder="e.g., 2"
                value={criteria.maxTotalBacklogs}
                onChange={(e) => setCriteria({ ...criteria, maxTotalBacklogs: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Allowed Branches (leave empty for all)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {BRANCHES.map((branch) => (
                <Button
                  key={branch}
                  variant={criteria.allowedBranches.includes(branch) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleBranch(branch)}
                >
                  {branch}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label>Allowed Years (leave empty for all)</Label>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((year) => (
                <Button
                  key={year}
                  variant={criteria.allowedYears.includes(year) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleYear(year)}
                >
                  Year {year}
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save Eligibility Criteria'}
          </Button>
        </div>
      )}
    </div>
  );
}
