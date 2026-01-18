'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Language } from './Types';
import { Plus, Pencil, Trash } from 'lucide-react';

interface LanguagesSectionProps {
  languages: Language[];
  onSave: (id: string | null, data: Partial<Language>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isSaving: boolean;
}

const initialFormState: Partial<Language> = { name: '', proficiency: undefined };

export function LanguagesSection({ languages, onSave, onDelete, isSaving }: LanguagesSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Language>>(initialFormState);
  const [langToDelete, setLangToDelete] = useState<string | null>(null);
  const proficiencyError =
    form.proficiency && /[a-z]/.test(form.proficiency) ? 'Must be ALL CAPS' : null;

  const handleSave = async () => {
    if (proficiencyError) return;
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

  const handleEdit = (lang: Language) => {
    setEditingId(lang.id);
    setForm(lang);
    setIsAdding(false);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setForm(initialFormState);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof Language) => {
    setForm((prev) => ({ ...prev, [fieldName]: e.target.value }));
  };

  const confirmDelete = () => {
    if (langToDelete) {
      onDelete(langToDelete);
      setLangToDelete(null);
    }
  };

  const showForm = isAdding || editingId !== null;

  return (
    <div className="space-y-6 relative">
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
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Languages</h2>
        {!showForm && (
          <Button onClick={handleAdd} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" /> Add Language
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {showForm && (
          <div className="p-6 rounded-xl border-2 border-primary-500/50 bg-card space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground ml-1 font-bold">
                  Language Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => handleChange(e, 'name')}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground mt-1 focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="e.g. English"
                />
              </div>
              <div>
                <label
                  className={`text-xs ml-1 font-bold ${proficiencyError ? 'text-red-500' : 'text-muted-foreground'}`}
                >
                  Proficiency Level (ALL CAPS REQUIRED)
                </label>
                <input
                  value={form.proficiency || ''}
                  onChange={(e) => handleChange(e, 'proficiency')}
                  className={`w-full px-4 py-2 rounded-lg border bg-background text-foreground mt-1 focus:ring-2 outline-none transition-all ${proficiencyError ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary-500'}`}
                  placeholder="E.g. BEGINNER, EXPERT"
                />
                {proficiencyError && (
                  <p className="text-[11px] text-red-500 mt-1 ml-1 font-semibold">
                    ⚠️ {proficiencyError}: Please remove lowercase letters.
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !!proficiencyError}
                className={proficiencyError ? 'opacity-50 cursor-not-allowed' : ''}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        )}

        {languages.map(
          (lang) =>
            editingId !== lang.id && (
              <div
                key={lang.id}
                className="p-5 rounded-xl border border-border bg-card w-full hover:border-primary-500/30 transition-all flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-bold text-foreground">{lang.name}</h3>
                  <p className="text-sm text-primary-500 font-bold">{lang.proficiency}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(lang)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setLangToDelete(lang.id)}>
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ),
        )}
        {languages.length === 0 && !showForm && (
          <p className="text-muted-foreground italic text-center py-8">
            Click &quot;Add Language&quot; to list the languages you speak.
          </p>
        )}
      </div>
    </div>
  );
}
