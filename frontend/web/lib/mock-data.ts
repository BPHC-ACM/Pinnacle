import type {
  JobWithStats,
  ApplicationWithDetails,
  AdminDashboardStats,
  ApplicationStatus,
  JobStatus,
  Student,
  PlacementStatus,
  ProfileStatus,
} from '@/types/admin.types';

// Helper function to generate random date
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper to pick random item from array
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Company names
const companies = [
  'Google',
  'Microsoft',
  'Apple',
  'Amazon',
  'Meta',
  'Netflix',
  'Tesla',
  'SpaceX',
  'Stripe',
  'Airbnb',
  'Uber',
  'Adobe',
  'Salesforce',
  'Oracle',
  'IBM',
  'Intel',
  'NVIDIA',
  'Samsung',
  'Twitter',
  'LinkedIn',
  'Spotify',
  'Dropbox',
  'Slack',
  'Zoom',
  'Atlassian',
  'Cisco',
  'VMware',
  'Dell',
  'HP',
  'Accenture',
];

// Job titles
const jobTitles = [
  'Software Engineer',
  'Senior Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'DevOps Engineer',
  'Data Scientist',
  'Machine Learning Engineer',
  'Product Manager',
  'UI/UX Designer',
  'QA Engineer',
  'Cloud Architect',
  'Security Engineer',
  'Mobile Developer',
  'Data Engineer',
  'Business Analyst',
  'Technical Writer',
  'Engineering Manager',
  'Solutions Architect',
  'Site Reliability Engineer',
  'Platform Engineer',
  'AI Research Engineer',
  'Blockchain Developer',
  'Game Developer',
  'Embedded Systems Engineer',
];

// First names
const firstNames = [
  'Aarav',
  'Ananya',
  'Arjun',
  'Diya',
  'Ishaan',
  'Aanya',
  'Rohan',
  'Sara',
  'Vivaan',
  'Anika',
  'Krishna',
  'Navya',
  'Advait',
  'Ira',
  'Reyansh',
  'Kiara',
  'Aditya',
  'Meera',
  'Kabir',
  'Zara',
  'Dhruv',
  'Myra',
  'Arnav',
  'Pari',
  'Vihaan',
  'Aarohi',
  'Rudra',
  'Saanvi',
  'Ayaan',
  'Anvi',
  'Atharv',
  'Riya',
  'Shivansh',
  'Aadhya',
  'Pranav',
  'Avni',
  'Aryan',
  'Ahana',
  'Sai',
  'Niya',
  'Shaurya',
  'Mira',
  'Krish',
  'Aarna',
  'Yuvaan',
  'Tara',
  'Kian',
  'Mishka',
  'Veer',
  'Disha',
];

// Last names
const lastNames = [
  'Sharma',
  'Kumar',
  'Singh',
  'Patel',
  'Gupta',
  'Reddy',
  'Verma',
  'Jain',
  'Agarwal',
  'Mehta',
  'Desai',
  'Shah',
  'Rao',
  'Nair',
  'Pillai',
  'Iyer',
  'Menon',
  'Ghosh',
  'Roy',
  'Mukherjee',
  'Banerjee',
  'Das',
  'Saxena',
  'Malhotra',
  'Kapoor',
  'Bhat',
  'Kulkarni',
  'Joshi',
  'Naik',
  'Hegde',
];

// Job locations
const locations = [
  'Bangalore, India',
  'Hyderabad, India',
  'Mumbai, India',
  'Pune, India',
  'Chennai, India',
  'Delhi, India',
  'Gurgaon, India',
  'Noida, India',
  'Remote',
  'San Francisco, USA',
  'New York, USA',
  'Seattle, USA',
  'Austin, USA',
  'London, UK',
  'Singapore',
  'Dubai, UAE',
];

// Job types
const jobTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'] as const;

// Application statuses
const applicationStatuses: ApplicationStatus[] = [
  'APPLIED',
  'SHORTLISTED',
  'INTERVIEWING',
  'REJECTED',
  'HIRED',
  'WITHDRAWN',
];

// Job statuses
const jobStatuses: JobStatus[] = ['PENDING', 'OPEN', 'CLOSED', 'PAUSED'];

// Generate mock jobs
export const generateMockJobs = (count: number = 50): JobWithStats[] => {
  const jobs: JobWithStats[] = [];
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < count; i++) {
    const companyName = randomItem(companies);
    // Make first 8 jobs pending for review
    const status: JobStatus = i < 8 ? 'PENDING' : randomItem(jobStatuses);
    const createdAt = randomDate(sixMonthsAgo, now);
    const deadline = new Date(
      createdAt.getTime() + (30 + Math.random() * 60) * 24 * 60 * 60 * 1000
    );

    const totalApps = status === 'PENDING' ? 0 : Math.floor(Math.random() * 150) + 10;
    const applied = Math.floor(totalApps * (Math.random() * 0.4 + 0.2));
    const shortlisted = Math.floor(totalApps * (Math.random() * 0.2 + 0.1));
    const interviewing = Math.floor(totalApps * (Math.random() * 0.15 + 0.05));
    const hired = Math.floor(totalApps * (Math.random() * 0.1 + 0.02));
    const rejected = Math.floor(totalApps * (Math.random() * 0.2 + 0.05));
    const withdrawn = totalApps - applied - shortlisted - interviewing - hired - rejected;

    const minCgpa = 6.5 + Math.random() * 2; // 6.5 to 8.5
    const maxBacklogs = Math.floor(Math.random() * 3); // 0 to 2
    const selectedDepts = ['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil'].filter(
      () => Math.random() > 0.4
    );
    const selectedBatches = [2024, 2025, 2026, 2027].filter(() => Math.random() > 0.3);

    jobs.push({
      id: `job-${i + 1}`,
      companyId: `company-${Math.floor(Math.random() * 30) + 1}`,
      title: randomItem(jobTitles),
      description: `We are looking for a talented professional to join our team at ${companyName}. This is an exciting opportunity to work on cutting-edge technologies and make a real impact.

Key Responsibilities:
• Design and develop scalable software solutions
• Collaborate with cross-functional teams
• Participate in code reviews and technical discussions
• Mentor junior team members

Requirements:
• Strong programming skills
• Excellent problem-solving abilities
• Good communication skills
• Team player with leadership qualities`,
      location: randomItem(locations),
      type: randomItem([...jobTypes]),
      salary: `₹${(Math.random() * 10 + 8).toFixed(1)}L - ₹${(Math.random() * 15 + 15).toFixed(
        1
      )}L CTC`,
      deadline: deadline.toISOString(),
      status,
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
      deletedAt: undefined,
      company: {
        id: `company-${Math.floor(Math.random() * 30) + 1}`,
        name: companyName,
        logo: undefined,
      },
      eligibility: {
        minCgpa: parseFloat(minCgpa.toFixed(1)),
        maxBacklogs,
        departments: selectedDepts.length > 0 ? selectedDepts : ['CSE', 'ECE'],
        batches: selectedBatches.length > 0 ? selectedBatches : [2024, 2025],
      },
      questions:
        Math.random() > 0.5
          ? [
              { id: '1', question: 'Why do you want to join our company?', required: true },
              { id: '2', question: 'Describe your most challenging project.', required: true },
              { id: '3', question: 'What are your career goals?', required: false },
            ]
          : [],
      applicationStats: {
        total: totalApps,
        applied,
        shortlisted,
        interviewing,
        rejected,
        hired,
        withdrawn,
      },
    });
  }

  return jobs.sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return bTime - aTime;
  });
};

// Generate mock applications for a specific job
export const generateMockApplications = (
  jobId: string,
  count: number = 50
): ApplicationWithDetails[] => {
  const applications: ApplicationWithDetails[] = [];
  const now = new Date();
  const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Get job details for reference
  const jobTitle = randomItem(jobTitles);
  const companyName = randomItem(companies);

  for (let i = 0; i < count; i++) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
    const appliedAt = randomDate(twoMonthsAgo, now);

    applications.push({
      id: `app-${jobId}-${i + 1}`,
      userId: `user-${i + 1}`,
      jobId,
      status: randomItem(applicationStatuses),
      coverLetter: `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${companyName}. With ${
        Math.floor(Math.random() * 5) + 1
      } years of relevant experience and a passion for innovation, I am confident that I would be a valuable addition to your team.

Throughout my career, I have consistently demonstrated:
• Strong technical skills and problem-solving abilities
• Excellent communication and teamwork capabilities  
• A track record of delivering high-quality results on time
• Enthusiasm for learning new technologies and best practices

I am particularly drawn to ${companyName}'s commitment to excellence and innovation. I would welcome the opportunity to contribute to your team's success and grow professionally in this role.

Thank you for considering my application. I look forward to discussing how my skills and experience align with your needs.

Best regards,
${firstName} ${lastName}`,
      resumeId: `resume-${i + 1}`,
      appliedAt: appliedAt.toISOString(),
      updatedAt: appliedAt.toISOString(),
      user: {
        id: `user-${i + 1}`,
        email,
        name: `${firstName} ${lastName}`,
        phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
        github: `https://github.com/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
      },
      job: {
        id: jobId,
        title: jobTitle,
        description: `Exciting opportunity to join ${companyName}`,
        companyId: `company-${Math.floor(Math.random() * 30) + 1}`,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        company: {
          id: `company-${Math.floor(Math.random() * 30) + 1}`,
          name: companyName,
        },
      },
      resume: {
        id: `resume-${i + 1}`,
        title: `${firstName}_${lastName}_Resume.pdf`,
      },
    });
  }

  return applications.sort((a, b) => {
    const aTime = typeof a.appliedAt === 'string' ? new Date(a.appliedAt).getTime() : 0;
    const bTime = typeof b.appliedAt === 'string' ? new Date(b.appliedAt).getTime() : 0;
    return bTime - aTime;
  });
};

// Departments
const departments = ['CSE', 'ECE', 'Mechanical', 'Civil', 'EEE', 'Chemical', 'Biotechnology'];

export const generateMockStudents = (count: number = 100): Student[] => {
  const students: Student[] = [];
  const batches = [2024, 2025, 2026, 2027];

  for (let i = 0; i < count; i++) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    const department = randomItem(departments);
    const batch = randomItem(batches);
    const cgpa = Math.random() * 3 + 7; // 7.0 to 10.0
    const backlogs = Math.random() < 0.7 ? 0 : Math.floor(Math.random() * 3); // 70% have 0 backlogs
    const isEligible = cgpa >= 7.0 && backlogs === 0;
    const placementStatus: PlacementStatus =
      Math.random() < 0.3 ? 'PLACED' : Math.random() < 0.8 ? 'UNPLACED' : 'DEFERRED';
    const profileStatus: ProfileStatus =
      Math.random() < 0.1 ? 'INCOMPLETE' : Math.random() < 0.7 ? 'COMPLETE' : 'LOCKED';

    students.push({
      id: `student-${i + 1}`,
      rollNumber: `${batch}${department.substring(0, 2).toUpperCase()}${String(i + 1).padStart(
        3,
        '0'
      )}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@university.edu`,
      phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      department,
      batch,
      cgpa: parseFloat(cgpa.toFixed(2)),
      backlogs,
      placementStatus,
      profileStatus,
      isEligible,
      photoUrl: undefined,
      resumeId: Math.random() < 0.8 ? `resume-${i + 1}` : undefined,
      linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
      github: `https://github.com/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
      createdAt: randomDate(new Date(2023, 0, 1), new Date()).toISOString(),
      updatedAt: new Date().toISOString(),
      profileLockedAt: profileStatus === 'LOCKED' ? new Date().toISOString() : undefined,
      offers: placementStatus === 'PLACED' ? Math.floor(Math.random() * 3) + 1 : 0,
      appliedJobs: Math.floor(Math.random() * 10) + 1,
    });
  }

  return students.sort((a, b) => a.name.localeCompare(b.name));
};

// Generate mock dashboard stats
export const generateMockDashboardStats = (): AdminDashboardStats => {
  const totalJobs = Math.floor(Math.random() * 50) + 30;
  const openJobs = Math.floor(totalJobs * (Math.random() * 0.5 + 0.3));
  const pendingJobs = Math.floor(totalJobs * 0.15); // ~15% pending approval
  const closedJobs = totalJobs - openJobs - pendingJobs;

  const totalApplications = Math.floor(Math.random() * 1000) + 500;
  const pendingApplications = Math.floor(totalApplications * (Math.random() * 0.3 + 0.2));
  const shortlistedApplications = Math.floor(totalApplications * (Math.random() * 0.2 + 0.1));
  const hiredApplications = Math.floor(totalApplications * (Math.random() * 0.1 + 0.03));

  return {
    totalJobs,
    openJobs,
    closedJobs,
    pendingJobs,
    totalApplications,
    pendingApplications,
    shortlistedApplications,
    hiredApplications,
  };
};

// Export all generators
export const mockData = {
  jobs: generateMockJobs(50),
  students: generateMockStudents(100),
  getApplicationsForJob: (jobId: string) => generateMockApplications(jobId, 50),
  dashboardStats: generateMockDashboardStats(),
};
