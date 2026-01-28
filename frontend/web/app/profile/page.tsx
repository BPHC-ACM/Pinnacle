'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';

import {
  User,
  GraduationCap,
  Briefcase,
  Code,
  Folder,
  Award,
  Globe,
  BookCopy as DocumentIcon,
} from 'lucide-react';

import {
  UserProfile,
  Experience,
  Education,
  Skill,
  Project,
  Certification,
  Language,
  TabType,
} from './components/Types';

import { PersonalInfoSection } from './components/PersonalInfoSection';
import { EducationSection } from './components/EducationSection';
import { ExperienceSection } from './components/ExperienceSection';
import { SkillsSection } from './components/SkillsSection';
import { ProjectsSection } from './components/ProjectsSection';
import { CertificationsSection } from './components/CertificationsSection';
import { LanguagesSection } from './components/LanguagesSection';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/');
    } else {
      fetchAllData();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [profileRes, expRes, eduRes, skillRes, projRes, certRes, langRes] = await Promise.all([
        api.get('/user-details/profile'),
        api.get('/user-details/experiences'),
        api.get('/user-details/education'),
        api.get('/user-details/skills'),
        api.get('/user-details/projects'),
        api.get('/user-details/certifications'),
        api.get('/user-details/languages'),
      ]);
      setProfile(profileRes.data);
      setExperiences(expRes.data.data || []);
      setEducation(eduRes.data.data || []);
      setSkills(skillRes.data.data || []);
      setProjects(projRes.data.data || []);
      setCertifications(certRes.data.data || []);
      setLanguages(langRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (form: Partial<UserProfile>) => {
    setSaving(true);
    try {
      const response = await api.patch('/user-details/profile', form);
      setProfile(response.data);
      toast.success('Profile updated successfully');
      refreshUser();
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Update failed: Check your input formats');
    } finally {
      setSaving(false);
    }
  };

  const handlePictureUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post('/upload/profile-picture', formData, {
        headers: { 'Content-Type': undefined },
      });
      toast.success('Profile picture uploaded');
      await fetchAllData();
    } catch (error) {
      console.error('Failed to upload picture:', error);
      toast.error('Failed to upload profile picture');
    }
  };

  const handleDeletePicture = async () => {
    try {
      await api.delete('/upload/profile-picture');
      toast.success('Profile picture deleted');
      await fetchAllData();
    } catch (error) {
      console.error('Failed to delete picture:', error);
      toast.error('Failed to delete profile picture');
    }
  };

  async function createOrUpdate<T>(endpoint: string, id: string | null, data: Partial<T>) {
    setSaving(true);
    const url = id ? `/user-details/${endpoint}/${id}` : `/user-details/${endpoint}`;
    const method = id ? 'patch' : 'post';
    try {
      await api[method](url, data);
      await fetchAllData();
      toast.success(`${endpoint.slice(0, -1)} ${id ? 'updated' : 'added'} successfully!`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        toast.error(error.message);
      } else {
        toast.error('Failed to save item');
      }
    } finally {
      setSaving(false);
    }
  }

  const handleDelete = async (endpoint: string, id: string) => {
    try {
      await api.delete(`/user-details/${endpoint}/${id}`);
      await fetchAllData();
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete item');
    }
  };

  if (!user) return null;

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'personal', label: 'Personal Info', icon: <User className="h-4 w-4" /> },
    { id: 'education', label: 'Education', icon: <GraduationCap className="h-4 w-4" /> },
    { id: 'experience', label: 'Experience', icon: <Briefcase className="h-4 w-4" /> },
    { id: 'skills', label: 'Skills', icon: <Code className="h-4 w-4" /> },
    { id: 'projects', label: 'Projects', icon: <Folder className="h-4 w-4" /> },
    { id: 'certifications', label: 'Certifications', icon: <Award className="h-4 w-4" /> },
    { id: 'languages', label: 'Languages', icon: <Globe className="h-4 w-4" /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <PersonalInfoSection
            profile={profile}
            onSave={handleUpdateProfile}
            isSaving={saving}
            onPictureUpload={handlePictureUpload}
            onDeletePicture={handleDeletePicture}
          />
        );
      case 'education':
        return (
          <EducationSection
            education={education}
            onSave={(id, data) => createOrUpdate('education', id, data)}
            onDelete={(id) => handleDelete('education', id)}
            isSaving={saving}
          />
        );
      case 'experience':
        return (
          <ExperienceSection
            experiences={experiences}
            onSave={(id, data) => createOrUpdate('experiences', id, data)}
            onDelete={(id) => handleDelete('experiences', id)}
            isSaving={saving}
          />
        );
      case 'skills':
        return (
          <SkillsSection
            skills={skills}
            onSave={(id, data) => createOrUpdate('skills', id, data)}
            onDelete={(id) => handleDelete('skills', id)}
            isSaving={saving}
          />
        );
      case 'projects':
        return (
          <ProjectsSection
            projects={projects}
            onSave={(id, data) => createOrUpdate('projects', id, data)}
            onDelete={(id) => handleDelete('projects', id)}
            isSaving={saving}
          />
        );
      case 'certifications':
        return (
          <CertificationsSection
            certifications={certifications}
            onSave={(id, data) => createOrUpdate('certifications', id, data)}
            onDelete={(id) => handleDelete('certifications', id)}
            isSaving={saving}
          />
        );
      case 'languages':
        return (
          <LanguagesSection
            languages={languages}
            onSave={(id, data) => createOrUpdate('languages', id, data)}
            onDelete={(id) => handleDelete('languages', id)}
            isSaving={saving}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none -z-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <div className="flex gap-3">
            <Button onClick={() => router.push('/resume')} variant="outline" size="sm">
              <DocumentIcon className="h-4 w-4 mr-2" />
              My Resumes
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-muted-foreground">Loading profile...</div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-64 shrink-0 flex">
              <nav
                className="space-y-1 p-2 rounded-xl border border-border bg-card w-full"
                style={{ backgroundColor: 'hsl(var(--card))' }}
              >
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-500/10 text-primary-500'
                        : 'text-muted-foreground hover:bg-primary/5'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex-1 flex">
              <div
                className="p-6 rounded-2xl border border-border bg-card w-full"
                style={{ backgroundColor: 'hsl(var(--card))' }}
              >
                {renderContent()}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full border-t border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} Pinnacle. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a
                href="/privacy"
                className="text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
