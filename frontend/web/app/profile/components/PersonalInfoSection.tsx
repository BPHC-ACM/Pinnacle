'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { UserProfile } from './Types';
import { Pencil, Check, X, User } from 'lucide-react';

interface PersonalInfoSectionProps {
  profile: UserProfile | null;
  onSave: (form: Partial<UserProfile>) => Promise<void>;
  onPictureUpload: (file: File) => Promise<void>;
  onDeletePicture: () => Promise<void>;
  isSaving: boolean;
}

const formFields = [
  { name: 'name', label: 'Full Name', type: 'text', placeholder: '' },
  { name: 'title', label: 'Job Title', type: 'text', placeholder: 'e.g., Software Engineer' },
  { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+91 1234567890' },
  { name: 'location', label: 'Location', type: 'text', placeholder: 'e.g., Hyderabad, India' },
  {
    name: 'linkedin',
    label: 'LinkedIn',
    type: 'url',
    placeholder: 'https://linkedin.com/in/username',
  },
  { name: 'github', label: 'GitHub', type: 'url', placeholder: 'https://github.com/username' },
  {
    name: 'website',
    label: 'Website',
    type: 'url',
    placeholder: 'https://yourportfolio.com',
    span: 2,
  },
];

export function PersonalInfoSection({
  profile,
  onSave,
  onPictureUpload,
  onDeletePicture,
  isSaving,
}: PersonalInfoSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Partial<UserProfile>>(profile || {});
  const [isUploading, setIsUploading] = useState(false);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);

  const handleSave = async () => {
    await onSave(form);
    setIsEditing(false);
    setPicturePreview(null);
  };

  const handlePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPicturePreview(reader.result as string);
    reader.readAsDataURL(file);

    setIsUploading(true);
    await onPictureUpload(file);
    setIsUploading(false);
  };

  const handleCancel = () => {
    setForm(profile || {});
    setIsEditing(false);
    setPicturePreview(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    fieldName: keyof UserProfile,
  ) => {
    setForm((prev) => ({ ...prev, [fieldName]: e.target.value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Personal Information</h2>
        {!isEditing ? (
          <Button
            onClick={() => {
              setForm(profile || {});
              setIsEditing(true);
            }}
            variant="outline"
            size="sm"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving || isUploading}
              size="sm"
              className="bg-primary-500 hover:bg-primary-600"
            >
              <Check className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button onClick={handleCancel} variant="outline" size="sm">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-border flex items-center justify-center">
                {picturePreview || form.picture ? (
                  <Image
                    src={picturePreview || form.picture || ''}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              {isUploading && (
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
                  onChange={handlePictureChange}
                  disabled={isUploading}
                  className="hidden"
                />
                <span className="inline-flex items-center px-4 py-2 rounded-lg border border-border bg-background text-foreground hover:bg-accent transition-colors text-sm font-medium">
                  {isUploading ? 'Uploading...' : 'Upload Photo'}
                </span>
              </label>
              {(form.picture || picturePreview) && (
                <button
                  onClick={onDeletePicture}
                  disabled={isUploading}
                  className="text-sm text-red-500 hover:text-red-700 text-left"
                >
                  Remove Photo
                </button>
              )}
              <p className="text-xs text-muted-foreground">Max size: 5MB</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formFields.map((field) => (
              <div key={field.name} className={field.span === 2 ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={form[field.name as keyof UserProfile] || ''}
                  onChange={(e) => handleChange(e, field.name as keyof UserProfile)}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Bio</label>
              <textarea
                value={form.bio || ''}
                onChange={(e) => handleChange(e, 'bio')}
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
                value={form.summary || ''}
                onChange={(e) => handleChange(e, 'summary')}
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
            {[
              { label: 'Phone', value: profile?.phone },
              { label: 'Location', value: profile?.location },
              { label: 'LinkedIn', value: profile?.linkedin, link: true },
              { label: 'GitHub', value: profile?.github, link: true },
              { label: 'Website', value: profile?.website, link: true },
            ]
              .filter((item) => item.value)
              .map(({ label, value, link }) => (
                <div key={label}>
                  <span className="text-sm text-muted-foreground">{label}:</span>
                  {link ? (
                    <a
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-500 hover:underline block truncate"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="text-foreground">{value}</p>
                  )}
                </div>
              ))}
          </div>

          {[
            { label: 'Bio', value: profile?.bio },
            { label: 'About Me', value: profile?.summary },
          ]
            .filter((item) => item.value)
            .map(({ label, value }) => (
              <div key={label}>
                <span className="text-sm text-muted-foreground">{label}:</span>
                <p className="text-foreground mt-1">{value}</p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
