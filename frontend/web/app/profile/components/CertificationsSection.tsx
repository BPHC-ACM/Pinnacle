'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Certification } from './Types';
import { Plus, Pencil, Trash, ExternalLink } from 'lucide-react';

interface CertificationsSectionProps {
  certifications: Certification[];
  onSave: (id: string | null, data: Partial<Certification>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isSaving: boolean;
}

const initialFormState: Partial<Certification> = { name: '', issuer: '', date: undefined, url: '' };

const formatDateForInput = (date: Date | undefined | null): string => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

export function CertificationsSection({
  certifications,
  onSave,
  onDelete,
  isSaving,
}: CertificationsSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Certification>>(initialFormState);
  const [certToDelete, setCertToDelete] = useState<string | null>(null);

  const handleSave = async () => {
    await onSave(editingId, form);
    setEditingId(null);
    setIsAdding(false);
    setForm(initialFormState);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setForm(initialFormState);
  };

  const handleEdit = (cert: Certification) => {
    setEditingId(cert.id);
    setForm(cert);
    setIsAdding(false);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setForm(initialFormState);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof Certification) => {
    setForm((prev) => ({ ...prev, [fieldName]: e.target.value }));
  };

  const confirmDelete = () => {
    if (certToDelete) {
      onDelete(certToDelete);
      setCertToDelete(null);
    }
  };

  const showForm = isAdding || editingId !== null;

  return (
    <div className="space-y-6 relative">
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
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Certifications</h2>
        {!showForm && (
          <Button onClick={handleAdd} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" /> Add Certification
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {showForm && (
          <div className="p-6 rounded-xl border-2 border-primary-500/50 bg-card space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground ml-1">Certification Name</label>
                <input
                  value={form.name}
                  onChange={(e) => handleChange(e, 'name')}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground mt-1"
                  placeholder="e.g. AWS Certified Solutions Architect"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground ml-1">Issuer</label>
                <input
                  value={form.issuer}
                  onChange={(e) => handleChange(e, 'issuer')}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground mt-1"
                  placeholder="e.g. Amazon Web Services"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground ml-1">Issue Date</label>
                <input
                  type="date"
                  value={formatDateForInput(form.date)}
                  onChange={(e) => {
                    const dateValue = e.target.value ? new Date(e.target.value) : undefined;
                    setForm((prev) => ({ ...prev, date: dateValue }));
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground mt-1 appearance-none"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground ml-1">Credential URL</label>
                <input
                  value={form.url}
                  onChange={(e) => handleChange(e, 'url')}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground mt-1"
                  placeholder="https://verify.cert.com/id"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Certification'}
              </Button>
            </div>
          </div>
        )}

        {certifications.map(
          (cert) =>
            editingId !== cert.id && (
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
                            day: 'numeric',
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
                        <ExternalLink className="h-3 w-3" /> View Credential
                      </a>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(cert)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setCertToDelete(cert.id)}>
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ),
        )}
        {certifications.length === 0 && !showForm && (
          <p className="text-muted-foreground italic text-center py-8">
            Click &quot;Add Certification&quot; to list your achievements.
          </p>
        )}
      </div>
    </div>
  );
}
