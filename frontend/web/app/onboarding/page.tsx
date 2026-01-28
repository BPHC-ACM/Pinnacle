'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

// Validation Schema
const onboardingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  branch: z.string().min(2, 'Branch is required'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  parentName: z.string().min(2, 'Parent name is required'),
  parentMobileNumber: z
    .string()
    .length(10, 'Mobile number must be exactly 10 digits')
    .regex(/^\d+$/, 'Mobile number must contain only digits'),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form setup
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: '',
      branch: '',
      address: '',
      parentName: '',
      parentMobileNumber: '',
    },
  });

  // Pre-fill name from auth user if available
  useEffect(() => {
    if (user?.name) {
      setValue('name', user.name);
    }
  }, [user, setValue]);

  // Auth and Onboarding checks
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/');
      } else if (user?.hasOnboarded) {
        router.push('/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  const onSubmit = async (data: OnboardingFormValues) => {
    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const token = localStorage.getItem('token');

      const response = await fetch(`${apiUrl}/api/user-details`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit onboarding details');
      }

      // Refresh user context to update hasOnboarded status
      await refreshUser();

      router.push('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to save details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !isAuthenticated || user?.hasOnboarded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-primary/20 mb-4"></div>
          <div className="h-4 w-32 bg-primary/20 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div
        className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 0%, hsl(var(--primary)) 0%, transparent 50%)',
        }}
      />

      <Card className="w-full max-w-lg shadow-2xl border-border/50 backdrop-blur-sm bg-card/95 relative z-10">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Welcome to Pinnacle
          </CardTitle>
          <CardDescription className="text-center text-lg">
            Let&apos;s get your profile set up to start your journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Full Name
              </label>
              <Input
                id="name"
                placeholder="John Doe"
                {...register('name')}
                className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="branch"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Branch / Department
              </label>
              <Input
                id="branch"
                placeholder="Computer Science & Engineering"
                {...register('branch')}
                className={errors.branch ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.branch && <p className="text-xs text-destructive">{errors.branch.message}</p>}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="address"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Current Address
              </label>
              <Input
                id="address"
                placeholder="Hostel Block A, Room 101"
                {...register('address')}
                className={
                  errors.address ? 'border-destructive focus-visible:ring-destructive' : ''
                }
              />
              {errors.address && (
                <p className="text-xs text-destructive">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="parentName"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Parent&apos;s Name
                </label>
                <Input
                  id="parentName"
                  placeholder="Jane Doe"
                  {...register('parentName')}
                  className={
                    errors.parentName ? 'border-destructive focus-visible:ring-destructive' : ''
                  }
                />
                {errors.parentName && (
                  <p className="text-xs text-destructive">{errors.parentName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="parentMobileNumber"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Parent&apos;s Mobile
                </label>
                <Input
                  id="parentMobileNumber"
                  placeholder="9876543210"
                  maxLength={10}
                  {...register('parentMobileNumber')}
                  className={
                    errors.parentMobileNumber
                      ? 'border-destructive focus-visible:ring-destructive'
                      : ''
                  }
                />
                {errors.parentMobileNumber && (
                  <p className="text-xs text-destructive">{errors.parentMobileNumber.message}</p>
                )}
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full text-lg h-12 font-semibold shadow-lg hover:shadow-primary/25 transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </div>
                ) : (
                  'Complete Profile'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
