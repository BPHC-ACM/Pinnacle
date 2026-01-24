'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { adminService } from '@/services/admin.service';
import type { JobWithStats, JobStatus } from '@/types/admin.types';

interface EditJobDialogProps {
  job: JobWithStats;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditJobDialog({ job, open, onOpenChange, onSuccess }: EditJobDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Basic Details State
  const [title, setTitle] = useState(job.title);
  const [description, setDescription] = useState(job.description || '');
  const [location, setLocation] = useState(job.location || '');
  const [type, setType] = useState(job.type || '');
  const [salary, setSalary] = useState(job.salary || '');
  const [deadline, setDeadline] = useState(
    job.deadline ? new Date(job.deadline).toISOString().slice(0, 16) : '',
  );
  const [status, setStatus] = useState(job.status);

  // Schedule State
  const [oaDate, setOaDate] = useState(
    job.oaDate ? new Date(job.oaDate).toISOString().slice(0, 16) : '',
  );
  const [oaVenue, setOaVenue] = useState(job.oaVenue || '');
  const [oaInstructions, setOaInstructions] = useState(job.oaInstructions || '');

  const [pptDate, setPptDate] = useState(
    job.pptDate ? new Date(job.pptDate).toISOString().slice(0, 16) : '',
  );
  const [pptVenue, setPptVenue] = useState(job.pptVenue || '');
  const [pptInstructions, setPptInstructions] = useState(job.pptInstructions || '');

  const [interviewDate, setInterviewDate] = useState(
    job.interviewDate ? new Date(job.interviewDate).toISOString().slice(0, 16) : '',
  );
  const [interviewVenue, setInterviewVenue] = useState(job.interviewVenue || '');
  const [interviewInstructions, setInterviewInstructions] = useState(
    job.interviewInstructions || '',
  );
  const [selectionStatus, setSelectionStatus] = useState(job.selectionStatus || 'PENDING');
  const [offerDate, setOfferDate] = useState(
    job.offerDate ? new Date(job.offerDate).toISOString().slice(0, 16) : '',
  );
  const [joiningDate, setJoiningDate] = useState(
    job.joiningDate ? new Date(job.joiningDate).toISOString().slice(0, 16) : '',
  );

  const handleBasicSave = async () => {
    try {
      setLoading(true);
      await adminService.updateJob(job.id, {
        title,
        description,
        location,
        type,
        salary,
        deadline: deadline ? new Date(deadline) : undefined,
        status,
      });
      toast({ title: 'Success', description: 'Job details updated successfully' });
      onSuccess();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to update job details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSave = async () => {
    try {
      setLoading(true);
      await adminService.updateJobSchedule(job.id, {
        oaDate: oaDate ? new Date(oaDate) : undefined,
        oaVenue,
        oaInstructions,
        pptDate: pptDate ? new Date(pptDate) : undefined,
        pptVenue,
        pptInstructions,
        interviewDate: interviewDate ? new Date(interviewDate) : undefined,
        interviewVenue,
        interviewInstructions,
        selectionStatus,
        offerDate: offerDate ? new Date(offerDate) : undefined,
        joiningDate: joiningDate ? new Date(joiningDate) : undefined,
      });
      toast({ title: 'Success', description: 'Job schedule updated successfully' });
      onSuccess();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to update job schedule',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job: {job.title}</DialogTitle>
          <DialogDescription>Update job details and schedule</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Details</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Software Engineer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Job Type</Label>
                <Input
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="Full-time / Intern"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Bangalore / Remote"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="salary">Salary / Stipend</Label>
                <Input
                  id="salary"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="12 LPA / 50k pm"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v: JobStatus) => setStatus(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleBasicSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Basic Details'}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="font-medium text-sm border-b pb-2">Online Assessment (OA)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="oaDate">OA Date</Label>
                  <Input
                    id="oaDate"
                    type="datetime-local"
                    value={oaDate}
                    onChange={(e) => setOaDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="oaVenue">OA Venue</Label>
                  <Input
                    id="oaVenue"
                    value={oaVenue}
                    onChange={(e) => setOaVenue(e.target.value)}
                    placeholder="HackerRank / Lab 201"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="oaInstructions">OA Instructions</Label>
                <Textarea
                  id="oaInstructions"
                  value={oaInstructions}
                  onChange={(e) => setOaInstructions(e.target.value)}
                  placeholder="Carry your ID card..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-sm border-b pb-2">PPT Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="pptDate">PPT Date</Label>
                  <Input
                    id="pptDate"
                    type="datetime-local"
                    value={pptDate}
                    onChange={(e) => setPptDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pptVenue">PPT Venue</Label>
                  <Input
                    id="pptVenue"
                    value={pptVenue}
                    onChange={(e) => setPptVenue(e.target.value)}
                    placeholder="Seminar Hall 1"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pptInstructions">PPT Instructions</Label>
                <Textarea
                  id="pptInstructions"
                  value={pptInstructions}
                  onChange={(e) => setPptInstructions(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-sm border-b pb-2">Interview & Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="interviewDate">Interview Date</Label>
                  <Input
                    id="interviewDate"
                    type="datetime-local"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="selectionStatus">Selection Status</Label>
                  <Select
                    value={selectionStatus}
                    onValueChange={(v: 'PENDING' | 'ACCEPTED' | 'REJECTED') =>
                      setSelectionStatus(v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="ACCEPTED">Accepted</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="interviewVenue">Venue</Label>
                <Input
                  id="interviewVenue"
                  value={interviewVenue}
                  onChange={(e) => setInterviewVenue(e.target.value)}
                  placeholder="Virtual / Placements Office"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="interviewInstructions">Special Instructions</Label>
                <Textarea
                  id="interviewInstructions"
                  value={interviewInstructions}
                  onChange={(e) => setInterviewInstructions(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-sm border-b pb-2">Offer & Joining</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="offerDate">Offer Date</Label>
                  <Input
                    id="offerDate"
                    type="datetime-local"
                    value={offerDate}
                    onChange={(e) => setOfferDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="joiningDate">Joining Date</Label>
                  <Input
                    id="joiningDate"
                    type="datetime-local"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <DialogFooterStart>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleScheduleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Schedule'}
              </Button>
            </DialogFooterStart>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function DialogFooterStart({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">{children}</div>
  );
}
