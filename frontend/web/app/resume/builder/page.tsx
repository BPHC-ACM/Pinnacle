'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import {
  getResumePreviewData,
  getSavedResume,
  createSavedResume,
  updateSavedResume,
  generateAndDownloadResume,
} from '@/services/resume.service';
import type { ResumePreviewData, ResumeData } from '@/types/resume.types';
import { ResumePreview } from '@/components/ResumePreview';
import { toast } from 'sonner';

function ResumeBuilderContent() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [previewData, setPreviewData] = useState<ResumePreviewData | null>(null);
  const [resumeTitle, setResumeTitle] = useState('My Resume');
  const [resumeData, setResumeData] = useState<ResumeData>({
    sections: [
      { id: 'profile', type: 'profile', enabled: true, order: 0 },
      { id: 'experience', type: 'experience', enabled: true, order: 1 },
      { id: 'education', type: 'education', enabled: true, order: 2 },
      { id: 'skills', type: 'skills', enabled: true, order: 3 },
      { id: 'projects', type: 'projects', enabled: true, order: 4 },
      { id: 'certifications', type: 'certifications', enabled: true, order: 5 },
      { id: 'languages', type: 'languages', enabled: true, order: 6 },
    ],
    selectedExperiences: [],
    selectedEducation: [],
    selectedSkills: [],
    selectedProjects: [],
    selectedCertifications: [],
    selectedLanguages: [],
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load preview data (all user profile data)
        const data = await getResumePreviewData();
        setPreviewData(data);

        // Initialize selected items with all available items
        setResumeData((prev) => ({
          ...prev,
          selectedExperiences: data.experiences.map((exp) => exp.id),
          selectedEducation: data.education.map((edu) => edu.id),
          selectedSkills: data.skills.map((skill) => skill.id),
          selectedProjects: data.projects.map((proj) => proj.id),
          selectedCertifications: data.certifications.map((cert) => cert.id),
          selectedLanguages: data.languages.map((lang) => lang.id),
        }));

        // If editing an existing resume, load it
        if (resumeId) {
          const savedResume = await getSavedResume(resumeId);
          setResumeTitle(savedResume.title);
          setResumeData(savedResume.data);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load resume data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user, resumeId]);

  const handleGeneratePDF = async () => {
    try {
      setGenerating(true);

      // Save first
      if (resumeId) {
        await updateSavedResume(resumeId, {
          title: resumeTitle,
          data: resumeData,
        });
      } else {
        const saved = await createSavedResume({
          title: resumeTitle,
          data: resumeData,
        });
        // Update URL with new resume ID without page reload
        window.history.replaceState(null, '', `/resume/builder?id=${saved.id}`);
      }

      // Then generate PDF
      await generateAndDownloadResume();
      toast.success('Resume saved and PDF generated successfully!');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setResumeData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId ? { ...section, enabled: !section.enabled } : section,
      ),
    }));
  };

  const moveSectionUp = (index: number) => {
    if (index === 0) return;

    setResumeData((prev) => {
      const newSections = [...prev.sections];
      [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
      return {
        ...prev,
        sections: newSections.map((section, idx) => ({ ...section, order: idx })),
      };
    });
  };

  const moveSectionDown = (index: number) => {
    if (index === resumeData.sections.length - 1) return;

    setResumeData((prev) => {
      const newSections = [...prev.sections];
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
      return {
        ...prev,
        sections: newSections.map((section, idx) => ({ ...section, order: idx })),
      };
    });
  };

  const toggleItem = (section: string, itemId: string) => {
    const key = `selected${section.charAt(0).toUpperCase()}${section.slice(1)}` as keyof ResumeData;

    setResumeData((prev) => {
      const current = (prev[key] as string[]) || [];
      const isSelected = current.includes(itemId);

      return {
        ...prev,
        [key]: isSelected ? current.filter((id) => id !== itemId) : [...current, itemId],
      };
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!previewData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Complete Your Profile
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please complete your profile before building a resume.
          </p>
          <Button onClick={() => router.push('/profile')}>Go to Profile</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <input
                type="text"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
                className="text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
                placeholder="Resume Title"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push('/resume')}>
                Cancel
              </Button>
              <Button onClick={handleGeneratePDF} disabled={generating}>
                {generating ? 'Generating...' : 'Generate and Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Customization */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Customize Resume
              </h3>

              {/* Sections */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Sections
                </h4>
                <div className="space-y-2">
                  {resumeData.sections.map((section, index) => (
                    <div
                      key={section.id}
                      className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={section.enabled}
                        onChange={() => toggleSection(section.id)}
                        className="rounded"
                      />
                      <span className="flex-1 text-sm capitalize text-gray-700 dark:text-gray-300">
                        {section.type}
                      </span>
                      <button
                        onClick={() => moveSectionUp(index)}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveSectionDown(index)}
                        disabled={index === resumeData.sections.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        ↓
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Item Selection */}
              <div className="space-y-4">
                {/* Experiences */}
                {previewData.experiences.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Experiences
                    </h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {previewData.experiences.map((exp) => (
                        <label key={exp.id} className="flex items-start gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={resumeData.selectedExperiences?.includes(exp.id)}
                            onChange={() => toggleItem('experiences', exp.id)}
                            className="mt-1"
                          />
                          <span className="text-gray-600 dark:text-gray-400">
                            {exp.position} at {exp.company}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {previewData.education.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Education
                    </h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {previewData.education.map((edu) => (
                        <label key={edu.id} className="flex items-start gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={resumeData.selectedEducation?.includes(edu.id)}
                            onChange={() => toggleItem('education', edu.id)}
                            className="mt-1"
                          />
                          <span className="text-gray-600 dark:text-gray-400">
                            {edu.degree} - {edu.institution}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {previewData.skills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Skills
                    </h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {previewData.skills.map((skill) => (
                        <label key={skill.id} className="flex items-start gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={resumeData.selectedSkills?.includes(skill.id)}
                            onChange={() => toggleItem('skills', skill.id)}
                            className="mt-1"
                          />
                          <span className="text-gray-600 dark:text-gray-400">{skill.category}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {previewData.projects.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Projects
                    </h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {previewData.projects.map((proj) => (
                        <label key={proj.id} className="flex items-start gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={resumeData.selectedProjects?.includes(proj.id)}
                            onChange={() => toggleItem('projects', proj.id)}
                            className="mt-1"
                          />
                          <span className="text-gray-600 dark:text-gray-400">{proj.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Resume Preview
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This is how your resume will look
              </p>
            </div>
            <ResumePreview data={previewData} resumeData={resumeData} />
          </div>
        </div>
      </div>
    </div>
  );
}
export default function ResumeBuilder() {
  return (
    <Suspense
      fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}
    >
      <ResumeBuilderContent />
    </Suspense>
  );
}
