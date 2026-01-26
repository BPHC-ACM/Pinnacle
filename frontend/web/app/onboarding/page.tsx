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
  // Personal & Address Details
  name: z.string().min(2, 'Name must be at least 2 characters'),
  branch: z.string().min(2, 'Branch is required'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  pinCode: z.string().regex(/^\d{6}$/, 'Invalid PIN code'),

  // Father Details
  fatherName: z.string().min(2, 'Father name is required'),
  fatherMobileNumber: z
    .string()
    .length(10, 'Mobile number must be exactly 10 digits')
    .regex(/^\d+$/, 'Mobile number must contain only digits'),
  fatherJobSector: z.string().min(2, 'Job sector is required'),
  fatherJobPosition: z.string().min(2, 'Job position is required'),

  // Mother Details
  motherName: z.string().min(2, 'Mother name is required'),
  motherMobileNumber: z
    .string()
    .length(10, 'Mobile number must be exactly 10 digits')
    .regex(/^\d+$/, 'Mobile number must contain only digits'),
  motherJobSector: z.string().min(2, 'Job sector is required'),
  motherJobPosition: z.string().min(2, 'Job position is required'),
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
      city: '',
      pinCode: '',
      fatherName: '',
      fatherMobileNumber: '',
      fatherJobSector: '',
      fatherJobPosition: '',
      motherName: '',
      motherMobileNumber: '',
      motherJobSector: '',
      motherJobPosition: '',
    },
    mode: 'onChange',
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

      <Card className="w-full max-w-2xl shadow-2xl border-border/50 backdrop-blur-sm bg-card/95 relative z-10 transition-all duration-300">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Welcome to Pinnacle
          </CardTitle>
          <CardDescription className="text-center text-lg">
            Please complete your profile to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal & Address Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary/80 border-b pb-2">
                Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    {...register('name')}
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="branch" className="text-sm font-medium">
                    Branch / Department
                  </label>
                  <Input
                    id="branch"
                    placeholder="CSE"
                    {...register('branch')}
                    className={errors.branch ? 'border-destructive' : ''}
                  />
                  {errors.branch && (
                    <p className="text-xs text-destructive">{errors.branch.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium">
                  Full Address
                </label>
                <Input
                  id="address"
                  placeholder="Flat No, Street, Area"
                  {...register('address')}
                  className={errors.address ? 'border-destructive' : ''}
                />
                {errors.address && (
                  <p className="text-xs text-destructive">{errors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-medium">
                    City
                  </label>
                  <Input
                    id="city"
                    placeholder="Mumbai"
                    {...register('city')}
                    className={errors.city ? 'border-destructive' : ''}
                  />
                  {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="pinCode" className="text-sm font-medium">
                    PIN Code
                  </label>
                  <Input
                    id="pinCode"
                    placeholder="400001"
                    maxLength={6}
                    {...register('pinCode')}
                    className={errors.pinCode ? 'border-destructive' : ''}
                  />
                  {errors.pinCode && (
                    <p className="text-xs text-destructive">{errors.pinCode.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Family Details */}
            <div className="space-y-6">
              {/* Father's Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary/80 border-b pb-2">
                  Father&apos;s Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="fatherName" className="text-sm font-medium">
                      Name
                    </label>
                    <Input
                      id="fatherName"
                      placeholder="Father's Name"
                      {...register('fatherName')}
                      className={errors.fatherName ? 'border-destructive' : ''}
                    />
                    {errors.fatherName && (
                      <p className="text-xs text-destructive">{errors.fatherName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="fatherMobileNumber" className="text-sm font-medium">
                      Mobile Number
                    </label>
                    <Input
                      id="fatherMobileNumber"
                      placeholder="9876543210"
                      maxLength={10}
                      {...register('fatherMobileNumber')}
                      className={errors.fatherMobileNumber ? 'border-destructive' : ''}
                    />
                    {errors.fatherMobileNumber && (
                      <p className="text-xs text-destructive">
                        {errors.fatherMobileNumber.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="fatherJobSector" className="text-sm font-medium">
                      Job Sector
                    </label>
                    <Input
                      id="fatherJobSector"
                      placeholder="e.g. IT, Govt, Business"
                      {...register('fatherJobSector')}
                      className={errors.fatherJobSector ? 'border-destructive' : ''}
                    />
                    {errors.fatherJobSector && (
                      <p className="text-xs text-destructive">{errors.fatherJobSector.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="fatherJobPosition" className="text-sm font-medium">
                      Job Position
                    </label>
                    <Input
                      id="fatherJobPosition"
                      placeholder="e.g. Manager"
                      {...register('fatherJobPosition')}
                      className={errors.fatherJobPosition ? 'border-destructive' : ''}
                    />
                    {errors.fatherJobPosition && (
                      <p className="text-xs text-destructive">{errors.fatherJobPosition.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Mother's Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary/80 border-b pb-2">
                  Mother&apos;s Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="motherName" className="text-sm font-medium">
                      Name
                    </label>
                    <Input
                      id="motherName"
                      placeholder="Mother's Name"
                      {...register('motherName')}
                      className={errors.motherName ? 'border-destructive' : ''}
                    />
                    {errors.motherName && (
                      <p className="text-xs text-destructive">{errors.motherName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="motherMobileNumber" className="text-sm font-medium">
                      Mobile Number
                    </label>
                    <Input
                      id="motherMobileNumber"
                      placeholder="9876543210"
                      maxLength={10}
                      {...register('motherMobileNumber')}
                      className={errors.motherMobileNumber ? 'border-destructive' : ''}
                    />
                    {errors.motherMobileNumber && (
                      <p className="text-xs text-destructive">
                        {errors.motherMobileNumber.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="motherJobSector" className="text-sm font-medium">
                      Job Sector
                    </label>
                    <Input
                      id="motherJobSector"
                      placeholder="e.g. Education, Govt"
                      {...register('motherJobSector')}
                      className={errors.motherJobSector ? 'border-destructive' : ''}
                    />
                    {errors.motherJobSector && (
                      <p className="text-xs text-destructive">{errors.motherJobSector.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="motherJobPosition" className="text-sm font-medium">
                      Job Position
                    </label>
                    <Input
                      id="motherJobPosition"
                      placeholder="e.g. Teacher"
                      {...register('motherJobPosition')}
                      className={errors.motherJobPosition ? 'border-destructive' : ''}
                    />
                    {errors.motherJobPosition && (
                      <p className="text-xs text-destructive">{errors.motherJobPosition.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6">
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
