/*eslint-disable*/
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { faker } from '@faker-js/faker';
import {
  PrismaClient,
  UserRole,
  ApplicationStatus,
  JobStatus,
  PlacementCycleType,
  CycleStatus,
  Sector,
  VerificationStatus,
  ProfileStatus,
  NotificationType,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// CONFIGURATION & REALISTIC DATA SETS

const PROFILE_YAML_PATH = path.join(process.cwd(), 'profile.yaml');

const REAL_COMPANIES = [
  {
    name: 'Google',
    sector: Sector.IT,
    description: "Organizing the world's information.",
    website: 'https://careers.google.com',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
  },
  {
    name: 'Microsoft',
    sector: Sector.IT,
    description: 'Empowering every person on the planet.',
    website: 'https://careers.microsoft.com',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/960px-Microsoft_logo.svg.png',
  },
  {
    name: 'DE Shaw',
    sector: Sector.FINANCE,
    description: 'A global investment and technology development firm.',
    website: 'https://www.deshaw.com',
    logo: 'https://yt3.googleusercontent.com/ytc/AIdro_l9GvF0S5yzOn9Pnd6KiKhqUarVPvybk933xlnTZqx6Wtc=s900-c-k-c0x00ffffff-no-rj',
  },
  {
    name: 'Uber',
    sector: Sector.IT,
    description: 'We reimagine the way the world moves for the better.',
    website: 'https://www.uber.com',
    logo: 'https://toppng.com/uploads/preview/uber-logo-png-design-11661767220n4xvcxauuz.png',
  },
  {
    name: 'Goldman Sachs',
    sector: Sector.FINANCE,
    description: 'Global investment banking, securities and investment management firm.',
    website: 'https://www.goldmansachs.com',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/61/Goldman_Sachs.svg',
  },
];

const JOB_ROLES = [
  { title: 'Software Development Engineer', salary: '₹18-24 LPA' },
  { title: 'Product Analyst', salary: '₹12-16 LPA' },
  { title: 'Data Scientist', salary: '₹15-20 LPA' },
  { title: 'Frontend Developer', salary: '₹10-14 LPA' },
  { title: 'Backend Engineer', salary: '₹14-22 LPA' },
  { title: 'Quant Researcher', salary: '₹35-50 LPA' },
];

const BRANCHES = [
  'Computer Science',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Mathematics & Computing',
  'Mechanical Engineering',
];

// DATABASE CONNECTION

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

// HELPER FUNCTIONS

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomSubset = <T>(arr: T[], count: number): T[] =>
  faker.helpers.arrayElements(arr, count);

// Helper to read YAML and cast strictly to any to avoid TS errors on dynamic properties
const loadYamlUser = () => {
  try {
    const fileContents = fs.readFileSync(PROFILE_YAML_PATH, 'utf8');
    const doc = yaml.load(fileContents) as any;
    console.log(`Loaded user profile for: ${doc.email}`);
    return doc;
  } catch (e) {
    console.error('Failed to load profile.yaml. Please ensure it exists.');
    throw e;
  }
};

// MAIN SEED FUNCTION

async function main(): Promise<void> {
  console.log('Starting generic database seeding...');

  // 1. CLEANUP
  console.log('Cleaning existing data...');
  // Delete tables in correct order to avoid foreign key constraints
  await prisma.attendanceRecord.deleteMany();
  await prisma.jobEligibility.deleteMany();
  await prisma.markSheet.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.application.deleteMany();
  await prisma.jobQuestion.deleteMany();
  await prisma.job.deleteMany();
  await prisma.placementCycle.deleteMany();
  await prisma.company.deleteMany();
  await prisma.resumeFile.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.education.deleteMany();
  await prisma.project.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.language.deleteMany();
  await prisma.accomplishment.deleteMany();
  await prisma.extracurricular.deleteMany();
  await prisma.positionOfResponsibility.deleteMany();
  await prisma.course.deleteMany();
  await prisma.userDetails.deleteMany();
  await prisma.adminRole.deleteMany();
  await prisma.user.deleteMany();

  // 2. PLACEMENT CYCLES
  console.log('Creating placement cycles...');
  const currentCycle = await prisma.placementCycle.create({
    data: {
      name: 'Placement Drive 2025-26',
      type: PlacementCycleType.PLACEMENT,
      academicYear: '2025-2026',
      status: CycleStatus.ACTIVE,
      startDate: new Date('2025-08-01'),
      endDate: new Date('2026-05-31'),
    },
  });

  const internshipCycle = await prisma.placementCycle.create({
    data: {
      name: 'Summer Internship 2026',
      type: PlacementCycleType.INTERNSHIP,
      academicYear: '2025-2026',
      status: CycleStatus.ACTIVE,
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-04-30'),
    },
  });

  // 3. CREATE COMPANIES & JOBS
  console.log('Creating companies and jobs...');
  const companyIds: string[] = [];
  const jobIds: string[] = [];

  for (const compData of REAL_COMPANIES) {
    const company = await prisma.company.create({
      data: {
        name: compData.name,
        website: compData.website,
        description: compData.description,
        sector: compData.sector,
        size: faker.helpers.arrayElement(['1000+', '5000+', '10000+']),
        location: faker.helpers.arrayElement([
          'Bangalore',
          'Hyderabad',
          'Gurgaon',
          'Pune',
          'Mumbai',
        ]),
        logo: compData.logo,
        email: `careers@${compData.name.toLowerCase().replace(/\s+/g, '')}.com`,
      },
    });
    companyIds.push(company.id);

    // Create 2-4 jobs per company
    const numJobs = faker.number.int({ min: 2, max: 4 });
    for (let i = 0; i < numJobs; i++) {
      const role = getRandomItem(JOB_ROLES);
      const isInternship = Math.random() > 0.7; // 30% chance of internship

      const job = await prisma.job.create({
        data: {
          companyId: company.id,
          placementCycleId: isInternship ? internshipCycle.id : currentCycle.id,
          title: isInternship ? `${role.title} Intern` : role.title,
          description: faker.lorem.paragraph() + '\n\n' + faker.lorem.paragraph(),
          location: company.location,
          type: isInternship ? 'Internship' : 'Full-time',
          salary: isInternship ? '₹50,000 - ₹1,00,000 / month' : role.salary,
          deadline: faker.date.future({ years: 0.2 }),
          status: JobStatus.OPEN,
        },
      });
      jobIds.push(job.id);

      // Add screening questions
      await prisma.jobQuestion.createMany({
        data: [
          {
            jobId: job.id,
            question: 'Why are you a good fit for this role?',
            order: 1,
            required: true,
          },
          { jobId: job.id, question: 'Are you willing to relocate?', order: 2, required: true },
        ],
      });
    }
  }

  // 4. MAIN USER (FROM YAML)
  const yamlData = loadYamlUser();
  console.log(`Creating Main User: ${yamlData.email}`);

  const mainUser = await prisma.user.upsert({
    where: { email: yamlData.email },

    update: {},

    create: {
      email: yamlData.email,
      name: yamlData.name,
      googleId: yamlData.googleId || `google-auth-${Date.now()}`,
      role: UserRole.USER,
      phone: yamlData.phone,
      location: yamlData.location,
      linkedin: yamlData.linkedin,
      github: yamlData.github,
      website: yamlData.website,
      summary: yamlData.summary,
      profileStatus: (yamlData.profileStatus as ProfileStatus) || ProfileStatus.VERIFIED,
      verificationStatus:
        (yamlData.verificationStatus as VerificationStatus) || VerificationStatus.APPROVED,

      // Student-specific fields
      studentId: yamlData.studentId,
      branch: yamlData.branch,
      currentYear: yamlData.currentYear,

      education: yamlData.education ? { create: yamlData.education } : undefined,
      experiences: yamlData.experiences ? { create: yamlData.experiences } : undefined,
      projects: yamlData.projects ? { create: yamlData.projects } : undefined,
      skills: yamlData.skills ? { create: yamlData.skills } : undefined,
      positionsOfResponsibility: yamlData.positionsOfResponsibility
        ? { create: yamlData.positionsOfResponsibility }
        : undefined,
      accomplishments: yamlData.accomplishments ? { create: yamlData.accomplishments } : undefined,
      certifications: yamlData.certifications ? { create: yamlData.certifications } : undefined,
      languages: yamlData.languages ? { create: yamlData.languages } : undefined,
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: mainUser.id,
        type: NotificationType.INTERVIEW_SCHEDULED,
        title: 'Interview Scheduled - Google',
        message: 'Your technical interview is scheduled for tomorrow at 10 AM.',
        isRead: false,
      },
      {
        userId: mainUser.id,
        type: NotificationType.JOB_CREATED,
        title: 'New Job: DE Shaw',
        message: 'DE Shaw has posted a new role for SDE I.',
        isRead: true,
      },
    ],
  });

  // 5. GENERATE BULK USERS
  console.log('Generating bulk student data...');
  const userBatchSize = 20;

  for (let i = 0; i < userBatchSize; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const branch = getRandomItem(BRANCHES);

    const user = await prisma.user.create({
      data: {
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        name: `${firstName} ${lastName}`,
        googleId: `google-${faker.string.uuid()}`,
        role: UserRole.USER,
        phone: faker.phone.number({ style: 'national' }),
        location: 'Hyderabad, India',
        profileStatus: ProfileStatus.VERIFIED,

        education: {
          create: [
            {
              institution: 'BITS Pilani, Hyderabad Campus',
              degree: 'B.E.',
              branch: branch,
              location: 'Hyderabad, India',
              gpa: faker.number.float({ min: 6.5, max: 9.8, multipleOf: 0.01 }).toString(),
              startDate: new Date('2023-08-01').toISOString(),
              endDate: new Date('2027-05-01').toISOString(),
              verificationStatus: VerificationStatus.APPROVED,
            },
          ],
        },

        skills: {
          create: [
            {
              category: 'Languages',
              items: getRandomSubset(['C', 'C++', 'Java', 'Python', 'JS'], 3),
              verificationStatus: VerificationStatus.APPROVED,
            },
          ],
        },
      },
    });

    const applyCount = faker.number.int({ min: 0, max: 4 });
    const userJobs = getRandomSubset(jobIds, applyCount);

    for (const jId of userJobs) {
      const resume = await prisma.resume.create({
        data: {
          userId: user.id,
          title: 'Resume',
          data: {},
          template: 'modern',
        },
      });

      await prisma.application.create({
        data: {
          userId: user.id,
          jobId: jId,
          resumeId: resume.id,
          status: getRandomItem(Object.values(ApplicationStatus)),
          appliedAt: faker.date.recent({ days: 30 }),
        },
      });
    }
  }

  // 6. ADMIN USER
  console.log('Creating Admin...');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@pinnacle.com' },
    update: {},
    create: {
      email: 'admin@pinnacle.com',
      name: 'Placement Unit',
      googleId: 'admin-g-id',
      role: UserRole.SPT,
    },
  });

  // 7. ANNOUNCEMENTS
  console.log('Creating announcements...');
  await prisma.announcement.createMany({
    data: [
      {
        title: 'Placement Orientation 2025',
        senderId: adminUser.id,
        content:
          'All students are requested to attend the orientation session at the Auditorium on Aug 5th.',
        createdAt: new Date('2025-08-01'),
      },
      {
        title: 'Resume Verification Deadline',
        senderId: adminUser.id,
        content:
          'Please submit your resumes for verification by this Friday. Late submissions will not be accepted.',
        createdAt: new Date(),
      },
    ],
  });

  console.log('Seeding completed successfully!');
  console.log(`Summary:`);
  console.log(`- Main User: ${yamlData.email}`);
  console.log(`- Companies: ${companyIds.length}`);
  console.log(`- Jobs: ${jobIds.length}`);
  console.log(`- Random Students: ${userBatchSize}`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
