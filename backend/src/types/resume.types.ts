// Resume types for saved resumes

export interface SavedResume {
  id: string;
  userId: string;
  title: string;
  template: string;
  data: ResumeData;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResumeData {
  // Selected sections and their order
  sections: ResumeSection[];
  // Selected item IDs for each section (user can choose which items to include)
  selectedExperiences?: string[];
  selectedEducation?: string[];
  selectedSkills?: string[];
  selectedProjects?: string[];
  selectedCertifications?: string[];
  selectedLanguages?: string[];
  // Custom styling options
  styling?: ResumeStyling;
}

export interface ResumeSection {
  id: string;
  type:
    | 'profile'
    | 'experience'
    | 'education'
    | 'skills'
    | 'projects'
    | 'certifications'
    | 'languages';
  enabled: boolean;
  order: number;
}

export interface ResumeStyling {
  primaryColor?: string;
  fontFamily?: string;
  fontSize?: 'small' | 'medium' | 'large';
  spacing?: 'compact' | 'normal' | 'relaxed';
}

export interface CreateResumeRequest {
  title: string;
  template?: string;
  data: ResumeData;
}

export interface UpdateResumeRequest {
  title?: string;
  template?: string;
  data?: ResumeData;
}

// Resume preview data (all user data compiled for preview)
export interface ResumePreviewData {
  profile: {
    id: string;
    email: string;
    name: string;
    picture: string | null;
    phone: string | null;
    location: string | null;
    linkedin: string | null;
    github: string | null;
    website: string | null;
    bio: string | null;
    title: string | null;
    summary: string | null;
  };
  experiences: {
    id: string;
    company: string;
    position: string;
    location: string;
    sector: string | null;
    salaryRange: string | null;
    startDate: string;
    endDate: string | null;
    current: boolean;
    description: string | null;
    highlights: string[];
    order: number;
  }[];
  education: {
    id: string;
    institution: string;
    degree: string;
    branch: string;
    rollNumber: string | null;
    location: string;
    startDate: string;
    endDate: string | null;
    gpa: string | null;
    achievements: string[];
    order: number;
  }[];
  skills: {
    id: string;
    category: string;
    items: string[];
    proficiency: string | null;
    order: number;
  }[];
  projects: {
    id: string;
    name: string;
    technologies: string[];
    url: string | null;
    repoUrl: string | null;
    highlights: string[];
    order: number;
  }[];
  certifications: {
    id: string;
    name: string;
    issuer: string;
    date: string;
    url: string | null;
    order: number;
  }[];
  languages: {
    id: string;
    name: string;
    proficiency: string;
    order: number;
  }[];
}

// Available templates
export type ResumeTemplate = 'modern' | 'classic' | 'minimal' | 'professional';

export interface TemplateInfo {
  id: ResumeTemplate;
  name: string;
  description: string;
  preview?: string;
}
