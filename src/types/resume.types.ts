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
    picture?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    website?: string;
    bio?: string;
    title?: string;
    summary?: string;
  };
  experiences: Array<{
    id: string;
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description?: string;
    highlights: string[];
    order: number;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    location: string;
    startDate: string;
    endDate?: string;
    gpa?: string;
    achievements: string[];
    order: number;
  }>;
  skills: Array<{
    id: string;
    category: string;
    items: string[];
    order: number;
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    github?: string;
    highlights: string[];
    order: number;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    url?: string;
    order: number;
  }>;
  languages: Array<{
    id: string;
    name: string;
    proficiency: string;
    order: number;
  }>;
}

// Available templates
export type ResumeTemplate = 'modern' | 'classic' | 'minimal' | 'professional';

export interface TemplateInfo {
  id: ResumeTemplate;
  name: string;
  description: string;
  preview?: string;
}
