/*eslint-disable*/
import 'dotenv/config';
import { faker } from '@faker-js/faker';
import {
  PrismaClient,
  UserRole,
  ApplicationStatus,
  JobStatus,
  PlacementCycleType,
  CycleStatus,
  ProficiencyLevel,
  AttendanceType,
} from '@prisma/client';

import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  console.log('Starting database seeding...');

  // Clear existing data (optional - be careful in production!)
  console.log('Cleaning existing data...');
  await prisma.attendanceRecord.deleteMany();
  await prisma.jobEligibility.deleteMany();
  await prisma.markSheet.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.course.deleteMany();
  await prisma.positionOfResponsibility.deleteMany();
  await prisma.extracurricular.deleteMany();
  await prisma.accomplishment.deleteMany();
  await prisma.application.deleteMany();
  await prisma.jobQuestion.deleteMany();
  await prisma.job.deleteMany();
  await prisma.placementCycle.deleteMany();
  await prisma.company.deleteMany();
  await prisma.resumeFile.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.language.deleteMany();
  await prisma.project.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.education.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.user.deleteMany();

  // 0. Create Placement Cycle
  console.log('Creating placement cycle...');
  const placementCycle = await prisma.placementCycle.create({
    data: {
      name: 'Placement Drive 2025-26',
      type: PlacementCycleType.PLACEMENT,
      academicYear: '2025-2026',
      status: CycleStatus.ACTIVE,
      startDate: new Date('2025-08-01'),
      endDate: new Date('2026-05-31'),
    },
  });

  // 1. Create Admin User
  console.log('Creating admin user...');
  await prisma.user.create({
    data: {
      email: 'admin@gmail.com',
      name: 'Admin User',
      googleId: 'dev-admin-google-id',
      role: UserRole.ADMIN,
      phone: faker.phone.number(),
      location: faker.location.city() + ', ' + faker.location.country(),
      bio: 'System administrator for Placement Portal',
      title: 'System Administrator',
      summary: 'Managing the placement portal and ensuring smooth operations.',
    },
  });

  // 2. Create Regular Users (Students)
  console.log('Creating regular users...');
  const branches = [
    'Computer Science',
    'Electronics',
    'Mechanical',
    'Civil',
    'Information Technology',
  ];
  const users = await Promise.all(
    Array.from({ length: 30 }).map(async (_, index) => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email({ firstName, lastName }).toLowerCase();
      const year = faker.helpers.arrayElement([2, 3, 4]);
      const branch = faker.helpers.arrayElement(branches);

      return prisma.user.create({
        data: {
          email,
          name: `${firstName} ${lastName}`,
          googleId: `google-${faker.string.alphanumeric(20)}`,
          role: UserRole.USER,
          phone: faker.phone.number(),
          location: faker.location.city() + ', ' + faker.location.country(),
          linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
          github: `https://github.com/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
          website: faker.helpers.maybe(() => faker.internet.url(), { probability: 0.3 }),
          bio: faker.person.bio(),
          title: faker.person.jobTitle(),
          summary: faker.lorem.paragraph(),
          // Student-specific fields
          studentId: `2022A7PS${String(index + 1).padStart(4, '0')}`,
          branch: branch,
          currentYear: year,
          isFrozen: faker.helpers.maybe(() => true, { probability: 0.1 }),
          // Parent details
          parentName: faker.person.fullName(),
          parentEmail: faker.internet.email(),
          parentPhone: faker.phone.number(),
          parentRelation: faker.helpers.arrayElement(['Father', 'Mother', 'Guardian']),
        },
      });
    })
  );

  // 3. Add Experiences for each user
  console.log('Creating work experiences...');
  for (const user of users) {
    const experienceCount = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < experienceCount; i++) {
      await prisma.experience.create({
        data: {
          userId: user.id,
          company: faker.company.name(),
          position: faker.person.jobTitle(),
          location: faker.location.city(),
          startDate: faker.date.past({ years: 3 }),
          endDate: i === 0 ? null : faker.date.recent({ days: 365 }),
          current: i === 0,
          description: faker.lorem.paragraph(),
          highlights: faker.helpers.multiple(() => faker.lorem.sentence(), {
            count: { min: 2, max: 4 },
          }),
          order: i,
        },
      });
    }
  }

  // 4. Add Education for each user
  console.log('Creating education records...');
  for (const user of users) {
    const educationCount = faker.number.int({ min: 1, max: 2 });
    for (let i = 0; i < educationCount; i++) {
      await prisma.education.create({
        data: {
          userId: user.id,
          institution: faker.company.name() + ' University',
          degree: faker.helpers.arrayElement([
            'Bachelor of Technology',
            'Master of Science',
            'Bachelor of Science',
          ]),
          branch: faker.helpers.arrayElement([
            'Computer Science',
            'Information Technology',
            'Electronics',
            'Mechanical Engineering',
          ]),
          location: faker.location.city(),
          startDate: faker.date.past({ years: 4 }),
          endDate: i === 0 ? null : faker.date.recent({ days: 365 }),
          gpa: faker.number.float({ min: 7.0, max: 10.0, fractionDigits: 2 }).toString(),
          achievements: faker.helpers.multiple(() => faker.lorem.sentence(), {
            count: { min: 1, max: 3 },
          }),
          order: i,
        },
      });
    }
  }

  // 5. Add Skills for each user
  console.log('Creating skills...');
  for (const user of users) {
    const skillCategories = [
      {
        category: 'Programming Languages',
        items: faker.helpers.arrayElements(
          ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust'],
          { min: 3, max: 5 }
        ),
      },
      {
        category: 'Frameworks & Libraries',
        items: faker.helpers.arrayElements(
          ['React', 'Node.js', 'Express', 'Next.js', 'Django', 'Spring Boot', 'FastAPI'],
          { min: 2, max: 4 }
        ),
      },
      {
        category: 'Databases',
        items: faker.helpers.arrayElements(['PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Prisma'], {
          min: 2,
          max: 3,
        }),
      },
      {
        category: 'Tools & Technologies',
        items: faker.helpers.arrayElements(
          ['Docker', 'Git', 'AWS', 'Azure', 'Kubernetes', 'CI/CD'],
          { min: 2, max: 4 }
        ),
      },
    ];

    for (let i = 0; i < skillCategories.length; i++) {
      await prisma.skill.create({
        data: {
          userId: user.id,
          category: skillCategories[i].category,
          items: skillCategories[i].items,
          order: i,
        },
      });
    }
  }

  // 6. Add Projects for each user
  console.log('Creating projects...');
  for (const user of users) {
    const projectCount = faker.number.int({ min: 2, max: 4 });
    for (let i = 0; i < projectCount; i++) {
      await prisma.project.create({
        data: {
          userId: user.id,
          title: faker.commerce.productName() + ' Platform',
          description: faker.lorem.paragraph(),
          domain: faker.commerce.department(),
          tools: faker.helpers.arrayElements(
            ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'AWS'],
            { min: 3, max: 5 }
          ),
          referenceUrl: faker.helpers.maybe(() => faker.internet.url(), { probability: 0.5 }),
          // github: `https://github.com/${user.name
          //   .toLowerCase()
          //   .replace(' ', '-')}/${faker.lorem.word()}`,
          outcomes: faker.helpers.multiple(() => faker.lorem.sentence(), {
            count: { min: 2, max: 4 },
          }),
          order: i,
        },
      });
    }
  }

  // 7. Add Certifications
  console.log('Creating certifications...');
  for (const user of users.slice(0, 7)) {
    const certCount = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < certCount; i++) {
      await prisma.certification.create({
        data: {
          userId: user.id,
          name: faker.helpers.arrayElement([
            'AWS Certified Developer',
            'Google Cloud Professional',
            'Microsoft Azure Fundamentals',
            'Kubernetes Administrator',
          ]),
          issuer: faker.helpers.arrayElement([
            'Amazon Web Services',
            'Google',
            'Microsoft',
            'Linux Foundation',
          ]),
          date: faker.date.past({ years: 2 }),
          url: faker.internet.url(),
          order: i,
        },
      });
    }
  }

  // 8. Add Languages
  console.log('Creating language proficiencies...');
  for (const user of users) {
    const languages = [
      { name: 'English', proficiency: ProficiencyLevel.ADVANCED },
      {
        name: 'Hindi',
        proficiency: faker.helpers.arrayElement([
          ProficiencyLevel.NATIVE,
          ProficiencyLevel.ADVANCED,
          ProficiencyLevel.INTERMEDIATE,
        ]),
      },
    ];

    for (let i = 0; i < languages.length; i++) {
      await prisma.language.create({
        data: {
          userId: user.id,
          name: languages[i].name,
          proficiency: languages[i].proficiency,
          order: i,
        },
      });
    }
  }

  // 9. Create Resumes for users
  console.log('Creating resumes...');
  for (const user of users.slice(0, 8)) {
    const resumeCount = faker.number.int({ min: 1, max: 2 });
    for (let i = 0; i < resumeCount; i++) {
      await prisma.resume.create({
        data: {
          userId: user.id,
          title: i === 0 ? 'Default Resume' : `Resume for ${faker.company.name()}`,
          template: faker.helpers.arrayElement(['modern', 'classic', 'minimal']),
          data: {
            personal: {
              name: user.name,
              email: user.email,
              phone: user.phone,
              location: user.location,
            },
            summary: user.summary,
          },
        },
      });
    }
  }

  // 10. Create Companies
  console.log('Creating companies...');
  const companies = await Promise.all(
    Array.from({ length: 5 }).map(async () => {
      return prisma.company.create({
        data: {
          name: faker.company.name(),
          website: faker.internet.url(),
          description: faker.company.catchPhrase() + '. ' + faker.lorem.paragraph(),
          logo: faker.image.avatar(),
          industry: faker.helpers.arrayElement([
            'Technology',
            'Finance',
            'Healthcare',
            'E-commerce',
            'Consulting',
          ]),
          size: faker.helpers.arrayElement([
            '1-10',
            '11-50',
            '51-200',
            '201-500',
            '501-1000',
            '1000+',
          ]),
          location: faker.location.city() + ', ' + faker.location.country(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          linkedin: `https://linkedin.com/company/${faker.lorem.word()}`,
        },
      });
    })
  );

  // 11. Create Jobs
  console.log('Creating job postings...');
  const jobs = [];
  for (const company of companies) {
    const jobCount = faker.number.int({ min: 2, max: 4 });
    for (let i = 0; i < jobCount; i++) {
      const job = await prisma.job.create({
        data: {
          companyId: company.id,
          placementCycleId: placementCycle.id,
          title: faker.person.jobTitle(),
          description: faker.lorem.paragraphs(3),
          location: faker.helpers.arrayElement(['Remote', 'Hybrid', faker.location.city()]),
          type: faker.helpers.arrayElement(['Full-time', 'Part-time', 'Internship', 'Contract']),
          salary: faker.helpers.arrayElement([
            '₹5-8 LPA',
            '₹8-12 LPA',
            '₹12-18 LPA',
            'Unpaid',
            '₹20,000/month',
          ]),
          deadline: faker.date.future({ years: 0.25 }),
          status: faker.helpers.arrayElement([
            JobStatus.OPEN,
            JobStatus.OPEN,
            JobStatus.OPEN,
            JobStatus.CLOSED,
          ]),
        },
      });
      jobs.push(job);

      // Add Job Questions
      const questionCount = faker.number.int({ min: 2, max: 5 });
      for (let q = 0; q < questionCount; q++) {
        await prisma.jobQuestion.create({
          data: {
            jobId: job.id,
            question: faker.helpers.arrayElement([
              'Why do you want to work for our company?',
              'What are your salary expectations?',
              'Do you have experience with our tech stack?',
              'Tell us about a challenging project you worked on.',
              'What are your career goals?',
            ]),
            required: faker.datatype.boolean(),
            order: q,
          },
        });
      }
    }
  }

  // 12. Create Applications
  console.log('Creating job applications...');
  for (const user of users) {
    const selectedJobs = faker.helpers.arrayElements(jobs, { min: 2, max: 5 });

    for (const job of selectedJobs) {
      const userResumes = await prisma.resume.findMany({ where: { userId: user.id } });

      await prisma.application.create({
        data: {
          userId: user.id,
          jobId: job.id,
          resumeId:
            userResumes.length > 0
              ? faker.helpers.maybe(() => faker.helpers.arrayElement(userResumes).id, {
                  probability: 0.7,
                })
              : null,
          status: faker.helpers.arrayElement([
            ApplicationStatus.APPLIED,
            ApplicationStatus.APPLIED,
            ApplicationStatus.SHORTLISTED,
            ApplicationStatus.INTERVIEWING,
            ApplicationStatus.REJECTED,
            ApplicationStatus.HIRED,
          ]),
          coverLetter: faker.helpers.maybe(() => faker.lorem.paragraphs(2), { probability: 0.6 }),
          answers: {
            '1': faker.lorem.paragraph(),
            '2': faker.lorem.sentence(),
          },
        },
      });
    }
  }

  // 13. Create Marksheets for students
  console.log('Creating marksheets...');
  for (const user of users) {
    const year = user.currentYear || 2;
    // Create marksheets for previous semesters
    for (let sem = 1; sem < year * 2; sem++) {
      await prisma.markSheet.create({
        data: {
          userId: user.id,
          term: `Semester ${sem}`,
          academicYear: `202${3 + Math.floor(sem / 2)}-202${4 + Math.floor(sem / 2)}`,
          fileUrl: `https://fake-storage.com/marksheets/${user.id}/sem${sem}.pdf`,
          fileName: `Semester_${sem}_Marksheet.pdf`,
        },
      });
    }
  }

  // 14. Create Job Eligibility Criteria
  console.log('Creating job eligibility criteria...');
  for (const job of jobs.slice(0, Math.floor(jobs.length * 0.7))) {
    await prisma.jobEligibility.create({
      data: {
        jobId: job.id,
        minCgpa: faker.helpers.arrayElement([7.0, 7.5, 8.0]),
        maxActiveBacklogs: faker.helpers.arrayElement([0, 1]),
        maxTotalBacklogs: faker.helpers.arrayElement([1, 2, 3]),
        allowedBranches: faker.helpers.arrayElements(branches, { min: 2, max: 5 }),
        allowedYears: faker.helpers.arrayElement([[3, 4], [4], [2, 3, 4]]),
      },
    });
  }

  // 15. Create Attendance Records
  console.log('Creating attendance records...');
  const attendanceTypes: AttendanceType[] = ['OA', 'PPT', 'INTERVIEW'];
  for (const job of jobs.slice(0, 10)) {
    // Get applicants for this job
    const applicants = await prisma.application.findMany({
      where: { jobId: job.id },
      select: { userId: true },
      take: 15,
    });

    if (applicants.length === 0) continue;

    for (const type of attendanceTypes) {
      const maxAttended = Math.min(applicants.length, 15);
      const attendedCount = faker.number.int({ min: Math.min(5, maxAttended), max: maxAttended });

      for (let i = 0; i < attendedCount; i++) {
        await prisma.attendanceRecord.create({
          data: {
            jobId: job.id,
            userId: applicants[i].userId,
            eventType: type,
            attended: faker.helpers.weightedArrayElement([
              { value: true, weight: 8 },
              { value: false, weight: 2 },
            ]),
            remarks: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }),
          },
        });
      }
    }
  }

  // 16. Create some JPT and SPT users
  console.log('Creating JPT and SPT coordinators...');
  await prisma.user.create({
    data: {
      email: 'jpt@university.edu',
      name: 'JPT Coordinator',
      googleId: 'jpt-google-id',
      role: UserRole.JPT,
      phone: faker.phone.number(),
      location: faker.location.city(),
      bio: 'Joint Placement Team Coordinator',
      title: 'JPT Coordinator',
    },
  });

  await prisma.user.create({
    data: {
      email: 'spt@university.edu',
      name: 'SPT Coordinator',
      googleId: 'spt-google-id',
      role: UserRole.SPT,
      phone: faker.phone.number(),
      location: faker.location.city(),
      bio: 'Student Placement Team Coordinator',
      title: 'SPT Coordinator',
    },
  });

  console.log('Seeding completed successfully!');
  console.log(`
Summary:
- Admin: 1
- JPT: 1
- SPT: 1
- Students: ${users.length}
- Companies: ${companies.length}
- Placement Cycles: ${await prisma.placementCycle.count()}
- Jobs: ${jobs.length}
- Applications: ${await prisma.application.count()}
- Resumes: ${await prisma.resume.count()}
- Experiences: ${await prisma.experience.count()}
- Education: ${await prisma.education.count()}
- Skills: ${await prisma.skill.count()}
- Projects: ${await prisma.project.count()}
- Certifications: ${await prisma.certification.count()}
- Languages: ${await prisma.language.count()}
- Marksheets: ${await prisma.markSheet.count()}
- Job Eligibility: ${await prisma.jobEligibility.count()}
- Attendance Records: ${await prisma.attendanceRecord.count()}
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
