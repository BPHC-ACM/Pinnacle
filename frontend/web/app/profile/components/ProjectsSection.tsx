'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Project } from './Types';
import { Plus, Pencil, Trash, ExternalLink, X } from 'lucide-react';

interface ProjectsSectionProps {
  projects: Project[];
  onSave: (id: string | null, data: Partial<Project>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isSaving: boolean;
}

const initialFormState: Partial<Project> = {
  title: '',
  description: '',
  domain: '',
  tools: [],
  outcomes: [],
  referenceUrl: '',
};

export function ProjectsSection({ projects, onSave, onDelete, isSaving }: ProjectsSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Project>>(initialFormState);

  const [toolInput, setToolInput] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const handleSave = async () => {
    const dataToSend = {
      ...form,
      referenceUrl: form.referenceUrl || undefined,
      tools: form.tools ?? [],
      outcomes: form.outcomes ?? [],
    };

    await onSave(editingId, dataToSend);

    setEditingId(null);
    setIsAdding(false);
    setForm(initialFormState);
    setToolInput('');
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setForm(initialFormState);
    setToolInput('');
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);

    setForm({
      ...project,
      tools: project.tools ?? [],
      outcomes: project.outcomes ?? [],
    });
    setIsAdding(false);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setForm(initialFormState);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    fieldName: keyof Project,
  ) => {
    setForm((prev) => ({ ...prev, [fieldName]: e.target.value }));
  };

  const handleOutcomesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const items = e.target.value.split('\n');

    setForm((prev) => ({ ...prev, outcomes: items }));
  };

  const handleToolKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && toolInput.trim()) {
      e.preventDefault();
      const newTool = toolInput.trim();
      if (!form.tools?.includes(newTool)) {
        setForm((prev) => ({
          ...prev,

          tools: [...(prev.tools ?? []), newTool],
        }));
      }
      setToolInput('');
    }
  };

  const handleRemoveTool = (toolToRemove: string) => {
    setForm((prev) => ({
      ...prev,

      tools: (prev.tools ?? []).filter((tool) => tool !== toolToRemove),
    }));
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      onDelete(projectToDelete);
      setProjectToDelete(null);
    }
  };

  const showForm = isAdding || editingId !== null;

  return (
    <div className="space-y-6 relative">
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border p-6 rounded-2xl max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-foreground mb-2">Delete Project?</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to remove this project? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setProjectToDelete(null)}>
                Cancel
              </Button>
              <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Projects</h2>
        {!showForm && (
          <Button onClick={handleAdd} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" /> Add Project
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {showForm && (
          <div className="p-6 rounded-xl border-2 border-primary-500/50 bg-card space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                value={form.title ?? ''}
                onChange={(e) => handleChange(e, 'title')}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                placeholder="Project Title"
              />

              <input
                value={form.domain ?? ''}
                onChange={(e) => handleChange(e, 'domain')}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                placeholder="Project Domain (e.g., Web Development)"
              />
            </div>

            <textarea
              value={form.description ?? ''}
              onChange={(e) => handleChange(e, 'description')}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground resize-none"
              placeholder="Project Description"
              rows={3}
            />
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                {(form.tools ?? []).map((tool) => (
                  <span
                    key={tool}
                    className="flex items-center gap-1.5 px-2 py-0.5 text-xs rounded-md bg-primary-500/10 text-primary-500 border border-primary-500/20"
                  >
                    {tool}

                    <button type="button" onClick={() => handleRemoveTool(tool)}>
                      <X className="h-3 w-3 text-primary-500/70 hover:text-primary-500" />
                    </button>
                  </span>
                ))}
              </div>

              <input
                value={toolInput}
                onChange={(e) => setToolInput(e.target.value)}
                onKeyDown={handleToolKeyDown}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                placeholder="Add tools/technologies and press Enter"
              />
            </div>

            <textarea
              value={(form.outcomes ?? []).join('\n')}
              onChange={handleOutcomesChange}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground resize-none"
              placeholder="Key Outcomes or Highlights (one per line)"
              rows={3}
            />

            <input
              value={form.referenceUrl ?? ''}
              onChange={(e) => handleChange(e, 'referenceUrl')}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
              placeholder="Live Demo or Repository URL"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Project'}
              </Button>
            </div>
          </div>
        )}

        {projects.map(
          (project) =>
            editingId !== project.id && (
              <div
                key={project.id}
                className="p-5 rounded-xl border border-border bg-card w-full hover:border-primary-500/30 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <h3 className="text-lg font-bold text-foreground">{project.title}</h3>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {(project.tools ?? []).map((tool, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-xs rounded-md bg-primary-500/10 text-primary-500 border border-primary-500/20"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>

                    {(project.outcomes ?? []).length > 0 && (
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pt-2">
                        {project.outcomes!.map(
                          (outcome, i) => outcome && <li key={i}>{outcome}</li>,
                        )}
                      </ul>
                    )}
                    <div className="flex gap-4 pt-2">
                      {project.referenceUrl && (
                        <a
                          href={project.referenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-500 flex items-center gap-1 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" /> View Project
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-4">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(project)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setProjectToDelete(project.id)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ),
        )}

        {projects.length === 0 && !showForm && (
          <p className="text-muted-foreground italic text-center py-8">
            Click &quot;Add Project&quot; to showcase your work.
          </p>
        )}
      </div>
    </div>
  );
}
