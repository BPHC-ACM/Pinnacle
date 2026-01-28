import PDFDocument from 'pdfkit';

import { logger } from '../../config/logger.config';
import {
  type UserProfile,
  type Experience,
  type Education,
  type Project,
  type Skill,
} from '../../types/user-details.types';

interface ResumeData {
  profile: UserProfile;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
}

export const generateResumePDF = (resumeData: ResumeData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    logger.debug({ userId: resumeData.profile.id }, 'Starting PDF generation');

    const doc = new PDFDocument({ margin: 50 });
    const { profile, experiences, education, skills, projects } = resumeData;

    const chunks: Buffer[] = [];

    // Collect PDF data
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => {
      const duration = Date.now() - startTime;
      const buffer = Buffer.concat(chunks);
      logger.info(
        { userId: profile.id, duration, sizeBytes: buffer.length },
        'PDF generated successfully',
      );
      resolve(buffer);
    });
    doc.on('error', (err) => {
      logger.error({ err, userId: profile.id }, 'PDF generation failed');
      reject(err instanceof Error ? err : new Error(String(err)));
    });

    // Header - Personal Info
    doc.fontSize(24).font('Helvetica-Bold').text(profile.name, { align: 'center' });

    doc.fontSize(10).font('Helvetica');
    doc.text(profile.email, { align: 'center' });

    if (profile.phone) {
      doc.text(profile.phone, { align: 'center' });
    }

    if (profile.location) {
      doc.text(profile.location, { align: 'center' });
    }

    doc.moveDown(1.5);

    const formatDate = (d: Date): string => d.toLocaleDateString();

    // Summary
    if (profile.summary) {
      doc.fontSize(14).font('Helvetica-Bold').text('SUMMARY');
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').text(profile.summary);
      doc.moveDown(1);
    }

    // Education
    if (education.length > 0) {
      doc.fontSize(14).font('Helvetica-Bold').text('EDUCATION');
      doc.moveDown(0.5);

      education.forEach((edu) => {
        doc.fontSize(12).font('Helvetica-Bold').text(edu.institution);
        doc.fontSize(10).font('Helvetica').text(`${edu.degree} in ${edu.branch}`);
        doc.text(
          `${formatDate(edu.startDate)} - ${edu.endDate ? formatDate(edu.endDate) : 'Present'}`,
        );

        if (edu.gpa) {
          doc.text(`GPA: ${edu.gpa}`);
        }
        if (edu.achievements && edu.achievements.length > 0) {
          edu.achievements.forEach((achievement) => {
            doc.text(`• ${achievement}`, { indent: 10 });
          });
        }
        doc.moveDown(0.5);
      });
      doc.moveDown(0.5);
    }

    // Experience
    if (experiences.length > 0) {
      doc.fontSize(14).font('Helvetica-Bold').text('EXPERIENCE');
      doc.moveDown(0.5);

      experiences.forEach((exp) => {
        doc.fontSize(12).font('Helvetica-Bold').text(exp.position);
        doc.fontSize(10).font('Helvetica-Oblique').text(exp.company);
        doc
          .font('Helvetica')
          .text(
            `${formatDate(exp.startDate)} - ${exp.endDate ? formatDate(exp.endDate) : 'Present'}`,
          );
        doc.moveDown(0.3);

        if (exp.description) {
          doc.text(`• ${exp.description}`, { indent: 10 });
        }
        doc.moveDown(0.5);
      });
      doc.moveDown(0.5);
    }

    // Skills
    if (skills.length > 0) {
      doc.fontSize(14).font('Helvetica-Bold').text('SKILLS');
      doc.moveDown(0.5);
      skills.forEach((skill) => {
        doc.fontSize(12).font('Helvetica-Bold').text(skill.category);
        doc.fontSize(10).font('Helvetica').text(skill.items.join(' • '));
        doc.moveDown(0.3);
      });
      doc.moveDown(0.5);
    }

    // Projects
    if (projects && projects.length > 0) {
      doc.fontSize(14).font('Helvetica-Bold').text('PROJECTS');
      doc.moveDown(0.5);

      projects.forEach((project) => {
        doc.fontSize(12).font('Helvetica-Bold').text(project.title);

        doc.fontSize(10).font('Helvetica-Oblique').text(project.domain);

        if (project.tools && project.tools.length > 0) {
          doc
            .fontSize(10)
            .font('Helvetica')
            .text(`Tools: ${project.tools.join(', ')}`);
        }

        if (project.referenceUrl) {
          doc.fillColor('blue').text(project.referenceUrl, { link: project.referenceUrl });
          doc.fillColor('black');
        }

        if (project.description) {
          doc.font('Helvetica').text(project.description);
        }
        doc.moveDown(0.5);
      });
    }

    // Finalize the PDF
    doc.end();
  });
};
