'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

export default function JobScheduling() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [loading, setLoading] = useState(false);

  const [schedule, setSchedule] = useState({
    oaDate: '',
    oaVenue: '',
    oaInstructions: '',
    pptDate: '',
    pptVenue: '',
    pptInstructions: '',
    interviewStartDate: '',
    interviewEndDate: '',
    interviewVenue: '',
    interviewInstructions: '',
    offerDate: '',
    joiningDate: '',
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

  const fetchSchedule = useCallback(async () => {
    try {
      const response = await api.get(`/jobs/${selectedJob}/schedule`);
      setSchedule({
        oaDate: response.data.oaDate
          ? new Date(response.data.oaDate).toISOString().slice(0, 16)
          : '',
        oaVenue: response.data.oaVenue || '',
        oaInstructions: response.data.oaInstructions || '',
        pptDate: response.data.pptDate
          ? new Date(response.data.pptDate).toISOString().slice(0, 16)
          : '',
        pptVenue: response.data.pptVenue || '',
        pptInstructions: response.data.pptInstructions || '',
        interviewStartDate: response.data.interviewStartDate
          ? new Date(response.data.interviewStartDate).toISOString().slice(0, 16)
          : '',
        interviewEndDate: response.data.interviewEndDate
          ? new Date(response.data.interviewEndDate).toISOString().slice(0, 16)
          : '',
        interviewVenue: response.data.interviewVenue || '',
        interviewInstructions: response.data.interviewInstructions || '',
        offerDate: response.data.offerDate
          ? new Date(response.data.offerDate).toISOString().slice(0, 16)
          : '',
        joiningDate: response.data.joiningDate
          ? new Date(response.data.joiningDate).toISOString().slice(0, 16)
          : '',
      });
    } catch {
      // No schedule set yet
    }
  }, [selectedJob]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    if (selectedJob) {
      fetchSchedule();
    }
  }, [selectedJob, fetchSchedule]);

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
      const payload: {
        oaDate?: string;
        oaVenue?: string;
        oaInstructions?: string;
        pptDate?: string;
        pptVenue?: string;
        pptInstructions?: string;
        interviewStartDate?: string;
        interviewEndDate?: string;
        interviewVenue?: string;
        interviewInstructions?: string;
        offerDate?: string;
        joiningDate?: string;
      } = {};

      if (schedule.oaDate) payload.oaDate = new Date(schedule.oaDate).toISOString();
      if (schedule.oaVenue) payload.oaVenue = schedule.oaVenue;
      if (schedule.oaInstructions) payload.oaInstructions = schedule.oaInstructions;

      if (schedule.pptDate) payload.pptDate = new Date(schedule.pptDate).toISOString();
      if (schedule.pptVenue) payload.pptVenue = schedule.pptVenue;
      if (schedule.pptInstructions) payload.pptInstructions = schedule.pptInstructions;

      if (schedule.interviewStartDate)
        payload.interviewStartDate = new Date(schedule.interviewStartDate).toISOString();
      if (schedule.interviewEndDate)
        payload.interviewEndDate = new Date(schedule.interviewEndDate).toISOString();
      if (schedule.interviewVenue) payload.interviewVenue = schedule.interviewVenue;
      if (schedule.interviewInstructions)
        payload.interviewInstructions = schedule.interviewInstructions;

      if (schedule.offerDate) payload.offerDate = new Date(schedule.offerDate).toISOString();
      if (schedule.joiningDate) payload.joiningDate = new Date(schedule.joiningDate).toISOString();

      await api.patch(`/api/jobs/${selectedJob}/schedule`, payload);

      toast({
        title: 'Success',
        description: 'Job schedule updated successfully',
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to update schedule',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
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
        <div className="space-y-6">
          {/* OA Section */}
          <div className="border p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-lg">Online Assessment (OA)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>OA Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={schedule.oaDate}
                  onChange={(e) => setSchedule({ ...schedule, oaDate: e.target.value })}
                />
              </div>
              <div>
                <Label>OA Venue/Platform</Label>
                <Input
                  placeholder="e.g., Online - Codility"
                  value={schedule.oaVenue}
                  onChange={(e) => setSchedule({ ...schedule, oaVenue: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>OA Instructions</Label>
              <Textarea
                placeholder="Instructions for students..."
                value={schedule.oaInstructions}
                onChange={(e) => setSchedule({ ...schedule, oaInstructions: e.target.value })}
              />
            </div>
          </div>

          {/* PPT Section */}
          <div className="border p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-lg">Pre-Placement Talk (PPT)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>PPT Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={schedule.pptDate}
                  onChange={(e) => setSchedule({ ...schedule, pptDate: e.target.value })}
                />
              </div>
              <div>
                <Label>PPT Venue</Label>
                <Input
                  placeholder="e.g., Auditorium"
                  value={schedule.pptVenue}
                  onChange={(e) => setSchedule({ ...schedule, pptVenue: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>PPT Instructions</Label>
              <Textarea
                placeholder="Instructions for students..."
                value={schedule.pptInstructions}
                onChange={(e) => setSchedule({ ...schedule, pptInstructions: e.target.value })}
              />
            </div>
          </div>

          {/* Interview Section */}
          <div className="border p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-lg">Interview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Interview Start Date</Label>
                <Input
                  type="datetime-local"
                  value={schedule.interviewStartDate}
                  onChange={(e) => setSchedule({ ...schedule, interviewStartDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Interview End Date</Label>
                <Input
                  type="datetime-local"
                  value={schedule.interviewEndDate}
                  onChange={(e) => setSchedule({ ...schedule, interviewEndDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Interview Venue</Label>
                <Input
                  placeholder="e.g., Campus"
                  value={schedule.interviewVenue}
                  onChange={(e) => setSchedule({ ...schedule, interviewVenue: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Interview Instructions</Label>
              <Textarea
                placeholder="Instructions for students..."
                value={schedule.interviewInstructions}
                onChange={(e) =>
                  setSchedule({ ...schedule, interviewInstructions: e.target.value })
                }
              />
            </div>
          </div>

          {/* Offer & Joining */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Offer Date</Label>
              <Input
                type="datetime-local"
                value={schedule.offerDate}
                onChange={(e) => setSchedule({ ...schedule, offerDate: e.target.value })}
              />
            </div>
            <div>
              <Label>Joining Date</Label>
              <Input
                type="datetime-local"
                value={schedule.joiningDate}
                onChange={(e) => setSchedule({ ...schedule, joiningDate: e.target.value })}
              />
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save Schedule'}
          </Button>
        </div>
      )}
    </div>
  );
}
