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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// Validation Schema
const onboardingSchema = z
  .object({
    // Personal & Address Details
    name: z.string().min(2, 'Name must be at least 2 characters'),
    idNumber: z
      .string()
      .length(13, 'ID Number must be exactly 13 characters')
      .regex(
        /^[0-9]{4}[A-Z][0-9][A-Z]{2}[0-9]{4}[A-Z]$/,
        'Invalid ID format (e.g., 2021A7PS0001P)',
      ),
    degreeType: z.enum(['single', 'dual'], { message: 'Degree type is required' }),
    branch: z.string().optional(),
    beBranch: z.string().optional(),
    mscBranch: z.string().optional(),
    addressLine1: z.string().min(5, 'Address line 1 is required'),
    addressLine2: z.string().min(2, 'Address line 2 is required'),
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
  })
  .refine(
    (data) => {
      if (data.degreeType === 'single') {
        return !!data.branch;
      }
      return true;
    },
    {
      message: 'Branch is required for single degree',
      path: ['branch'],
    },
  )
  .refine(
    (data) => {
      if (data.degreeType === 'dual') {
        return !!data.beBranch;
      }
      return true;
    },
    {
      message: 'B.E. branch is required for dual degree',
      path: ['beBranch'],
    },
  )
  .refine(
    (data) => {
      if (data.degreeType === 'dual') {
        return !!data.mscBranch;
      }
      return true;
    },
    {
      message: 'M.Sc. branch is required for dual degree',
      path: ['mscBranch'],
    },
  );

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

// BITS Pilani Branch Options
const BE_BRANCHES = [
  { value: 'B.E. Chemical', label: 'B.E. Chemical' },
  { value: 'B.E. Civil', label: 'B.E. Civil' },
  { value: 'B.E. Computer Science', label: 'B.E. Computer Science' },
  { value: 'B.E. Electronics and Communication', label: 'B.E. Electronics and Communication' },
  { value: 'B.E. Electrical and Electronics', label: 'B.E. Electrical and Electronics' },
  { value: 'B.E. Electronics and Instrumentation', label: 'B.E. Electronics and Instrumentation' },
  { value: 'B.E. Mathematics and Computing', label: 'B.E. Mathematics and Computing' },
  { value: 'B.E. Mechanical', label: 'B.E. Mechanical' },
  {
    value: 'B.E. Environmental and Sustainability',
    label: 'B.E. Environmental and Sustainability',
  },
];

const MSC_BRANCHES = [
  { value: 'M.Sc. Biological Sciences', label: 'M.Sc. Biological Sciences' },
  { value: 'M.Sc. Chemistry', label: 'M.Sc. Chemistry' },
  { value: 'M.Sc. Economics', label: 'M.Sc. Economics' },
  { value: 'M.Sc. Mathematics', label: 'M.Sc. Mathematics' },
  { value: 'M.Sc. Physics', label: 'M.Sc. Physics' },
  { value: 'M.Sc. Semiconductor and Nanoscience', label: 'M.Sc. Semiconductor and Nanoscience' },
];

const SINGLE_DEGREE_BRANCHES = [
  ...BE_BRANCHES,
  { value: 'B. Pharm.', label: 'B. Pharm.' },
  ...MSC_BRANCHES,
];

export default function OnboardingPage() {
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'personal' | 'parents'>('personal');

  // Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: '',
      idNumber: '',
      degreeType: undefined,
      branch: '',
      beBranch: '',
      mscBranch: '',
      addressLine1: '',
      addressLine2: '',
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

  const degreeTypeValue = watch('degreeType');
  const branchValue = watch('branch');
  const beBranchValue = watch('beBranch');
  const mscBranchValue = watch('mscBranch');

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

      // Send data directly without combining address lines
      const submissionData = {
        ...data,
      };

      const response = await fetch(`${apiUrl}/api/user-details`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submissionData),
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

  const handleNextStep = () => {
    // Validate personal details before moving to next step
    const baseFields = [
      'name',
      'idNumber',
      'degreeType',
      'addressLine1',
      'addressLine2',
      'city',
      'pinCode',
    ] as const;

    // Add branch fields based on degree type
    const degreeType = watch('degreeType');
    const branchFields =
      degreeType === 'single'
        ? ['branch' as const]
        : degreeType === 'dual'
          ? ['beBranch' as const, 'mscBranch' as const]
          : [];

    const personalFields = [...baseFields, ...branchFields];

    const hasErrors = personalFields.some((field) => errors[field]);
    const hasEmptyFields = personalFields.some((field) => !watch(field));

    if (!hasErrors && !hasEmptyFields) {
      setCurrentStep('parents');
    } else {
      toast.error('Please fill in all personal details correctly');
    }
  };

  if (isLoading || !isAuthenticated || user?.hasOnboarded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-primary mb-4"></div>
          <div className="h-4 w-32 bg-primary/20 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/10">
      <Card className="w-full max-w-2xl shadow-lg border">
        <CardHeader className="space-y-1 border-b bg-primary/5">
          <CardTitle className="text-3xl font-bold text-center text-primary">
            Welcome to Pinnacle
          </CardTitle>
          <CardDescription className="text-center text-lg">
            {currentStep === 'personal'
              ? 'Step 1 of 2: Personal Details'
              : 'Step 2 of 2: Parent Details'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {currentStep === 'personal' ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary border-b border-border pb-2">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      {...register('name')}
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="idNumber" className="text-sm font-medium">
                      ID Number
                    </label>
                    <Input
                      id="idNumber"
                      placeholder="e.g., 2021A7PS0001P"
                      {...register('idNumber')}
                      className={errors.idNumber ? 'border-destructive' : ''}
                    />
                    {errors.idNumber && (
                      <p className="text-xs text-destructive">{errors.idNumber.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="degreeType" className="text-sm font-medium">
                    Degree Type
                  </label>
                  <Select
                    value={degreeTypeValue}
                    onValueChange={(value) => {
                      setValue('degreeType', value as 'single' | 'dual', {
                        shouldValidate: true,
                      });
                      // Clear branch fields when degree type changes
                      setValue('branch', '');
                      setValue('beBranch', '');
                      setValue('mscBranch', '');
                    }}
                  >
                    <SelectTrigger className={errors.degreeType ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select degree type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Degree</SelectItem>
                      <SelectItem value="dual">Dual Degree (B.E. + M.Sc.)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.degreeType && (
                    <p className="text-xs text-destructive">{errors.degreeType.message}</p>
                  )}
                </div>

                {degreeTypeValue === 'single' && (
                  <div className="space-y-2">
                    <label htmlFor="branch" className="text-sm font-medium">
                      Branch
                    </label>
                    <Select
                      value={branchValue}
                      onValueChange={(value) => {
                        setValue('branch', value, { shouldValidate: true });
                      }}
                    >
                      <SelectTrigger className={errors.branch ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select your branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {SINGLE_DEGREE_BRANCHES.map((branch) => (
                          <SelectItem key={branch.value} value={branch.value}>
                            {branch.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.branch && (
                      <p className="text-xs text-destructive">{errors.branch.message}</p>
                    )}
                  </div>
                )}

                {degreeTypeValue === 'dual' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="beBranch" className="text-sm font-medium">
                        B.E. Branch
                      </label>
                      <Select
                        value={beBranchValue}
                        onValueChange={(value) => {
                          setValue('beBranch', value, { shouldValidate: true });
                        }}
                      >
                        <SelectTrigger className={errors.beBranch ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select B.E. branch" />
                        </SelectTrigger>
                        <SelectContent>
                          {BE_BRANCHES.map((branch) => (
                            <SelectItem key={branch.value} value={branch.value}>
                              {branch.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.beBranch && (
                        <p className="text-xs text-destructive">{errors.beBranch.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="mscBranch" className="text-sm font-medium">
                        M.Sc. Branch
                      </label>
                      <Select
                        value={mscBranchValue}
                        onValueChange={(value) => {
                          setValue('mscBranch', value, { shouldValidate: true });
                        }}
                      >
                        <SelectTrigger className={errors.mscBranch ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select M.Sc. branch" />
                        </SelectTrigger>
                        <SelectContent>
                          {MSC_BRANCHES.map((branch) => (
                            <SelectItem key={branch.value} value={branch.value}>
                              {branch.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.mscBranch && (
                        <p className="text-xs text-destructive">{errors.mscBranch.message}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary border-b border-border pb-2 mt-4">
                    Address Details
                  </h3>
                  <div className="space-y-2">
                    <label htmlFor="addressLine1" className="text-sm font-medium">
                      Address Line 1
                    </label>
                    <Input
                      id="addressLine1"
                      placeholder="Flat No, Building Name"
                      {...register('addressLine1')}
                      className={errors.addressLine1 ? 'border-destructive' : ''}
                    />
                    {errors.addressLine1 && (
                      <p className="text-xs text-destructive">{errors.addressLine1.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="addressLine2" className="text-sm font-medium">
                      Address Line 2
                    </label>
                    <Input
                      id="addressLine2"
                      placeholder="Street, Area, Locality"
                      {...register('addressLine2')}
                      className={errors.addressLine2 ? 'border-destructive' : ''}
                    />
                    {errors.addressLine2 && (
                      <p className="text-xs text-destructive">{errors.addressLine2.message}</p>
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
                      {errors.city && (
                        <p className="text-xs text-destructive">{errors.city.message}</p>
                      )}
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

                <div className="pt-6">
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full text-lg h-12 font-semibold transition-all"
                  >
                    Proceed
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Father's Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary border-b border-border pb-2">
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
                        <p className="text-xs text-destructive">
                          {errors.fatherJobPosition.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mother's Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary border-b border-border pb-2">
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
                        <p className="text-xs text-destructive">
                          {errors.motherJobPosition.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex gap-4 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep('personal')}
                    className="flex-1 text-lg h-12 font-semibold"
                  >
                    Back
                  </Button>

                  <Button
                    type="submit"
                    className="flex-1 text-lg h-12 font-semibold transition-all"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Saving...
                      </div>
                    ) : (
                      'Complete Profile'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
