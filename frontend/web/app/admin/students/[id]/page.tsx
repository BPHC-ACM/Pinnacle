'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';

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
  experiences?: Experience[];
  education?: Education[];
  skills?: Skill[];
  projects?: Project[];
  certifications?: Certification[];
  languages?: Language[];
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  parentRelation?: string;
  markSheets?: MarkSheet[];
}

interface MarkSheet {
  id: string;
  term: string;
  academicYear: string;
  fileName: string;
  fileUrl: string;
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

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const studentId = params.id as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/admin/students/${studentId}/profile`);
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching student profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load student profile',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [studentId, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Student Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested student could not be found.</p>
          <Button onClick={() => router.push('/admin/students')}>Back to Students</Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-6 pb-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/admin/students')}>
            ← Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Student Profile</h1>
            <p className="text-muted-foreground mt-1">View complete student profile</p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-6">
            {profile.picture ? (
              <Image
                src={profile.picture}
                alt={profile.name}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 space-y-2">
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              {profile.title && <p className="text-lg text-muted-foreground">{profile.title}</p>}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-3">
                {profile.linkedin && (
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    LinkedIn
                  </a>
                )}
                {profile.github && (
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    GitHub
                  </a>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
          {profile.summary && (
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Summary</h3>
              <p className="text-muted-foreground">{profile.summary}</p>
            </div>
          )}
          {profile.bio && (
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Bio</h3>
              <p className="text-muted-foreground">{profile.bio}</p>
            </div>
          )}

          {/* Parent Details */}
          {(profile.parentName || profile.parentEmail || profile.parentPhone) && (
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-4">Parent / Guardian Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block mb-1">Name</span>
                  <span className="font-medium">{profile.parentName || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Relation</span>
                  <span className="font-medium">{profile.parentRelation || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Email</span>
                  <span className="font-medium">{profile.parentEmail || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Phone</span>
                  <span className="font-medium">{profile.parentPhone || '-'}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mark Sheets */}
      <Card>
        <CardHeader>
          <CardTitle>Mark Sheets</CardTitle>
        </CardHeader>
        <CardContent>
          {!profile.markSheets || profile.markSheets.length === 0 ? (
            <p className="text-muted-foreground text-sm">No mark sheets uploaded.</p>
          ) : (
            <div className="space-y-4">
              {profile.markSheets.map((sheet) => (
                <div
                  key={sheet.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold">{sheet.term}</h3>
                    <p className="text-sm text-muted-foreground">
                      Academic Year: {sheet.academicYear}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={sheet.fileUrl} target="_blank" rel="noopener noreferrer">
                      Download PDF
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Experience */}
      {profile.experiences && profile.experiences.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {profile.experiences.map((exp) => (
                <div key={exp.id} className="border-l-2 border-primary pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{exp.position}</h3>
                      <p className="text-muted-foreground">{exp.company}</p>
                      <p className="text-sm text-muted-foreground">
                        {exp.location} {exp.sector && `• ${exp.sector}`}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {formatDate(exp.startDate)} -{' '}
                      {exp.current ? 'Present' : exp.endDate ? formatDate(exp.endDate) : 'N/A'}
                    </Badge>
                  </div>
                  {exp.description && (
                    <p className="text-sm text-muted-foreground mb-2">{exp.description}</p>
                  )}
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {exp.highlights.map((highlight, idx) => (
                        <li key={idx} className="text-muted-foreground">
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Education */}
      {profile.education && profile.education.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Education</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {profile.education.map((edu) => (
                <div key={edu.id} className="border-l-2 border-primary pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{edu.degree}</h3>
                      <p className="text-muted-foreground">{edu.institution}</p>
                      <p className="text-sm text-muted-foreground">
                        {edu.branch} • {edu.location}
                      </p>
                      {edu.rollNumber && (
                        <p className="text-sm text-muted-foreground">Roll No: {edu.rollNumber}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {formatDate(edu.startDate)} -{' '}
                        {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                      </Badge>
                      {edu.gpa && <p className="text-sm font-semibold mt-1">GPA: {edu.gpa}</p>}
                    </div>
                  </div>
                  {edu.achievements && edu.achievements.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {edu.achievements.map((achievement, idx) => (
                        <li key={idx} className="text-muted-foreground">
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.skills.map((skill) => (
                <div key={skill.id}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{skill.category}</h3>
                    {skill.proficiency && <Badge variant="secondary">{skill.proficiency}</Badge>}
                  </div>
                  {skill.items && skill.items.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {skill.items.map((item, idx) => (
                        <Badge key={idx} variant="outline">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects */}
      {profile.projects && profile.projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {profile.projects.map((project) => (
                <div key={project.id} className="border-l-2 border-primary pl-4">
                  <h3 className="font-semibold text-lg mb-2">{project.name}</h3>
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {project.technologies.map((tech, idx) => (
                        <Badge key={idx} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-4 mb-2 text-sm">
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Live Demo
                      </a>
                    )}
                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Repository
                      </a>
                    )}
                  </div>
                  {project.highlights && project.highlights.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {project.highlights.map((highlight, idx) => (
                        <li key={idx} className="text-muted-foreground">
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certifications */}
      {profile.certifications && profile.certifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Certifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="flex justify-between items-start p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold">{cert.name}</h3>
                    <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                    {cert.url && (
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View Certificate
                      </a>
                    )}
                  </div>
                  <Badge variant="outline">{formatDate(cert.date)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Languages */}
      {profile.languages && profile.languages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Languages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {profile.languages.map((lang) => (
                <div key={lang.id} className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-1">{lang.name}</h3>
                  <p className="text-sm text-muted-foreground">{lang.proficiency}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
