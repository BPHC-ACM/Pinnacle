/*eslint-disable*/
import 'dotenv/config';
import { faker } from '@faker-js/faker';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import {
  PrismaClient,
  UserRole,
  ApplicationStatus,
  JobStatus,
  ProficiencyLevel,
  Sector,
  AccomplishmentType,
  Resume,
  NotificationType,
  NotificationChannel,
} from '@pinnacle/types';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  console.log('Starting database seeding...');

  // Clear existing data (optional - be careful in production!)
  console.log('Cleaning existing data...');
  await prisma.announcement.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.application.deleteMany();
  await prisma.jobQuestion.deleteMany();
  await prisma.job.deleteMany();
  await prisma.company.deleteMany();
  await prisma.resumeFile.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.course.deleteMany();
  await prisma.positionOfResponsibility.deleteMany();
  await prisma.extracurricular.deleteMany();
  await prisma.accomplishment.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.language.deleteMany();
  await prisma.project.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.education.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Admin User
  console.log('Creating admin user...');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@gmail.com',
      name: 'Admin User',
      googleId: 'admin-google-id-123',
      role: UserRole.ADMIN,
      phone: faker.phone.number(),
      location: faker.location.city() + ', ' + faker.location.country(),
      bio: 'System administrator for Placement Portal',
      title: 'System Administrator',
      summary: 'Managing the placement portal and ensuring smooth operations.',
    },
  });

  // Create Announcements
  console.log('Creating announcements...');
  await Promise.all(
    Array.from({ length: 5 }).map(() =>
      prisma.announcement.create({
        data: {
          title: faker.lorem.sentence(),
          content: faker.lorem.paragraphs(2),
          senderId: adminUser.id,
          createdAt: faker.date.past(),
        },
      }),
    ),
  );

  // 2. Create Regular Users (Students)
  console.log('Creating regular users...');
  const users = await Promise.all(
    Array.from({ length: 10 }).map(async () => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email({ firstName, lastName }).toLowerCase();

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
        },
      });
    }),
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
          sector: faker.helpers.arrayElement(Object.values(Sector)),
          salaryRange: faker.helpers.arrayElement([
            '50000-75000',
            '10000-15000/month',
            '10-12 LPA',
          ]),
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
          rollNumber: faker.string.alphanumeric(10).toUpperCase(),
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
          { min: 3, max: 5 },
        ),
      },
      {
        category: 'Frameworks & Libraries',
        items: faker.helpers.arrayElements(
          ['React', 'Node.js', 'Express', 'Next.js', 'Django', 'Spring Boot', 'FastAPI'],
          { min: 2, max: 4 },
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
          { min: 2, max: 4 },
        ),
      },
    ];

    for (const category of skillCategories) {
      await prisma.skill.create({
        data: {
          userId: user.id,
          category: category.category,
          items: category.items,
          proficiency: faker.helpers.arrayElement(Object.values(ProficiencyLevel)),
          order: skillCategories.indexOf(category),
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
          name: faker.commerce.productName() + ' Platform',
          technologies: faker.helpers.arrayElements(
            ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'AWS'],
            { min: 3, max: 5 },
          ),
          url: faker.helpers.maybe(() => faker.internet.url(), { probability: 0.5 }),
          repoUrl: `https://github.com/${user.name.toLowerCase().replace(' ', '-')}/${faker.lorem.word()}`,
          highlights: faker.helpers.multiple(() => faker.lorem.sentence(), {
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
      { name: 'English', proficiency: ProficiencyLevel.NATIVE },
      {
        name: 'Hindi',
        proficiency: faker.helpers.arrayElement([
          ProficiencyLevel.NATIVE,
          ProficiencyLevel.ADVANCED,
          ProficiencyLevel.INTERMEDIATE,
        ]),
      },
    ];

    for (const language of languages) {
      await prisma.language.create({
        data: {
          userId: user.id,
          name: language.name,
          proficiency: language.proficiency,
          order: languages.indexOf(language),
        },
      });
    }
  }

  // 9. Add Accomplishments
  console.log('Creating accomplishments...');
  for (const user of users) {
    const count = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < count; i++) {
      await prisma.accomplishment.create({
        data: {
          userId: user.id,
          type: faker.helpers.arrayElement(Object.values(AccomplishmentType)),
          title: faker.lorem.sentence(),
          issuer: faker.company.name(),
          date: faker.date.past({ years: 2 }),
          description: faker.lorem.paragraph(),
          url: faker.internet.url(),
          order: i,
        },
      });
    }
  }

  // 10. Add Positions of Responsibility
  console.log('Creating positions of responsibility...');
  for (const user of users) {
    const count = faker.number.int({ min: 1, max: 2 });
    for (let i = 0; i < count; i++) {
      await prisma.positionOfResponsibility.create({
        data: {
          userId: user.id,
          title: faker.person.jobTitle(),
          organization: faker.company.name(),
          location: faker.location.city(),
          startDate: faker.date.past({ years: 2 }),
          endDate: faker.date.recent(),
          current: false,
          description: faker.lorem.paragraph(),
          highlights: faker.helpers.multiple(() => faker.lorem.sentence(), {
            count: { min: 2, max: 4 },
          }),
          order: i,
        },
      });
    }
  }

  // 11. Add Courses
  console.log('Creating courses...');
  for (const user of users) {
    const count = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < count; i++) {
      await prisma.course.create({
        data: {
          userId: user.id,
          name: faker.lorem.words(3),
          institution: faker.company.name(),
          completionDate: faker.date.past({ years: 1 }),
          grade: 'A',
          description: faker.lorem.sentence(),
          url: faker.internet.url(),
          order: i,
        },
      });
    }
  }

  // 12. Add Extracurriculars
  console.log('Creating extracurriculars...');
  for (const user of users) {
    const count = faker.number.int({ min: 1, max: 2 });
    for (let i = 0; i < count; i++) {
      await prisma.extracurricular.create({
        data: {
          userId: user.id,
          activity: faker.hacker.verb() + ' Club',
          role: 'Member',
          organization: faker.company.name(),
          startDate: faker.date.past({ years: 2 }),
          endDate: faker.date.recent(),
          current: false,
          description: faker.lorem.sentence(),
          order: i,
        },
      });
    }
  }

  // 13. Create Resumes for users
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

  // 14. Create Companies
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
    }),
  );

  // 15. Create Jobs
  console.log('Creating job postings...');
  const jobs = [];
  for (const company of companies) {
    const jobCount = faker.number.int({ min: 2, max: 4 });
    for (let i = 0; i < jobCount; i++) {
      const job = await prisma.job.create({
        data: {
          companyId: company.id,
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

  // 16. Create Applications
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
            userResumes.length > 0 ? (faker.helpers.arrayElement(userResumes) as Resume).id : null,
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

  // 17. Create Notifications
  console.log('Creating notifications...');
  for (const user of users) {
    const notificationCount = faker.number.int({ min: 3, max: 8 });
    for (let i = 0; i < notificationCount; i++) {
      const isRead = faker.datatype.boolean();
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: faker.helpers.arrayElement(Object.values(NotificationType)),
          channel: NotificationChannel.IN_APP,
          title: faker.lorem.sentence(),
          message: faker.lorem.paragraph(),
          isRead: isRead,
          readAt: isRead ? faker.date.recent() : null,
          createdAt: faker.date.recent({ days: 30 }),
        },
      });
    }
  }

  console.log('Seeding completed successfully!');
  console.log(`
Summary:
- Admin: 1
- Users: ${users.length}
- Companies: ${companies.length}
- Jobs: ${jobs.length}
- Applications: ${await prisma.application.count()}
- Resumes: ${await prisma.resume.count()}
- Experiences: ${await prisma.experience.count()}
- Education: ${await prisma.education.count()}
- Skills: ${await prisma.skill.count()}
- Projects: ${await prisma.project.count()}
- Certifications: ${await prisma.certification.count()}
- Languages: ${await prisma.language.count()}
- Accomplishments: ${await prisma.accomplishment.count()}
- Positions of Responsibility: ${await prisma.positionOfResponsibility.count()}
- Courses: ${await prisma.course.count()}
- Extracurriculars: ${await prisma.extracurricular.count()}
- Notifications: ${await prisma.notification.count()}
- Announcements: ${await prisma.announcement.count()}
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
