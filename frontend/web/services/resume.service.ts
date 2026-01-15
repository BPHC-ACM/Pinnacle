import { api } from '@/lib/api-client';
import type {
  SavedResume,
  CreateResumeRequest,
  UpdateResumeRequest,
  ResumePreviewData,
  TemplateInfo,
  ResumeFileMetadata,
} from '@/types/resume.types';

/**
 * Get all user data for resume preview (JSON format)
 */
export async function getResumePreviewData(): Promise<ResumePreviewData> {
  const response = await api.get<ResumePreviewData>('/resume/preview');
  return response.data;
}

/**
 * Get available resume templates
 */
export async function getTemplates(): Promise<TemplateInfo[]> {
  const response = await api.get<TemplateInfo[]>('/resume/templates');
  return response.data;
}

/**
 * Get all saved resumes for the authenticated user
 */
export async function getSavedResumes(): Promise<SavedResume[]> {
  const response = await api.get<{ data: SavedResume[] }>('/resume/saved');
  return response.data.data;
}

/**
 * Get a specific saved resume by ID
 */
export async function getSavedResume(id: string): Promise<SavedResume> {
  const response = await api.get<SavedResume>(`/resume/saved/${id}`);
  return response.data;
}

/**
 * Create a new saved resume
 */
export async function createSavedResume(data: CreateResumeRequest): Promise<SavedResume> {
  const response = await api.post<SavedResume>('/resume/saved', data);
  return response.data;
}

/**
 * Update a saved resume
 */
export async function updateSavedResume(
  id: string,
  data: UpdateResumeRequest
): Promise<SavedResume> {
  const response = await api.patch<SavedResume>(`/resume/saved/${id}`, data);
  return response.data;
}

/**
 * Delete a saved resume (soft delete)
 */
export async function deleteSavedResume(id: string): Promise<void> {
  await api.delete(`/resume/saved/${id}`);
}

/**
 * Generate and download a PDF resume
 * Opens the PDF in a new window/tab
 */
export async function generateAndDownloadResume(): Promise<void> {
  const response = await api.post('/resume/generate', {}, { responseType: 'blob' });

  // Create a blob URL and trigger download
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `resume-${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Get download URL for a stored resume PDF
 */
export async function getResumeDownloadUrl(resumeId: string): Promise<{ url: string }> {
  const response = await api.get<{ url: string }>(`/resume/download/${resumeId}`);
  return response.data;
}

/**
 * Get metadata about stored resume PDF file
 */
export async function getResumeFileInfo(resumeId: string): Promise<ResumeFileMetadata> {
  const response = await api.get<ResumeFileMetadata>(`/resume/file-info/${resumeId}`);
  return response.data;
}

/**
 * Delete stored resume PDF file from storage
 */
export async function deleteResumeFile(resumeId: string): Promise<void> {
  await api.delete(`/resume/file/${resumeId}`);
}

/**
 * Download resume PDF with a given resumeId
 */
export async function downloadResumePdf(resumeId: string): Promise<void> {
  const { url } = await getResumeDownloadUrl(resumeId);
  window.open(url, '_blank');
}
