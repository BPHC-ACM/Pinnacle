'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skill } from './Types';
import { Plus, Pencil, Trash } from 'lucide-react';

interface SkillsSectionProps {
  skills: Skill[];
  onSave: (id: string | null, data: Partial<Skill>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isSaving: boolean;
}

const initialFormState: Partial<Skill> = { category: '', items: [] };

export function SkillsSection({ skills, onSave, onDelete, isSaving }: SkillsSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Skill>>(initialFormState);
  const [skillToDelete, setSkillToDelete] = useState<string | null>(null);

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

  const handleEdit = (skill: Skill) => {
    setEditingId(skill.id);
    setForm({
      ...skill,
      items: skill.items || [],
    });
    setIsAdding(false);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setForm(initialFormState);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, category: e.target.value }));
  };

  const handleItemsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const items = e.target.value
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s);
    setForm((prev) => ({ ...prev, items }));
  };

  const handleDeleteClick = (id: string) => {
    setSkillToDelete(id);
  };

  const confirmDelete = () => {
    if (skillToDelete) {
      onDelete(skillToDelete);
      setSkillToDelete(null);
    }
  };

  const showForm = isAdding || editingId !== null;

  return (
    <div className="space-y-6 relative">
      {skillToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border p-6 rounded-2xl max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-foreground mb-2">Delete Category?</h3>
            <p className="text-muted-foreground mb-6">
              This action cannot be undone. Are you sure you want to remove this skill category?
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setSkillToDelete(null)}>
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
        <h2 className="text-xl font-semibold text-foreground">Skills</h2>
        {!showForm && (
          <Button onClick={handleAdd} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {showForm && (
          <div className="p-5 rounded-xl border-2 border-primary-500/50 bg-card space-y-4 w-full">
            <input
              autoFocus
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Category (e.g. Backend Development)"
              value={form.category || ''}
              onChange={handleCategoryChange}
            />
            <textarea
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Skills (comma separated: Node.js, Express, MongoDB)"
              rows={2}
              value={form.items?.join(', ') || ''}
              onChange={handleItemsChange}
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}

        {skills.map((skill) => (
          <div
            key={skill.id}
            className="p-5 rounded-xl border border-border bg-card w-full transition-all hover:border-primary-500/30"
          >
            {editingId === skill.id ? null : (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-foreground">{skill.category}</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-primary-500/10"
                      onClick={() => handleEdit(skill)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-red-500/10 text-red-500"
                      onClick={() => handleDeleteClick(skill.id)}
                    >
                      <Trash className="h-4 w-4" />
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
        {skills.length === 0 && !showForm && (
          <p className="text-muted-foreground italic text-center py-8">
            Click &quot;Add Category&quot; to list your technical skills.
          </p>
        )}
      </div>
    </div>
  );
}
