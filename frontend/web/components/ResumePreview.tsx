'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { ResumePreviewData, ResumeData } from '@/types/resume.types';

interface ResumePreviewProps {
  data: ResumePreviewData;
  resumeData?: ResumeData;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data, resumeData }) => {
  const { profile, experiences, education, skills, projects, certifications, languages } = data;
  const resumeRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(10);

  useEffect(() => {
    const adjustFontSize = () => {
      if (!resumeRef.current) return;

      const container = resumeRef.current;
      const maxHeight = 297 * 3.7795275591; // 297mm to pixels (at 96 DPI)
      let currentSize = 10;

      // Reset to default
      setFontSize(currentSize);

      // Check if content overflows
      setTimeout(() => {
        while (container.scrollHeight > maxHeight && currentSize > 6) {
          currentSize -= 0.2;
          setFontSize(currentSize);
          
          // Force re-render to recalculate height
          if (container.scrollHeight <= maxHeight) break;
        }
      }, 100);
    };

    adjustFontSize();
  }, [data, resumeData]);

  // Filter items based on selected IDs
  const filteredExperiences = resumeData?.selectedExperiences
    ? experiences.filter((exp) => resumeData.selectedExperiences?.includes(exp.id))
    : experiences;

  const filteredEducation = resumeData?.selectedEducation
    ? education.filter((edu) => resumeData.selectedEducation?.includes(edu.id))
    : education;

  const filteredSkills = resumeData?.selectedSkills
    ? skills.filter((skill) => resumeData.selectedSkills?.includes(skill.id))
    : skills;

  const filteredProjects = resumeData?.selectedProjects
    ? projects.filter((proj) => resumeData.selectedProjects?.includes(proj.id))
    : projects;

  const filteredCertifications = resumeData?.selectedCertifications
    ? certifications.filter((cert) => resumeData.selectedCertifications?.includes(cert.id))
    : certifications;

  const filteredLanguages = resumeData?.selectedLanguages
    ? languages.filter((lang) => resumeData.selectedLanguages?.includes(lang.id))
    : languages;

  const sections = resumeData?.sections || [];
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const formatDuration = (startDate: string, endDate: string | null, current: boolean) => {
    const start = formatDate(startDate);
    const end = current ? 'Present' : endDate ? formatDate(endDate) : '';
    return `${start} – ${end}`;
  };

  const renderSection = (section: { type: string; enabled: boolean }) => {
    if (!section.enabled) return null;

    switch (section.type) {
      case 'experience':
        if (filteredExperiences.length === 0) return null;
        return (
          <div key="experience" style={{ marginBottom: '12px' }}>
            <h3
              style={{
                fontSize: '11pt',
                fontWeight: 700,
                color: '#000',
                borderBottom: `1px solid #000`,
                paddingBottom: '2px',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              EXPERIENCE
            </h3>
            {filteredExperiences.map((exp) => (
              <div key={exp.id} style={{ marginBottom: '8px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '10.5pt', color: '#000' }}>
                    {exp.position}
                  </div>
                  <div
                    style={{
                      fontSize: '9pt',
                      fontWeight: 600,
                      color: '#1f2937',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatDuration(exp.startDate, exp.endDate, exp.current)}
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: '2px',
                  }}
                >
                  <div style={{ fontSize: '10pt', fontWeight: 500, fontStyle: 'italic', color: '#4b5563' }}>
                    {exp.company}
                  </div>
                  <div style={{ fontSize: '9.5pt', color: '#4b5563', fontStyle: 'italic' }}>
                    {exp.location}
                  </div>
                </div>
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul style={{ marginTop: '2px', paddingLeft: '15px', listStyleType: 'disc' }}>
                    {exp.highlights.map((highlight, idx) => (
                      <li
                        key={idx}
                        style={{ marginBottom: '1px', fontSize: '9.5pt', color: '#1f2937' }}
                      >
                        {highlight}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        );

      case 'education':
        if (filteredEducation.length === 0) return null;
        return (
          <div key="education" style={{ marginBottom: '12px' }}>
            <h3
              style={{
                fontSize: '11pt',
                fontWeight: 700,
                color: '#000',
                borderBottom: `1px solid #000`,
                paddingBottom: '2px',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              EDUCATION
            </h3>
            {filteredEducation.map((edu) => (
              <div key={edu.id} style={{ marginBottom: '8px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '10.5pt', color: '#000' }}>
                    {edu.institution}
                  </div>
                  <div style={{ fontSize: '9pt', fontWeight: 600, color: '#1f2937' }}>
                    {formatDuration(edu.startDate, edu.endDate, false)}
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: '2px',
                  }}
                >
                  <div style={{ fontSize: '10pt', fontWeight: 500, fontStyle: 'italic', color: '#4b5563' }}>
                    {edu.degree} in {edu.branch}
                  </div>
                  <div style={{ fontSize: '9.5pt', color: '#4b5563', fontStyle: 'italic' }}>
                    {edu.gpa ? `GPA: ${edu.gpa}` : edu.location}
                  </div>
                </div>
                {edu.achievements && edu.achievements.length > 0 && (
                  <ul style={{ marginTop: '2px', paddingLeft: '15px', listStyleType: 'disc' }}>
                    {edu.achievements.map((achievement, idx) => (
                      <li
                        key={idx}
                        style={{ marginBottom: '1px', fontSize: '9.5pt', color: '#1f2937' }}
                      >
                        {achievement}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        );

      case 'projects':
        if (filteredProjects.length === 0) return null;
        return (
          <div key="projects" style={{ marginBottom: '12px' }}>
            <h3
              style={{
                fontSize: '11pt',
                fontWeight: 700,
                color: '#000',
                borderBottom: `1px solid #000`,
                paddingBottom: '2px',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              PROJECTS
            </h3>
            {filteredProjects.map((project) => (
              <div key={project.id} style={{ marginBottom: '8px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '10.5pt', color: '#000' }}>
                    {project.title}
                    {project.referenceUrl && (
                      <a
                        href={project.referenceUrl}
                        style={{
                          fontWeight: 'normal',
                          fontSize: '0.8em',
                          marginLeft: '5px',
                          color: '#4b5563',
                          textDecoration: 'none',
                        }}
                      >
                        [Link]
                      </a>
                    )}
                  </div>
                  {project.startDate && (
                    <div style={{ fontSize: '9pt', fontWeight: 600, color: '#1f2937' }}>
                      {formatDuration(project.startDate, project.endDate, false)}
                    </div>
                  )}
                </div>
                {project.tools && project.tools.length > 0 && (
                  <div style={{ marginBottom: '2px' }}>
                    <span
                      style={{
                        fontSize: '9.5pt',
                        fontWeight: 500,
                        fontStyle: 'italic',
                        color: '#4b5563',
                      }}
                    >
                      Stack: {project.tools.join(', ')}
                    </span>
                  </div>
                )}
                {project.outcomes && project.outcomes.length > 0 && (
                  <ul style={{ marginTop: '2px', paddingLeft: '15px', listStyleType: 'disc' }}>
                    {project.outcomes.map((outcome, idx) => (
                      <li
                        key={idx}
                        style={{ marginBottom: '1px', fontSize: '9.5pt', color: '#1f2937' }}
                      >
                        {outcome}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        );

      case 'skills':
        if (filteredSkills.length === 0) return null;
        return (
          <div key="skills" style={{ marginBottom: '12px' }}>
            <h3
              style={{
                fontSize: '11pt',
                fontWeight: 700,
                color: '#000',
                borderBottom: `1px solid #000`,
                paddingBottom: '2px',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              SKILLS
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                columnGap: '12px',
                rowGap: '4px',
              }}
            >
              {filteredSkills.map((skill) => (
                <React.Fragment key={skill.id}>
                  <div style={{ fontWeight: 700, fontSize: '9.5pt', color: '#1f2937' }}>
                    {skill.category}:
                  </div>
                  <div style={{ fontSize: '9.5pt', color: '#1f2937' }}>
                    {skill.items.join(', ')}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        );

      case 'certifications':
        if (filteredCertifications.length === 0) return null;
        return (
          <div key="certifications" style={{ marginBottom: '12px' }}>
            <h3
              style={{
                fontSize: '11pt',
                fontWeight: 700,
                color: '#000',
                borderBottom: `1px solid #000`,
                paddingBottom: '2px',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              CERTIFICATIONS
            </h3>
            {filteredCertifications.map((cert) => (
              <div
                key={cert.id}
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}
              >
                <div style={{ fontSize: '9.5pt' }}>
                  <span style={{ fontWeight: 600 }}>{cert.title}</span>
                  <span style={{ fontWeight: 400, color: '#4b5563' }}> — {cert.organization}</span>
                </div>
                <div style={{ fontSize: '9pt', fontWeight: 'normal', color: '#1f2937' }}>
                  {formatDate(cert.issueDate)}
                </div>
              </div>
            ))}
          </div>
        );

      case 'languages':
        if (filteredLanguages.length === 0) return null;
        return (
          <div key="languages" style={{ marginBottom: '12px' }}>
            <h3
              style={{
                fontSize: '11pt',
                fontWeight: 700,
                color: '#000',
                borderBottom: `1px solid #000`,
                paddingBottom: '2px',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              LANGUAGES
            </h3>
            <div style={{ fontSize: '9.5pt', color: '#1f2937' }}>
              {filteredLanguages.map((lang) => `${lang.name} (${lang.proficiency})`).join(', ')}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Build contact items array
  const contactItems = [
    profile.email,
    profile.phone,
    profile.location,
    profile.linkedin?.replace('https://', '').replace('http://', ''),
    profile.github?.replace('https://', '').replace('http://', ''),
    profile.website?.replace('https://', '').replace('http://', ''),
  ].filter(Boolean);

  return (
    <div
      ref={resumeRef}
      style={{
        backgroundColor: 'white',
        width: '210mm',
        height: '297mm',
        maxHeight: '297mm',
        margin: '20px auto',
        padding: '12mm 15mm',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        fontFamily: '"Times New Roman", Times, serif',
        fontSize: `${fontSize}pt`,
        lineHeight: 1.4,
        color: '#000',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
      className="professional-resume"
    >
      {/* Header */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '12px',
        }}
      >
        <h1
          style={{
            fontSize: '20pt',
            fontWeight: 700,
            color: '#000',
            lineHeight: 1.2,
            marginBottom: '4px',
          }}
        >
          {profile.name}
        </h1>
        <div
          style={{
            fontSize: '9pt',
            color: '#000',
            lineHeight: 1.3,
          }}
        >
          {contactItems.map((item, idx) => (
            <React.Fragment key={idx}>
              <span>{item}</span>
              {idx < contactItems.length - 1 && (
                <span style={{ margin: '0 4px' }}>|</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Sections */}
      {sortedSections.length > 0
        ? sortedSections.map(renderSection)
        : [
            { type: 'experience', enabled: true },
            { type: 'education', enabled: true },
            { type: 'projects', enabled: true },
            { type: 'skills', enabled: true },
            { type: 'certifications', enabled: true },
            { type: 'languages', enabled: true },
          ].map(renderSection)}

      {/* Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: '10mm',
          right: '15mm',
          fontSize: '7pt',
          color: '#9ca3af',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}
      >
        Generated by Pinnacle
      </div>

      <style jsx global>{`
        .professional-resume {
          page-break-after: avoid;
          page-break-inside: avoid;
        }

        @media print {
          .professional-resume {
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm 12mm !important;
            box-shadow: none !important;
            min-height: auto !important;
            max-height: 277mm !important;
            height: 277mm !important;
            overflow: hidden !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }

          @page {
            size: A4;
            margin: 0;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};
