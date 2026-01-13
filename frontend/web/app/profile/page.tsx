'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import Image from 'next/image';
import { ExternalLinkIcon, GithubIcon } from 'lucide-react';

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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
  const [educationForm, setEducationForm] = useState<Partial<Education>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingExp, setIsAddingExp] = useState(false);
  const [isAddingEducation, setIsAddingEducation] = useState(false);
  const [expForm, setExpForm] = useState<Partial<Experience>>({
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    highlights: [],
  });
  const [editingEducationId, setEditingEducationId] = useState<string | null>(null);

  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState<Partial<Project>>({
    name: '',
    technologies: [],
    highlights: [],
    url: '',
    repoUrl: '',
  });
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const [editingSkills, setEditingSkills] = useState(false);
  const [skillsForm, setSkillsForm] = useState<Skill[]>([]);
  const [savingSkills, setSavingSkills] = useState(false);
  // Add these to your component
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [skillForm, setSkillForm] = useState<Partial<Skill>>({ category: '', items: [] });
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [certForm, setCertForm] = useState<Partial<Certification>>({
    name: '',
    issuer: '',
    date: '',
    url: '',
  });
  const [isAddingCert, setIsAddingCert] = useState(false);
  const [certToDelete, setCertToDelete] = useState<string | null>(null);

  const [editingLangId, setEditingLangId] = useState<string | null>(null);
  const [langForm, setLangForm] = useState<Partial<Language>>({ name: '', proficiency: '' });
  const [isAddingLang, setIsAddingLang] = useState(false);
  const [langToDelete, setLangToDelete] = useState<string | null>(null);

  // Helper to add a new empty category
  const addCategory = () => {
    const newCategory: Skill = {
      id: Date.now().toString(), // Temporary ID for new items
      category: '',
      items: [],
    };
    setSkillsForm([...skillsForm, newCategory]);
  };

  const [skillToDelete, setSkillToDelete] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [proficiencyError, setProficiencyError] = useState<string | null>(null);

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
      showMessage('error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      if (profileForm.linkedin) {
        if (!profileForm.linkedin.includes('linkedin.com/in/')) {
          showMessage('error', 'Please enter a valid link (linkedin.com/in/username)');
          setSaving(false);
          return;
        }
        if (!profileForm.linkedin.startsWith('http')) {
          profileForm.linkedin = `https://${profileForm.linkedin}`;
        }
      }

      if (profileForm.github) {
        if (!profileForm.github.includes('github.com/')) {
          showMessage('error', 'Please enter a valid GitHub link');
          setSaving(false);
          return;
        }
        if (!profileForm.github.startsWith('http')) {
          profileForm.github = `https://${profileForm.github}`;
        }
      }
      const clean = (val: any) => (val === null || val === undefined ? '' : val);

      const payload = {
        name: clean(profileForm.name),
        title: clean(profileForm.title),
        phone: clean(profileForm.phone),
        location: clean(profileForm.location),
        linkedin: clean(profileForm.linkedin),
        github: clean(profileForm.github),
        website: clean(profileForm.website),
        bio: clean(profileForm.bio),
        summary: clean(profileForm.summary),
      };

      const response = await api.patch('/user-details/profile', payload);

      setProfile(response.data);
      setEditingProfile(false);
      showMessage('success', 'Profile updated successfully');
      refreshUser();
    } catch (error) {
      console.error('Update failed:', error);
      showMessage('error', 'Update failed: Check your input formats');
    } finally {
      setSaving(false);
    }
  };

  const handleAddExperience = async () => {
    if (!expForm.company || !expForm.position || !expForm.startDate) {
      showMessage('error', 'Company, Position, and Start Date are required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        company: expForm.company,
        position: expForm.position,
        location: expForm.location || 'Remote',
        startDate: expForm.startDate, // Will be "YYYY-MM"
        endDate: expForm.current ? null : expForm.endDate,
        current: !!expForm.current,
        description: expForm.description || '',
        highlights: expForm.highlights || [],
      };

      const endpoint = editingId
        ? `/user-details/experiences/${editingId}`
        : '/user-details/experiences';

      const method = editingId ? 'patch' : 'post';
      await api[method](endpoint, payload);

      await fetchAllData();
      setIsAddingExp(false);
      setEditingId(null);
      setExpForm({
        company: '',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
        highlights: [],
      });
      showMessage('success', editingId ? 'Experience updated!' : 'Experience added!');
    } catch (error: any) {
      console.error('Save Error:', error.response?.data);
      showMessage('error', error.response?.data?.msg || 'Failed to save experience');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEducation = async (id?: string) => {
    setSaving(true);
    try {
      if (
        !educationForm.institution ||
        !educationForm.degree ||
        !educationForm.branch ||
        !educationForm.startDate
      ) {
        showMessage(
          'error',
          'Please fill in all mandatory fields (Institution, Degree, Branch, and Start Date)'
        );
        setSaving(false);
        return;
      }

      const dateRegex = /^\d{4}-\d{2}$/;
      if (!dateRegex.test(educationForm.startDate)) {
        showMessage('error', 'Start Date must be in YYYY-MM format');
        setSaving(false);
        return;
      }
      if (educationForm.endDate && !dateRegex.test(educationForm.endDate)) {
        showMessage('error', 'End Date must be in YYYY-MM format');
        setSaving(false);
        return;
      }

      const clean = (val: any) => (val === null || val === undefined ? '' : val);

      const payload = {
        institution: clean(educationForm.institution),
        degree: clean(educationForm.degree),
        branch: clean(educationForm.branch),
        rollNumber: clean(educationForm.rollNumber),
        location: clean(educationForm.location),
        startDate: clean(educationForm.startDate),
        endDate: clean(educationForm.endDate),
        gpa: clean(educationForm.gpa),
        achievements: educationForm.achievements || [],
      };

      let response;
      if (id) {
        // Update existing item
        response = await api.patch(`/user-details/education/${id}`, payload);
        setEducation((prev) => prev.map((edu) => (edu.id === id ? response.data : edu)));
        showMessage('success', 'Education updated successfully');
      } else {
        // Add new item
        response = await api.post('/user-details/education', payload);
        setEducation((prev) => [...prev, response.data]);
        showMessage('success', 'Education added successfully');
      }

      // Reset UI states
      setEditingEducationId(null);
      setIsAddingEducation(false);
      setEducationForm({});
      refreshUser();
    } catch (error: any) {
      console.error('Update failed:', error);
      const errorMsg = error.response?.data?.msg || 'Update failed: Check your input formats';
      showMessage('error', errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const DeleteModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border p-6 rounded-2xl max-w-sm w-full shadow-2xl">
        <h3 className="text-xl font-bold text-foreground mb-2">Delete Category?</h3>
        <p className="text-muted-foreground mb-6">
          This action cannot be undone. Are you sure you want to remove this skill category?
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => {
              setShowDeleteModal(false);
              setSkillToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button
            className="bg-red-500 hover:bg-red-600 text-white border-none"
            onClick={() => {
              if (skillToDelete) {
                performSkillDeletion(skillToDelete);
              }
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );

  const handleSaveSkill = async () => {
    setSaving(true);
    try {
      const payload = {
        category: skillForm.category,
        items: skillForm.items,
      };

      let response;
      if (isAddingNew) {
        // Create new: POST /user-details/skills
        response = await api.post('/user-details/skills', payload);
        showMessage('success', 'Skill category added');
      } else {
        // Update existing: PATCH /user-details/skills/{id}
        response = await api.patch(`/user-details/skills/${editingSkillId}`, payload);
        showMessage('success', 'Skill category updated');
      }

      setEditingSkillId(null);
      setIsAddingNew(false);
      setSkillForm({ category: '', items: [] });
      fetchAllData(); // Refresh the list from server
    } catch (error) {
      console.error('Save failed:', error);
      showMessage('error', 'Failed to save skill');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCert = async () => {
    // Regex to match YYYY-MM
    const datePattern = /^\d{4}-\d{2}$/;

    if (certForm.date && !datePattern.test(certForm.date)) {
      showMessage('error', 'Date must be in YYYY-MM format');
      return;
    }

    setSaving(true);
    try {
      const formattedUrl =
        certForm.url && !certForm.url.startsWith('http') ? `https://${certForm.url}` : certForm.url;

      const payload = {
        ...certForm,
        date: certForm.date,
        url: formattedUrl,
      };

      if (isAddingCert) {
        await api.post('/user-details/certifications', payload);
        showMessage('success', 'Certification added');
      } else {
        await api.patch(`/user-details/certifications/${editingCertId}`, payload);
        showMessage('success', 'Certification updated');
      }

      setEditingCertId(null);
      setIsAddingCert(false);
      fetchAllData();
    } catch (error) {
      console.error(error);
      showMessage('error', 'Failed to save: Check date format (YYYY-MM)');
    } finally {
      setSaving(false);
    }
  };

  const performCertDeletion = async (id: string) => {
    try {
      await api.delete(`/user-details/certifications/${id}`);
      showMessage('success', 'Certification removed');
      fetchAllData();
      setCertToDelete(null);
    } catch (error) {
      showMessage('error', 'Delete failed');
    }
  };

  const handleUpdateSkills = async () => {
    setSavingSkills(true);
    try {
      if (skillsForm.some((s) => !s.category.trim())) {
        showMessage('error', 'Please provide a name for all categories');
        setSavingSkills(false);
        return;
      }

      const response = await api.patch('/user-details/skills', { skills: skillsForm });

      setSkills(response.data);
      setEditingSkills(false);
      showMessage('success', 'Skills updated successfully');
      refreshUser();
    } catch (error) {
      console.error('Update failed:', error);
      showMessage('error', 'Failed to update skills');
    } finally {
      setSavingSkills(false);
    }
  };

  const performSkillDeletion = async (id: string) => {
    setSaving(true);
    try {
      await api.delete(`/user-details/skills/${id}`);

      showMessage('success', 'Category deleted successfully');
      fetchAllData();
      setShowDeleteModal(false);
      setSkillToDelete(null);
    } catch (error) {
      console.error('Delete failed:', error);
      showMessage('error', 'Failed to delete the category');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProject = async () => {
    setSaving(true);

    const formatUrl = (link?: string) => {
      if (!link) return '';
      return link.startsWith('http') ? link : `https://${link}`;
    };

    try {
      const payload = {
        ...projectForm,
        url: formatUrl(projectForm.url),
        repoUrl: formatUrl(projectForm.repoUrl),
      };

      if (isAddingProject) {
        await api.post('/user-details/projects', payload);
      } else {
        await api.patch(`/user-details/projects/${editingProjectId}`, payload);
      }

      setEditingProjectId(null);
      setIsAddingProject(false);
      await fetchAllData();
      showMessage('success', 'Project saved successfully');
    } catch (error) {
      console.error('Save error:', error);
      showMessage('error', 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const performProjectDeletion = async (id: string) => {
    try {
      await api.delete(`/user-details/projects/${id}`);
      showMessage('success', 'Project removed');
      fetchAllData();
      setProjectToDelete(null);
    } catch (error) {
      showMessage('error', 'Delete failed');
    }
  };

  const handleDelete = async (endpoint: string, id: string, refreshFn: () => void) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await api.delete(`/user-details/${endpoint}/${id}`);
      refreshFn();
      showMessage('success', 'Item deleted successfully');
    } catch (error) {
      console.error('Failed to delete:', error);
      showMessage('error', 'Failed to delete item');
    }
  };

  const handleSaveLanguage = async () => {
    const hasLowercase = /[a-z]/.test(langForm.proficiency || '');

    if (hasLowercase) {
      setProficiencyError("Backend requires ALL CAPS. Please fix 'proficiency' field.");
      showMessage('error', 'Validation Error: Use ALL CAPS for proficiency.');
      return;
    }

    setProficiencyError(null);
    setSaving(true);

    try {
      const payload = {
        name: langForm.name,
        proficiency: langForm.proficiency,
      };

      if (isAddingLang) {
        await api.post('/user-details/languages', payload);
      } else {
        await api.patch(`/user-details/languages/${editingLangId}`, payload);
      }

      setEditingLangId(null);
      setIsAddingLang(false);
      fetchAllData();
      showMessage('success', 'Language saved!');
    } catch (error) {
      showMessage('error', 'Failed to save language');
    } finally {
      setSaving(false);
    }
  };

  const performLangDeletion = async (id: string) => {
    try {
      await api.delete(`/user-details/languages/${id}`);
      showMessage('success', 'Language removed');
      fetchAllData();
      setLangToDelete(null);
    } catch (error) {
      showMessage('error', 'Delete failed');
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
          <Button
            onClick={() => {
              setProfileForm(profile || {});
              setEditingProfile(true);
            }}
            variant="outline"
            size="sm"
          >
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
              onChange={(e) => {
                const value = e.target.value;
                if (/^[0-9+\s]*$/.test(value)) {
                  setProfileForm({ ...profileForm, phone: value });
                }
              }}
              placeholder="+91 1234567890"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Location</label>
            <input
              type="text"
              value={profileForm.location || ''}
              onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
              placeholder="e.g., Hyderabad, India"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">LinkedIn</label>
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
            <label className="block text-sm font-medium text-muted-foreground mb-1">Website</label>
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
            <label className="block text-sm font-medium text-muted-foreground mb-1">About Me</label>
            <textarea
              value={profileForm.summary || ''}
              onChange={(e) => setProfileForm({ ...profileForm, summary: e.target.value })}
              placeholder="Write a brief summary about yourself, your interests, and career goals..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
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

  const handleCreateEducation = async () => {
    if (!educationForm.institution || !educationForm.degree || !educationForm.startDate) {
      showMessage('error', 'Institution, Degree, and Start Date are required');
      return;
    }

    setSaving(true);
    try {
      const response = await api.post('/user-details/education', {
        ...educationForm,
        achievements: educationForm.achievements || [],
      });
      setEducation((prev) => [...prev, response.data]);
      setIsAddingEducation(false);
      setEducationForm({});
      showMessage('success', 'Education added successfully');
    } catch (error) {
      showMessage('error', 'Failed to create entry');
    } finally {
      setSaving(false);
    }
  };

  const renderEducation = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Education</h2>
        {!isAddingEducation && !editingEducationId && (
          <Button
            onClick={() => {
              setEducationForm({});
              setIsAddingEducation(true);
            }}
            variant="outline"
            size="sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Education
          </Button>
        )}
      </div>

      {/* Form for Adding or Editing */}
      {isAddingEducation || editingEducationId ? (
        <div className="p-4 rounded-xl border border-border bg-card/50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Institution *
              </label>
              <input
                type="text"
                value={educationForm.institution || ''}
                onChange={(e) =>
                  setEducationForm({ ...educationForm, institution: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Degree *
              </label>
              <input
                type="text"
                value={educationForm.degree || ''}
                onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Branch *
              </label>
              <input
                type="text"
                value={educationForm.branch || ''}
                onChange={(e) => setEducationForm({ ...educationForm, branch: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Start Date (YYYY-MM) *
              </label>
              <input
                type="text"
                placeholder="2022-01"
                value={educationForm.startDate || ''}
                onChange={(e) => setEducationForm({ ...educationForm, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                End Date (YYYY-MM)
              </label>
              <input
                type="text"
                placeholder="2025-12"
                value={educationForm.endDate || ''}
                onChange={(e) => setEducationForm({ ...educationForm, endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Location
              </label>
              <input
                type="text"
                value={educationForm.location || ''}
                onChange={(e) => setEducationForm({ ...educationForm, location: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">GPA</label>
              <input
                type="text"
                value={educationForm.gpa || ''}
                onChange={(e) => setEducationForm({ ...educationForm, gpa: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              onClick={() => handleUpdateEducation(editingEducationId || undefined)}
              disabled={saving}
              size="sm"
              className="bg-primary-500 hover:bg-primary-600"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={() => {
                setEditingEducationId(null);
                setIsAddingEducation(false);
                setEducationForm({});
              }}
              variant="outline"
              size="sm"
            >
              <XIcon className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {education.map((edu) => (
            <div
              key={edu.id}
              className="p-4 rounded-xl border border-border bg-card group relative"
            >
              <div className="absolute right-4 top-4 flex gap-2">
                <Button
                  onClick={() => {
                    setEducationForm(edu);
                    setEditingEducationId(edu.id);
                  }}
                  variant="ghost"
                  size="sm"
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => handleDelete('education', edu.id, fetchAllData)}
                  variant="ghost"
                  size="sm"
                >
                  <TrashIcon className="h-4 w-4 text-red-500" />
                </Button>
              </div>

              <div className="pr-20">
                <h3 className="text-lg font-bold text-foreground">
                  {edu.degree} in {edu.branch}
                </h3>
                <p className="text-primary-500 font-medium">{edu.institution}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {edu.startDate} — {edu.endDate || 'Present'} | {edu.location}
                </p>
                {edu.gpa && (
                  <p className="text-sm font-medium text-foreground mt-2">GPA: {edu.gpa}</p>
                )}
              </div>
            </div>
          ))}

          {education.length === 0 && (
            <p className="text-muted-foreground italic text-center py-8">
              Click &quot;Add Education&quot; to list your academic background.
            </p>
          )}
        </div>
      )}
    </div>
  );

  const renderExperience = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Work Experience</h2>
        {!isAddingExp ? (
          <Button
            onClick={() => {
              setExpForm({
                company: '',
                position: '',
                location: '',
                startDate: '',
                endDate: '',
                current: false,
                description: '',
                highlights: [],
              });
              setEditingId(null);
              setIsAddingExp(true);
            }}
            variant="outline"
            size="sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Experience
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleAddExperience}
              disabled={saving}
              size="sm"
              className="bg-primary-500 hover:bg-primary-600 text-white"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={() => {
                setIsAddingExp(false);
                setEditingId(null);
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

      {isAddingExp ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-muted-foreground mb-1">Company</label>
            <input
              type="text"
              value={expForm.company || ''}
              onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
              placeholder="e.g. Uber"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Position</label>
            <input
              type="text"
              value={expForm.position || ''}
              onChange={(e) => setExpForm({ ...expForm, position: e.target.value })}
              placeholder="e.g. Software Engineer"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Location</label>
            <input
              type="text"
              value={expForm.location || ''}
              onChange={(e) => setExpForm({ ...expForm, location: e.target.value })}
              placeholder="e.g. Bengaluru, India"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Start Date
            </label>
            <input
              type="month"
              value={expForm.startDate || ''}
              onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">End Date</label>
            <input
              type="month"
              disabled={expForm.current}
              value={expForm.current ? '' : expForm.endDate || ''}
              onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Description
            </label>
            <textarea
              value={expForm.description || ''}
              onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
              placeholder="What were your key responsibilities and impact?"
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl border-border">
              <BriefcaseIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No work experience added yet.</p>
            </div>
          ) : (
            experiences.map((exp) => (
              <div
                key={exp.id}
                className="p-5 rounded-xl border border-border bg-card group relative hover:border-primary-500/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-foreground">{exp.position}</h3>
                    <p className="text-primary-500 font-medium">{exp.company}</p>
                    <p className="text-sm text-muted-foreground">
                      {exp.startDate?.replace('-', '/')} —{' '}
                      {exp.current ? 'Present' : exp.endDate?.replace('-', '/')} | {exp.location}
                    </p>
                    {exp.description && (
                      <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {exp.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setExpForm(exp);
                        setEditingId(exp.id);
                        setIsAddingExp(true);
                      }}
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
            ))
          )}
        </div>
      )}
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-6 relative">
      {/* Custom Delete Popup */}
      {showDeleteModal && <DeleteModal />}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Skills</h2>
        {!isAddingNew && (
          <Button
            onClick={() => {
              setSkillForm({ category: '', items: [] });
              setIsAddingNew(true);
              setEditingSkillId('new');
            }}
            variant="outline"
            size="sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        )}
      </div>

      {/* Changed from grid to a single column space-y stack for full width */}
      <div className="space-y-4">
        {/* --- ADD NEW CATEGORY FORM --- */}
        {isAddingNew && (
          <div className="p-5 rounded-xl border-2 border-primary-500/50 bg-card space-y-4 w-full">
            <input
              autoFocus
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Category (e.g. Backend Development)"
              value={skillForm.category}
              onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
            />
            <textarea
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Skills (comma separated: Node.js, Express, MongoDB)"
              rows={2}
              onChange={(e) =>
                setSkillForm({
                  ...skillForm,
                  items: e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter((s) => s !== ''),
                })
              }
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={() => setIsAddingNew(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveSkill} disabled={saving}>
                {saving ? 'Saving...' : 'Add Category'}
              </Button>
            </div>
          </div>
        )}

        {/* --- EXISTING SKILLS LIST --- */}
        {skills.map((skill) => (
          <div
            key={skill.id}
            className="p-5 rounded-xl border border-border bg-card w-full transition-all hover:border-primary-500/30"
          >
            {editingSkillId === skill.id ? (
              <div className="space-y-4">
                <input
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={skillForm.category}
                  onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                />
                <textarea
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={skillForm.items?.join(', ')}
                  rows={2}
                  onChange={(e) =>
                    setSkillForm({
                      ...skillForm,
                      items: e.target.value.split(',').map((s) => s.trim()),
                    })
                  }
                />
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" onClick={() => setEditingSkillId(null)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveSkill}>
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-foreground">{skill.category}</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-primary-500/10"
                      onClick={() => {
                        setSkillForm(skill);
                        setEditingSkillId(skill.id);
                      }}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-red-500/10 text-red-500"
                      onClick={() => {
                        setSkillToDelete(skill.id);
                        setShowDeleteModal(true);
                      }}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skill.items.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-sm font-medium rounded-lg bg-primary-500/10 text-primary-500 border border-primary-500/10"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6 relative">
      {/* Custom Delete Confirmation */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border p-6 rounded-2xl max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-foreground mb-2">Delete Project?</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to remove this project? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setProjectToDelete(null)}>
                Cancel
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={() => performProjectDeletion(projectToDelete)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Projects</h2>
        {!isAddingProject && (
          <Button
            onClick={() => {
              setProjectForm({ name: '', technologies: [], highlights: [], url: '', repoUrl: '' });
              setIsAddingProject(true);
              setEditingProjectId('new');
            }}
            variant="outline"
            size="sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" /> Add Project
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* --- ADD / EDIT FORM --- */}
        {(isAddingProject || editingProjectId) && (
          <div className="p-6 rounded-xl border-2 border-primary-500/50 bg-card space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                placeholder="Project Name"
                value={projectForm.name}
                onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
              />
              <input
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                placeholder="Technologies (comma separated)"
                value={projectForm.technologies?.join(', ')}
                onChange={(e) =>
                  setProjectForm({
                    ...projectForm,
                    technologies: e.target.value.split(',').map((s) => s.trim()),
                  })
                }
              />
              <input
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                placeholder="Live Demo URL"
                value={projectForm.url}
                onChange={(e) => setProjectForm({ ...projectForm, url: e.target.value })}
              />
              <input
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                placeholder="Repo URL (GitHub)"
                value={projectForm.repoUrl}
                onChange={(e) => setProjectForm({ ...projectForm, repoUrl: e.target.value })}
              />
            </div>
            <textarea
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground resize-none"
              placeholder="Key Highlights (one per line)"
              rows={3}
              value={projectForm.highlights?.join('\n')}
              onChange={(e) =>
                setProjectForm({ ...projectForm, highlights: e.target.value.split('\n') })
              }
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsAddingProject(false);
                  setEditingProjectId(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveProject} disabled={saving}>
                {saving ? 'Saving...' : 'Save Project'}
              </Button>
            </div>
          </div>
        )}

        {/* --- PROJECT LIST --- */}
        {projects.map(
          (project) =>
            editingProjectId !== project.id && (
              <div
                key={project.id}
                className="p-5 rounded-xl border border-border bg-card w-full hover:border-primary-500/30 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <h3 className="text-lg font-bold text-foreground">{project.name}</h3>

                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-xs rounded-md bg-primary-500/10 text-primary-500 border border-primary-500/20"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {project.highlights && project.highlights.length > 0 && (
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-3">
                        {project.highlights.map((h, i) => h && <li key={i}>{h}</li>)}
                      </ul>
                    )}

                    <div className="flex gap-4 pt-2">
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          className="text-sm text-primary-500 flex items-center gap-1 hover:underline"
                        >
                          <ExternalLinkIcon className="h-3 w-3" /> Demo
                        </a>
                      )}
                      {project.repoUrl && (
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          className="text-sm text-primary-500 flex items-center gap-1 hover:underline"
                        >
                          <GithubIcon className="h-3 w-3" /> Code
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setProjectForm(project);
                        setEditingProjectId(project.id);
                      }}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setProjectToDelete(project.id)}
                    >
                      <TrashIcon className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );

  const renderCertifications = () => (
    <div className="space-y-6 relative">
      {/* Custom Delete Popup */}
      {certToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border p-6 rounded-2xl max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-foreground mb-2">Remove Certification?</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure? This will permanently delete this achievement from your profile.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setCertToDelete(null)}>
                Cancel
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white border-none"
                onClick={() => performCertDeletion(certToDelete)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Certifications</h2>
        {!isAddingCert && (
          <Button
            onClick={() => {
              setCertForm({ name: '', issuer: '', date: '', url: '' });
              setIsAddingCert(true);
              setEditingCertId('new');
            }}
            variant="outline"
            size="sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" /> Add Certification
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* --- ADD / EDIT FORM --- */}
        {(isAddingCert || editingCertId) && (
          <div className="p-6 rounded-xl border-2 border-primary-500/50 bg-card space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground ml-1">Certification Name</label>
                <input
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground mt-1"
                  placeholder="e.g. AWS Certified Solutions Architect"
                  value={certForm.name}
                  onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground ml-1">Issuer</label>
                <input
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground mt-1"
                  placeholder="e.g. Amazon Web Services"
                  value={certForm.issuer}
                  onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground ml-1">Issue Date</label>
                <input
                  type="month" // Native browser picker for YYYY-MM
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground mt-1 appearance-none"
                  style={{ colorScheme: 'dark' }} // Ensures the picker is readable in dark mode
                  value={certForm.date || ''}
                  onChange={(e) => setCertForm({ ...certForm, date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground ml-1">Credential URL</label>
                <input
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground mt-1"
                  placeholder="https://verify.cert.com/id"
                  value={certForm.url}
                  onChange={(e) => setCertForm({ ...certForm, url: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsAddingCert(false);
                  setEditingCertId(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveCert} disabled={saving}>
                {saving ? 'Saving...' : 'Save Certification'}
              </Button>
            </div>
          </div>
        )}

        {/* --- CERTIFICATION LIST --- */}
        {certifications.map(
          (cert) =>
            editingCertId !== cert.id && (
              <div
                key={cert.id}
                className="p-5 rounded-xl border border-border bg-card w-full hover:border-primary-500/30 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-foreground">{cert.name}</h3>
                    <p className="text-primary-500 font-medium">{cert.issuer}</p>
                    <p className="text-sm text-muted-foreground">
                      {cert.date
                        ? new Date(cert.date).toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'No date'}
                    </p>
                    {cert.url && (
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-500 flex items-center gap-1 mt-2 hover:underline"
                      >
                        <ExternalLinkIcon className="h-3 w-3" /> View Credential
                      </a>
                    )}
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCertForm(cert);
                        setEditingCertId(cert.id);
                      }}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setCertToDelete(cert.id)}>
                      <TrashIcon className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );

  const renderLanguages = () => (
    <div className="space-y-6 relative">
      {/* Custom Delete Popup */}
      {langToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-center">
          <div className="bg-card border border-border p-6 rounded-2xl max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-foreground mb-2">Remove Language?</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to remove this language?
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setLangToDelete(null)}>
                Cancel
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white border-none"
                onClick={() => performLangDeletion(langToDelete)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Languages</h2>
        {!isAddingLang && (
          <Button
            onClick={() => {
              setLangForm({ name: '', proficiency: '' });
              setIsAddingLang(true);
              setEditingLangId('new');
              setProficiencyError(null);
            }}
            variant="outline"
            size="sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" /> Add Language
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* --- ADD / EDIT FORM --- */}
        {(isAddingLang || editingLangId) && (
          <div className="p-6 rounded-xl border-2 border-primary-500/50 bg-card space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Language Name */}
              <div>
                <label className="text-xs text-muted-foreground ml-1 font-bold">
                  Language Name
                </label>
                <input
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground mt-1 focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="e.g. English"
                  value={langForm.name}
                  onChange={(e) => setLangForm({ ...langForm, name: e.target.value })}
                />
              </div>

              {/* Proficiency with Real-time Validation */}
              <div>
                <label
                  className={`text-xs ml-1 font-bold ${
                    proficiencyError ? 'text-red-500' : 'text-muted-foreground'
                  }`}
                >
                  Proficiency Level (ALL CAPS REQUIRED)
                </label>
                <input
                  className={`w-full px-4 py-2 rounded-lg border bg-background text-foreground mt-1 focus:ring-2 outline-none transition-all ${
                    proficiencyError
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-border focus:ring-primary-500'
                  }`}
                  placeholder="E.g. BEGINNER, EXPERT"
                  value={langForm.proficiency}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLangForm({ ...langForm, proficiency: val });
                    // Immediate feedback logic
                    if (/[a-z]/.test(val)) {
                      setProficiencyError('Must be ALL CAPS');
                    } else {
                      setProficiencyError(null);
                    }
                  }}
                />
                {proficiencyError ? (
                  <p className="text-[11px] text-red-500 mt-1 ml-1 font-semibold">
                    ⚠️ {proficiencyError}: Please remove lowercase letters.
                  </p>
                ) : (
                  <p className="text-[10px] text-muted-foreground mt-1 ml-1">
                    Ensure the text is entirely uppercase to save.
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsAddingLang(false);
                  setEditingLangId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveLanguage}
                disabled={saving || !!proficiencyError}
                className={proficiencyError ? 'opacity-50 cursor-not-allowed' : ''}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        )}

        {/* --- LIST VIEW --- */}
        {languages.map(
          (lang) =>
            editingLangId !== lang.id && (
              <div
                key={lang.id}
                className="p-5 rounded-xl border border-border bg-card w-full hover:border-primary-500/30 transition-all flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-bold text-foreground">{lang.name}</h3>
                  <p className="text-sm text-primary-500 font-bold">{lang.proficiency}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setLangForm(lang);
                      setEditingLangId(lang.id);
                      setProficiencyError(null);
                    }}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setLangToDelete(lang.id)}>
                    <TrashIcon className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            )
        )}
      </div>
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

      {/* Message Toast */}
      {message && (
        <div
          className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-lg shadow-lg ${
            message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {message.text}
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">My Profile</h1>

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
                        : 'text-muted-foreground hover:bg-accent/5'
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
