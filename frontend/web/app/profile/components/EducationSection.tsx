'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Education } from './Types';
import { Plus, Pencil, Trash, Check, X } from 'lucide-react';
import { DatePickerWithMonth } from '@/components/ui/date-picker-month';
import { Input } from '@/components/ui/input';
import { formatDateForDisplay, formatDateToYYYYMM } from './utils';

interface EducationSectionProps {
  education: Education[];
  onSave: (
    id: string | null,
    data: Omit<Partial<Education>, 'startDate' | 'endDate'> & {
      startDate?: string;
      endDate?: string;
    },
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isSaving: boolean;
}

export function EducationSection({ education, onSave, onDelete, isSaving }: EducationSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Education>>({});
  const [errors, setErrors] = useState<{ [key in keyof Education]?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key in keyof Education]?: string } = {};
    if (!form.institution?.trim()) newErrors.institution = 'Institution is required.';
    if (!form.degree?.trim()) newErrors.degree = 'Degree is required.';
    if (!form.branch?.trim()) newErrors.branch = 'Branch is required.';
    if (!form.startDate) newErrors.startDate = 'Start date is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const payload = {
      ...form,
      startDate: formatDateToYYYYMM(form.startDate),
      endDate: formatDateToYYYYMM(form.endDate),
    };

    await onSave(editingId, payload);

    setEditingId(null);
    setIsAdding(false);
    setForm({});
    setErrors({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setForm({});
    setErrors({});
  };

  const handleEdit = (edu: Education) => {
    setEditingId(edu.id);
    setForm(edu);
    setIsAdding(false);
    setErrors({});
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setForm({});
  };

  const handleChange = (fieldName: keyof Education, value: string | Date | undefined) => {
    setForm((prev) => ({ ...prev, [fieldName]: value }));
  };

  const showForm = isAdding || editingId !== null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Education</h2>
        {!showForm && (
          <Button onClick={handleAdd} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" /> Add Education
          </Button>
        )}
      </div>
      {showForm ? (
        <div className="p-4 rounded-xl border border-border bg-card/50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Institution *
              </label>
              <Input
                value={form.institution || ''}
                onChange={(e) => handleChange('institution', e.target.value)}
                className={errors.institution ? 'border-red-500' : ''}
              />
              {errors.institution && (
                <p className="text-red-500 text-xs mt-1">{errors.institution}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Degree *
              </label>
              <Input
                value={form.degree || ''}
                onChange={(e) => handleChange('degree', e.target.value)}
                className={errors.degree ? 'border-red-500' : ''}
              />
              {errors.degree && <p className="text-red-500 text-xs mt-1">{errors.degree}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Branch *
              </label>
              <Input
                value={form.branch || ''}
                onChange={(e) => handleChange('branch', e.target.value)}
                className={errors.branch ? 'border-red-500' : ''}
              />
              {errors.branch && <p className="text-red-500 text-xs mt-1">{errors.branch}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Start Date *
              </label>
              <DatePickerWithMonth
                value={form.startDate}
                onChange={(date) => handleChange('startDate', date)}
                className={errors.startDate ? 'border-red-500' : ''}
              />
              {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                End Date
              </label>
              <DatePickerWithMonth
                value={form.endDate}
                onChange={(date) => handleChange('endDate', date)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Location
              </label>
              <Input
                value={form.location || ''}
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Grade</label>
              <Input value={form.gpa || ''} onChange={(e) => handleChange('gpa', e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              onClick={handleSave}
              disabled={isSaving}
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
        </div>
      ) : (
        <div className="space-y-4">
          {education.map((edu: Education) => (
            <div
              key={edu.id}
              className="p-4 rounded-xl border border-border bg-card group relative"
            >
              <div className="absolute right-4 top-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                <Button onClick={() => handleEdit(edu)} variant="ghost" size="sm">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button onClick={() => onDelete(edu.id)} variant="ghost" size="sm">
                  <Trash className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              <div className="pr-20">
                <h3 className="text-lg font-bold text-foreground">
                  {edu.degree} in {edu.branch}
                </h3>
                <p className="text-primary-500 font-medium">{edu.institution}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDateForDisplay(edu.startDate)} — {formatDateForDisplay(edu.endDate)}
                  {edu.location && ` | ${edu.location}`}
                </p>
                {edu.gpa && (
                  <p className="text-sm font-medium text-foreground mt-2">Grade: {edu.gpa}</p>
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
}
