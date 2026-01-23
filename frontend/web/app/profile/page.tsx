'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { toast } from 'sonner';

// Icon components
const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const BriefcaseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const GraduationCapIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const CodeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const FolderIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const AwardIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

const GlobeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PencilIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const DocumentIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

// Types
interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  bio?: string;
  title?: string;
  summary?: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  sector?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  highlights: string[];
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  branch: string;
  rollNumber?: string;
  location: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
  achievements: string[];
}

interface Skill {
  id: string;
  category: string;
  items: string[];
  proficiency?: string;
}

interface Project {
  id: string;
  name: string;
  technologies: string[];
  url?: string;
  repoUrl?: string;
  highlights: string[];
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

interface Language {
  id: string;
  name: string;
  proficiency: string;
}

type TabType =
  | 'personal'
  | 'education'
  | 'experience'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'languages';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile data
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);

  // Edit states
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<Partial<UserProfile>>({});
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);

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
      setProfileForm(profileRes.data);
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

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const response = await api.patch('/user-details/profile', profileForm);
      setProfile(response.data);
      setEditingProfile(false);
      setPicturePreview(null);
      toast.success('Profile updated successfully');
      refreshUser();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPicturePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setUploadingPicture(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload/profile-picture', formData, {
        headers: {
          'Content-Type': undefined, // Let browser set it with boundary
        },
      });

      setProfileForm({ ...profileForm, picture: response.data.url });
      toast.success('Profile picture uploaded successfully');
      await fetchAllData();
    } catch (error) {
      console.error('Failed to upload picture:', error);
      toast.error('Failed to upload profile picture');
      setPicturePreview(null);
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleDeletePicture = async () => {
    if (!confirm('Are you sure you want to delete your profile picture?')) return;

    try {
      await api.delete('/upload/profile-picture');
      setProfileForm({ ...profileForm, picture: undefined });
      setPicturePreview(null);
      toast.success('Profile picture deleted successfully');
      await fetchAllData();
    } catch (error) {
      console.error('Failed to delete picture:', error);
      toast.error('Failed to delete profile picture');
    }
  };

  // Generic delete handler
  const handleDelete = async (endpoint: string, id: string, refreshFn: () => void) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await api.delete(`/user-details/${endpoint}/${id}`);
      refreshFn();
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete item');
    }
  };

  if (!user) {
    return null;
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'personal', label: 'Personal Info', icon: <UserIcon className="h-4 w-4" /> },
    { id: 'education', label: 'Education', icon: <GraduationCapIcon className="h-4 w-4" /> },
    { id: 'experience', label: 'Experience', icon: <BriefcaseIcon className="h-4 w-4" /> },
    { id: 'skills', label: 'Skills', icon: <CodeIcon className="h-4 w-4" /> },
    { id: 'projects', label: 'Projects', icon: <FolderIcon className="h-4 w-4" /> },
    { id: 'certifications', label: 'Certifications', icon: <AwardIcon className="h-4 w-4" /> },
    { id: 'languages', label: 'Languages', icon: <GlobeIcon className="h-4 w-4" /> },
  ];

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Personal Information</h2>
        {!editingProfile ? (
          <Button onClick={() => setEditingProfile(true)} variant="outline" size="sm">
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleUpdateProfile}
              disabled={saving}
              size="sm"
              className="bg-primary-500 hover:bg-primary-600"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={() => {
                setEditingProfile(false);
                setProfileForm(profile || {});
              }}
              variant="outline"
              size="sm"
            >
              <XIcon className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {editingProfile ? (
        <div className="space-y-6">
          {/* Profile Picture Upload */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-border flex items-center justify-center">
                {picturePreview || profileForm.picture ? (
                  <Image
                    src={picturePreview || profileForm.picture || ''}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              {uploadingPicture && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePictureUpload}
                  disabled={uploadingPicture}
                  className="hidden"
                />
                <span className="inline-flex items-center px-4 py-2 rounded-lg border border-border bg-background text-foreground hover:bg-accent transition-colors text-sm font-medium">
                  {uploadingPicture ? 'Uploading...' : 'Upload Photo'}
                </span>
              </label>
              {(profileForm.picture || picturePreview) && (
                <button
                  onClick={handleDeletePicture}
                  disabled={uploadingPicture}
                  className="text-sm text-red-500 hover:text-red-700 text-left"
                >
                  Remove Photo
                </button>
              )}
              <p className="text-xs text-muted-foreground">Max size: 5MB</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profileForm.name || ''}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Job Title
              </label>
              <input
                type="text"
                value={profileForm.title || ''}
                onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                placeholder="e.g., Software Engineer"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Phone</label>
              <input
                type="tel"
                value={profileForm.phone || ''}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="+91 1234567890"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Location
              </label>
              <input
                type="text"
                value={profileForm.location || ''}
                onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                placeholder="e.g., Hyderabad, India"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                LinkedIn
              </label>
              <input
                type="url"
                value={profileForm.linkedin || ''}
                onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">GitHub</label>
              <input
                type="url"
                value={profileForm.github || ''}
                onChange={(e) => setProfileForm({ ...profileForm, github: e.target.value })}
                placeholder="https://github.com/username"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Website
              </label>
              <input
                type="url"
                value={profileForm.website || ''}
                onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                placeholder="https://yourportfolio.com"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Bio</label>
              <textarea
                value={profileForm.bio || ''}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="Write a short bio about yourself..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                About Me
              </label>
              <textarea
                value={profileForm.summary || ''}
                onChange={(e) => setProfileForm({ ...profileForm, summary: e.target.value })}
                placeholder="Write a brief summary about yourself, your interests, and career goals..."
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            {profile?.picture && (
              <Image
                src={profile.picture}
                alt={profile.name}
                width={80}
                height={80}
                className="w-20 h-20 rounded-full"
              />
            )}
            <div>
              <h3 className="text-2xl font-bold text-foreground">{profile?.name}</h3>
              {profile?.title && <p className="text-muted-foreground">{profile.title}</p>}
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile?.phone && (
              <div>
                <span className="text-sm text-muted-foreground">Phone:</span>
                <p className="text-foreground">{profile.phone}</p>
              </div>
            )}
            {profile?.location && (
              <div>
                <span className="text-sm text-muted-foreground">Location:</span>
                <p className="text-foreground">{profile.location}</p>
              </div>
            )}
            {profile?.linkedin && (
              <div>
                <span className="text-sm text-muted-foreground">LinkedIn:</span>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-500 hover:underline block truncate"
                >
                  {profile.linkedin}
                </a>
              </div>
            )}
            {profile?.github && (
              <div>
                <span className="text-sm text-muted-foreground">GitHub:</span>
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-500 hover:underline block truncate"
                >
                  {profile.github}
                </a>
              </div>
            )}
            {profile?.website && (
              <div>
                <span className="text-sm text-muted-foreground">Website:</span>
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-500 hover:underline block truncate"
                >
                  {profile.website}
                </a>
              </div>
            )}
          </div>

          {profile?.bio && (
            <div>
              <span className="text-sm text-muted-foreground">Bio:</span>
              <p className="text-foreground mt-1">{profile.bio}</p>
            </div>
          )}

          {profile?.summary && (
            <div>
              <span className="text-sm text-muted-foreground">About Me:</span>
              <p className="text-foreground mt-1">{profile.summary}</p>
            </div>
          )}

          {!profile?.phone && !profile?.location && !profile?.bio && (
            <p className="text-muted-foreground italic">
              Click &quot;Edit&quot; to add more details to your profile.
            </p>
          )}
        </div>
      )}
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Education</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info('Add education form coming soon!')}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Education
        </Button>
      </div>

      {education.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <GraduationCapIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No education added yet.</p>
          <p className="text-sm">Add your educational background to enhance your profile.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {education.map((edu) => (
            <div
              key={edu.id}
              className="p-4 rounded-xl border border-border bg-card"
              style={{ backgroundColor: 'hsl(var(--card))' }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {edu.degree} in {edu.branch}
                  </h3>
                  <p className="text-muted-foreground">{edu.institution}</p>
                  <p className="text-sm text-muted-foreground">{edu.location}</p>
                  <p className="text-sm text-muted-foreground">
                    {edu.startDate} - {edu.endDate || 'Present'}
                    {edu.gpa && ` • GPA: ${edu.gpa}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toast.info('Edit form coming soon!')}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete('education', edu.id, fetchAllData)}
                  >
                    <TrashIcon className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderExperience = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Work Experience</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info('Add experience form coming soon!')}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Experience
        </Button>
      </div>

      {experiences.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BriefcaseIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No work experience added yet.</p>
          <p className="text-sm">Add your work history including internships and jobs.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="p-4 rounded-xl border border-border bg-card"
              style={{ backgroundColor: 'hsl(var(--card))' }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-foreground">{exp.position}</h3>
                  <p className="text-muted-foreground">{exp.company}</p>
                  <p className="text-sm text-muted-foreground">{exp.location}</p>
                  <p className="text-sm text-muted-foreground">
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </p>
                  {exp.description && (
                    <p className="mt-2 text-sm text-foreground">{exp.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toast.info('Edit form coming soon!')}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete('experiences', exp.id, fetchAllData)}
                  >
                    <TrashIcon className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Skills</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info('Add skill form coming soon!')}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Skill Category
        </Button>
      </div>

      {skills.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CodeIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No skills added yet.</p>
          <p className="text-sm">Add your technical and soft skills.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="p-4 rounded-xl border border-border bg-card"
              style={{ backgroundColor: 'hsl(var(--card))' }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-foreground">{skill.category}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skill.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-sm rounded-md bg-primary-500/10 text-primary-500"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toast.info('Edit form coming soon!')}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete('skills', skill.id, fetchAllData)}
                  >
                    <TrashIcon className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Projects</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info('Add project form coming soon!')}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FolderIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No projects added yet.</p>
          <p className="text-sm">Showcase your best work by adding projects.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="p-4 rounded-xl border border-border bg-card"
              style={{ backgroundColor: 'hsl(var(--card))' }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-foreground">{project.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs rounded-md bg-accent/10 text-accent"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-2">
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-500 hover:underline"
                      >
                        Live Demo
                      </a>
                    )}
                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-500 hover:underline"
                      >
                        Source Code
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toast.info('Edit form coming soon!')}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete('projects', project.id, fetchAllData)}
                  >
                    <TrashIcon className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCertifications = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Certifications</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info('Add certification form coming soon!')}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Certification
        </Button>
      </div>

      {certifications.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <AwardIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No certifications added yet.</p>
          <p className="text-sm">Add your certifications, online courses, and achievements.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {certifications.map((cert) => (
            <div
              key={cert.id}
              className="p-4 rounded-xl border border-border bg-card"
              style={{ backgroundColor: 'hsl(var(--card))' }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-foreground">{cert.name}</h3>
                  <p className="text-muted-foreground">{cert.issuer}</p>
                  <p className="text-sm text-muted-foreground">{cert.date}</p>
                  {cert.url && (
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-500 hover:underline"
                    >
                      View Certificate
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toast.info('Edit form coming soon!')}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete('certifications', cert.id, fetchAllData)}
                  >
                    <TrashIcon className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderLanguages = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Languages</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info('Add language form coming soon!')}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Language
        </Button>
      </div>

      {languages.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <GlobeIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No languages added yet.</p>
          <p className="text-sm">Add languages you speak and your proficiency level.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {languages.map((lang) => (
            <div
              key={lang.id}
              className="p-4 rounded-xl border border-border bg-card"
              style={{ backgroundColor: 'hsl(var(--card))' }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-foreground">{lang.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {lang.proficiency.toLowerCase()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toast.info('Edit form coming soon!')}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete('languages', lang.id, fetchAllData)}
                  >
                    <TrashIcon className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'personal':
        return renderPersonalInfo();
      case 'education':
        return renderEducation();
      case 'experience':
        return renderExperience();
      case 'skills':
        return renderSkills();
      case 'projects':
        return renderProjects();
      case 'certifications':
        return renderCertifications();
      case 'languages':
        return renderLanguages();
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative">
      <Header />
      {/* Grid background pattern */}
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
            {/* Sidebar Tabs */}
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

            {/* Content Area */}
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

      {/* Footer */}
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
