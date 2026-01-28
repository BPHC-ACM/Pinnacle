'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Experience, Sector } from './Types';
import { Plus, Pencil, Trash, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePickerWithMonth } from '@/components/ui/date-picker-month';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDateForDisplay, formatDateToYYYYMM } from './utils';

// Mapping for user-friendly display names for the sector enum
const SECTOR_DISPLAY_NAMES: Record<Sector, string> = {
  [Sector.IT]: 'IT',
  [Sector.FINANCE]: 'Finance',
  [Sector.ECOMMERCE]: 'E-commerce',
  [Sector.HEALTHCARE]: 'Healthcare',
  [Sector.CONSULTING]: 'Consulting',
  [Sector.ANALYTICS]: 'Analytics',
  [Sector.EDUCATION]: 'Education',
  [Sector.ELECTRONICS]: 'Electronics',
  [Sector.MECHANICS]: 'Mechanics',
  [Sector.MANAGEMENT]: 'Management',
  [Sector.OTHERS]: 'Others',
};

interface ExperienceSectionProps {
  experiences: Experience[];
  onSave: (
    id: string | null,
    data: Omit<Partial<Experience>, 'startDate' | 'endDate'> & {
      startDate?: string;
      endDate?: string;
    },
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isSaving: boolean;
}

const initialFormState: Partial<Experience> = {
  company: '',
  position: '',
  location: '',
  startDate: undefined,
  endDate: undefined,
  current: false,
  description: '',
  highlights: [],
  sector: undefined, // Reinstate sector
};

export function ExperienceSection({
  experiences,
  onSave,
  onDelete,
  isSaving,
}: ExperienceSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Experience>>(initialFormState);
  const [errors, setErrors] = useState<{ [key in keyof Experience]?: string }>({});

  const showForm = isAdding || editingId !== null;

  const validateForm = (): boolean => {
    const newErrors: { [key in keyof Experience]?: string } = {};
    if (!form.company?.trim()) newErrors.company = 'Company is required.';
    if (!form.position?.trim()) newErrors.position = 'Position is required.';
    if (!form.startDate) newErrors.startDate = 'Start date is required.';
    if (!form.sector) newErrors.sector = 'Sector is required.'; // Reinstate sector validation

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleValueChange = (
    fieldName: keyof Experience,
    value: string | Date | boolean | undefined | Sector,
  ) => {
    setForm((prev) => {
      const newForm = { ...prev, [fieldName]: value };
      if (fieldName === 'current' && value) {
        newForm.endDate = undefined;
      }
      return newForm;
    });
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const payload = {
      ...form,
      startDate: formatDateToYYYYMM(form.startDate),
      endDate: form.current ? undefined : formatDateToYYYYMM(form.endDate),
      highlights: form.highlights ?? [],
    };

    await onSave(editingId, payload);
    setEditingId(null);
    setIsAdding(false);
    setForm(initialFormState);
    setErrors({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setForm(initialFormState);
    setErrors({});
  };

  const handleEdit = (exp: Experience) => {
    setEditingId(exp.id);
    setForm({ ...exp, highlights: exp.highlights ?? [] });
    setIsAdding(false);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setForm(initialFormState);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Work Experience</h2>
        {!showForm && (
          <Button onClick={handleAdd} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" /> Add Experience
          </Button>
        )}
      </div>

      {showForm ? (
        <div className="p-4 rounded-xl border border-border bg-card/50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Company *
              </label>
              <Input
                value={form.company || ''}
                onChange={(e) => handleValueChange('company', e.target.value)}
                className={errors.company ? 'border-red-500' : ''}
              />
              {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Position *
              </label>
              <Input
                value={form.position || ''}
                onChange={(e) => handleValueChange('position', e.target.value)}
                className={errors.position ? 'border-red-500' : ''}
              />
              {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Location
              </label>
              <Input
                value={form.location || ''}
                onChange={(e) => handleValueChange('location', e.target.value)}
              />
            </div>
            {/* REINSTATED: Sector Dropdown */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Sector *
              </label>
              <Select
                value={form.sector}
                onValueChange={(value: Sector) => handleValueChange('sector', value)}
              >
                <SelectTrigger className={errors.sector ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select a sector" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Sector).map((sectorValue) => (
                    <SelectItem key={sectorValue} value={sectorValue}>
                      {SECTOR_DISPLAY_NAMES[sectorValue] || sectorValue}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.sector && <p className="text-red-500 text-xs mt-1">{errors.sector}</p>}
            </div>
            <div className="md:col-span-1"></div> {/* Empty div for alignment */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Start Date *
              </label>
              <DatePickerWithMonth
                value={form.startDate}
                onChange={(date) => handleValueChange('startDate', date)}
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
                onChange={(date) => handleValueChange('endDate', date)}
                disabled={!!form.current}
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-2 pt-2">
              <Checkbox
                id="currentJob"
                checked={!!form.current}
                onCheckedChange={(checked) => handleValueChange('current', !!checked)}
              />
              <label
                htmlFor="currentJob"
                className="text-sm font-medium text-muted-foreground leading-none"
              >
                I currently work here
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Summary
              </label>
              <Textarea
                value={form.description || ''}
                onChange={(e) => handleValueChange('description', e.target.value)}
                placeholder="A brief summary of your role."
                rows={3}
              />
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
          {experiences.map((exp: Experience) => (
            <div
              key={exp.id}
              className="p-5 rounded-xl border border-border bg-card group relative hover:border-primary-500/50 transition-colors"
            >
              <div className="absolute right-4 top-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(exp)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(exp.id)}>
                  <Trash className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              <div className="space-y-1 pr-16">
                <h3 className="text-lg font-bold text-foreground">{exp.position}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-primary-500 font-medium">{exp.company}</p>
                  {/* REINSTATED: Display the sector as a badge */}
                  {exp.sector && (
                    <span className="px-2 py-0.5 text-xs rounded-md bg-secondary text-secondary-foreground border">
                      {SECTOR_DISPLAY_NAMES[exp.sector] || exp.sector}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDateForDisplay(exp.startDate)} —{' '}
                  {exp.current ? 'Present' : formatDateForDisplay(exp.endDate)}
                  {exp.location && ` | ${exp.location}`}
                </p>
                {exp.description && (
                  <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                    {exp.description}
                  </p>
                )}
                {(exp.highlights ?? []).length > 0 && (
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pt-2">
                    {exp.highlights.map(
                      (highlight, i) => highlight && <li key={i}>{highlight}</li>,
                    )}
                  </ul>
                )}
              </div>
            </div>
          ))}
          {experiences.length === 0 && (
            <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl border-border">
              <p>No work experience added yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
