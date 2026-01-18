'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';

interface OnboardingData {
  // Basic Info
  name: string;
  studentId: string;
  branch: string;
  currentYear: number;
  phone: string;

  // Parent Details
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  parentRelation: string;
}

const BRANCHES = [
  'Computer Science',
  'Electronics and Communication',
  'Electrical and Electronics',
  'Mechanical',
  'Civil',
  'Chemical',
  'Biotechnology',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Economics',
];

const PARENT_RELATIONS = ['Father', 'Mother', 'Guardian', 'Other'];

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<OnboardingData>({
    name: '',
    studentId: '',
    branch: '',
    currentYear: 1,
    phone: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    parentRelation: '',
  });

  const updateField = (field: keyof OnboardingData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.studentId || !formData.branch || !formData.currentYear) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (
      !formData.parentName ||
      !formData.parentEmail ||
      !formData.parentPhone ||
      !formData.parentRelation
    ) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all parent details',
        variant: 'destructive',
      });
      return false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.parentEmail)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid parent email',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setLoading(true);
    try {
      // Update user profile with basic info
      await api.patch('/api/user-details/profile', {
        name: formData.name,
        studentId: formData.studentId,
        branch: formData.branch,
        currentYear: formData.currentYear,
        phone: formData.phone,
      });

      // Update parent details
      await api.patch('/api/user-details/parent-details', {
        parentName: formData.parentName,
        parentEmail: formData.parentEmail,
        parentPhone: formData.parentPhone,
        parentRelation: formData.parentRelation,
      });

      toast({
        title: 'Success',
        description: 'Profile completed successfully!',
      });

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to complete onboarding',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Step {step} of 2: {step === 1 ? 'Personal Information' : 'Parent/Guardian Details'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="studentId">Student ID / Roll Number *</Label>
                <Input
                  id="studentId"
                  value={formData.studentId}
                  onChange={(e) => updateField('studentId', e.target.value)}
                  placeholder="e.g., 2021A7PS0001G"
                />
              </div>

              <div>
                <Label htmlFor="branch">Branch *</Label>
                <Select
                  value={formData.branch}
                  onValueChange={(value) => updateField('branch', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRANCHES.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="currentYear">Current Year *</Label>
                <Select
                  value={formData.currentYear.toString()}
                  onValueChange={(value) => updateField('currentYear', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1st Year</SelectItem>
                    <SelectItem value="2">2nd Year</SelectItem>
                    <SelectItem value="3">3rd Year</SelectItem>
                    <SelectItem value="4">4th Year</SelectItem>
                    <SelectItem value="5">5th Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleNext}>Next</Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                <Input
                  id="parentName"
                  value={formData.parentName}
                  onChange={(e) => updateField('parentName', e.target.value)}
                  placeholder="Enter parent/guardian name"
                />
              </div>

              <div>
                <Label htmlFor="parentRelation">Relation *</Label>
                <Select
                  value={formData.parentRelation}
                  onValueChange={(value) => updateField('parentRelation', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relation" />
                  </SelectTrigger>
                  <SelectContent>
                    {PARENT_RELATIONS.map((relation) => (
                      <SelectItem key={relation} value={relation}>
                        {relation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="parentEmail">Parent/Guardian Email *</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => updateField('parentEmail', e.target.value)}
                  placeholder="parent@example.com"
                />
              </div>

              <div>
                <Label htmlFor="parentPhone">Parent/Guardian Phone *</Label>
                <Input
                  id="parentPhone"
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => updateField('parentPhone', e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Completing...' : 'Complete Profile'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
