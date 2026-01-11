'use client';

import React from 'react';
import type { ResumePreviewData, ResumeData } from '@/types/resume.types';

interface ResumePreviewProps {
  data: ResumePreviewData;
  resumeData?: ResumeData;
  template?: string;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data, resumeData }) => {
  const { profile, experiences, education, skills, projects, certifications, languages } = data;

  // Filter items based on selected IDs in resumeData
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

  // Get enabled sections in order
  const sections = resumeData?.sections || [];
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const renderSection = (section: { type: string; enabled: boolean }) => {
    if (!section.enabled) return null;

    switch (section.type) {
      case 'profile':
        return (
          <div key="profile" className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {profile.name}
            </h1>
            {profile.title && (
              <h2 className="text-xl text-gray-700 dark:text-gray-300 mb-3">{profile.title}</h2>
            )}
            <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
              <span>{profile.email}</span>
              {profile.phone && <span>• {profile.phone}</span>}
              {profile.location && <span>• {profile.location}</span>}
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-blue-600 dark:text-blue-400">
              {profile.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
              )}
              {profile.github && (
                <a href={profile.github} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              )}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer">
                  Website
                </a>
              )}
            </div>
            {profile.summary && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Summary
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{profile.summary}</p>
              </div>
            )}
          </div>
        );

      case 'experience':
        if (filteredExperiences.length === 0) return null;
        return (
          <div key="experience" className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-4">
              EXPERIENCE
            </h3>
            {filteredExperiences.map((exp) => (
              <div key={exp.id} className="mb-4">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {exp.position}
                  </h4>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(exp.startDate)} -{' '}
                    {exp.current ? 'Present' : exp.endDate ? formatDate(exp.endDate) : ''}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic mb-2">
                  {exp.company} • {exp.location}
                </p>
                {exp.description && (
                  <p className="text-gray-700 dark:text-gray-300 mb-2">{exp.description}</p>
                )}
                {exp.highlights.length > 0 && (
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                    {exp.highlights.map((highlight, idx) => (
                      <li key={idx}>{highlight}</li>
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
          <div key="education" className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-4">
              EDUCATION
            </h3>
            {filteredEducation.map((edu) => (
              <div key={edu.id} className="mb-4">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {edu.institution}
                  </h4>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(edu.startDate)} -{' '}
                    {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {edu.degree} in {edu.branch}
                </p>
                {edu.gpa && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm">GPA: {edu.gpa}</p>
                )}
                {edu.achievements.length > 0 && (
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 mt-2">
                    {edu.achievements.map((achievement, idx) => (
                      <li key={idx}>{achievement}</li>
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
          <div key="skills" className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-4">
              SKILLS
            </h3>
            {filteredSkills.map((skill) => (
              <div key={skill.id} className="mb-3">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  {skill.category}
                </h4>
                <p className="text-gray-700 dark:text-gray-300">{skill.items.join(' • ')}</p>
              </div>
            ))}
          </div>
        );

      case 'projects':
        if (filteredProjects.length === 0) return null;
        return (
          <div key="projects" className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-4">
              PROJECTS
            </h3>
            {filteredProjects.map((project) => (
              <div key={project.id} className="mb-4">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {project.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 italic text-sm mb-1">
                  {project.domain}
                </p>
                {project.tools.length > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span className="font-semibold">Tools:</span> {project.tools.join(', ')}
                  </p>
                )}
                {project.description && (
                  <p className="text-gray-700 dark:text-gray-300 mb-2">{project.description}</p>
                )}
                {project.outcomes.length > 0 && (
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                    {project.outcomes.map((outcome, idx) => (
                      <li key={idx}>{outcome}</li>
                    ))}
                  </ul>
                )}
                {project.referenceUrl && (
                  <a
                    href={project.referenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                  >
                    View Project →
                  </a>
                )}
              </div>
            ))}
          </div>
        );

      case 'certifications':
        if (filteredCertifications.length === 0) return null;
        return (
          <div key="certifications" className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-4">
              CERTIFICATIONS
            </h3>
            {filteredCertifications.map((cert) => (
              <div key={cert.id} className="mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">{cert.title}</h4>
                    <p className="text-gray-700 dark:text-gray-300">{cert.organization}</p>
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                      >
                        View Credential
                      </a>
                    )}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(cert.issueDate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'languages':
        if (filteredLanguages.length === 0) return null;
        return (
          <div key="languages" className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-4">
              LANGUAGES
            </h3>
            <div className="flex flex-wrap gap-4">
              {filteredLanguages.map((lang) => (
                <div key={lang.id} className="text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">{lang.name}</span>
                  <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">
                    ({lang.proficiency})
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 max-w-4xl mx-auto">
      <div className="resume-content">
        {sortedSections.length > 0 ? (
          sortedSections.map(renderSection)
        ) : (
          <>
            {renderSection({ type: 'profile', enabled: true })}
            {renderSection({ type: 'experience', enabled: true })}
            {renderSection({ type: 'education', enabled: true })}
            {renderSection({ type: 'skills', enabled: true })}
            {renderSection({ type: 'projects', enabled: true })}
            {renderSection({ type: 'certifications', enabled: true })}
            {renderSection({ type: 'languages', enabled: true })}
          </>
        )}
      </div>
    </div>
  );
};
