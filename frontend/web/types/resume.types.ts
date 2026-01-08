// Resume types matching backend

export interface SavedResume {
  id: string;
  userId: string;
  title: string;
  template: string;
  data: ResumeData;
  createdAt: string;
  updatedAt: string;
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
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
}

export interface Experience {
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
}

export interface Education {
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
}

export interface Skill {
  id: string;
  category: string;
  items: string[];
  order: number;
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  domain: string;
  tools: string[];
  outcomes: string[];
  startDate: string | null;
  endDate: string | null;
  referenceUrl: string | null;
  order: number;
}

export interface Certification {
  id: string;
  title: string;
  organization: string;
  issueDate: string;
  expiryDate: string | null;
  credentialId: string | null;
  credentialUrl: string | null;
  order: number;
}

export interface Language {
  id: string;
  name: string;
  proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | 'NATIVE';
  order: number;
}

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  preview: string;
}

export interface ResumeFileMetadata {
  resumeId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  objectKey: string;
}
