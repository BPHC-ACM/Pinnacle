import 'dart:async';
import 'dart:typed_data';

import 'package:flutter_riverpod/legacy.dart';

import '../../../core/utils/logger.dart';
import '../models/resume_model.dart';
import '../services/resume_service.dart';
import '../utils/resume_generator.dart';

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------

class ResumeBuilderState {
  final bool isLoading;
  final bool isSaving;
  final bool isGenerating;
  final String? errorMessage;

  // Resume identity
  final String? resumeId;
  final String resumeTitle;
  final String selectedTemplate;

  // Immutable profile data (source of truth)
  final ResumePreviewData? previewData;

  // Mutable configuration
  final ResumeData resumeData;

  // Generated PDF preview
  final Uint8List? pdfBytes;

  const ResumeBuilderState({
    this.isLoading = true,
    this.isSaving = false,
    this.isGenerating = false,
    this.errorMessage,
    this.resumeId,
    this.resumeTitle = 'My Resume',
    this.selectedTemplate = 'modern',
    this.previewData,
    required this.resumeData,
    this.pdfBytes,
  });

  factory ResumeBuilderState.initial() {
    return ResumeBuilderState(
      resumeData: ResumeData.defaults(),
    );
  }

  ResumeBuilderState copyWith({
    bool? isLoading,
    bool? isSaving,
    bool? isGenerating,
    String? errorMessage,
    String? resumeId,
    String? resumeTitle,
    String? selectedTemplate,
    ResumePreviewData? previewData,
    ResumeData? resumeData,
    Uint8List? pdfBytes,
  }) {
    return ResumeBuilderState(
      isLoading: isLoading ?? this.isLoading,
      isSaving: isSaving ?? this.isSaving,
      isGenerating: isGenerating ?? this.isGenerating,
      errorMessage: errorMessage ?? this.errorMessage,
      resumeId: resumeId ?? this.resumeId,
      resumeTitle: resumeTitle ?? this.resumeTitle,
      selectedTemplate: selectedTemplate ?? this.selectedTemplate,
      previewData: previewData ?? this.previewData,
      resumeData: resumeData ?? this.resumeData,
      pdfBytes: pdfBytes ?? this.pdfBytes,
    );
  }
}

// -----------------------------------------------------------------------------
// Provider
// -----------------------------------------------------------------------------

final resumeBuilderProvider =
    StateNotifierProvider.autoDispose<
      ResumeBuilderNotifier,
      ResumeBuilderState
    >(
      (ref) => ResumeBuilderNotifier(ref.watch(resumeServiceProvider)),
    );

// -----------------------------------------------------------------------------
// Notifier
// -----------------------------------------------------------------------------

class ResumeBuilderNotifier extends StateNotifier<ResumeBuilderState> {
  final ResumeService _service;
  Timer? _debounceTimer;

  ResumeBuilderNotifier(this._service) : super(ResumeBuilderState.initial());

  Future<void> initialize({String? id}) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final previewData = await _service.getResumePreviewData();

      if (id != null) {
        // Edit mode
        final savedResume = await _service.getSavedResume(id);

        state = state.copyWith(
          isLoading: false,
          previewData: previewData,
          resumeId: savedResume.id,
          resumeTitle: savedResume.title,
          selectedTemplate: savedResume.template,
          resumeData: savedResume.data,
        );
      } else {
        // Create mode (preselect everything)
        final defaults = ResumeData.defaults();

        final prefilled = ResumeData(
          sections: defaults.sections,
          selectedExperiences: previewData.experiences
              .map((e) => e.id)
              .toList(),
          selectedEducation: previewData.education.map((e) => e.id).toList(),
          selectedSkills: previewData.skills.map((e) => e.id).toList(),
          selectedProjects: previewData.projects.map((e) => e.id).toList(),
          selectedCertifications: previewData.certifications
              .map((e) => e.id)
              .toList(),
          selectedLanguages: previewData.languages.map((e) => e.id).toList(),
          styling: defaults.styling,
        );

        state = state.copyWith(
          isLoading: false,
          previewData: previewData,
          resumeData: prefilled,
          resumeId: null,
          selectedTemplate: 'modern',
        );
      }

      // Generate initial preview immediately
      await _generatePreview();
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load resume data.',
      );
      logger.e('ResumeBuilder init error', error: e);
    }
  }

  void updateTitle(String newTitle) {
    state = state.copyWith(resumeTitle: newTitle);
    _triggerAutoSaveAndGenerate();
  }

  void updateTemplate(String templateId) {
    if (state.selectedTemplate == templateId) return;
    state = state.copyWith(selectedTemplate: templateId);
    _triggerAutoSaveAndGenerate();
  }

  void toggleSection(String sectionId) {
    final updated = state.resumeData.sections.map((section) {
      if (section.id == sectionId) {
        return ResumeSection(
          id: section.id,
          type: section.type,
          enabled: !section.enabled,
          order: section.order,
        );
      }
      return section;
    }).toList();

    _updateResumeData(sections: updated);
  }

  void reorderSections(int oldIndex, int newIndex) {
    if (oldIndex < newIndex) newIndex -= 1;

    final sections = List<ResumeSection>.from(state.resumeData.sections);
    final item = sections.removeAt(oldIndex);
    sections.insert(newIndex, item);

    final reordered = sections.asMap().entries.map((e) {
      return ResumeSection(
        id: e.value.id,
        type: e.value.type,
        enabled: e.value.enabled,
        order: e.key,
      );
    }).toList();

    _updateResumeData(sections: reordered);
  }

  void toggleExperience(String id) => _toggle(
    id,
    state.resumeData.selectedExperiences,
    (v) => _updateResumeData(selectedExperiences: v),
  );

  void toggleEducation(String id) => _toggle(
    id,
    state.resumeData.selectedEducation,
    (v) => _updateResumeData(selectedEducation: v),
  );

  void toggleSkill(String id) => _toggle(
    id,
    state.resumeData.selectedSkills,
    (v) => _updateResumeData(selectedSkills: v),
  );

  void toggleProject(String id) => _toggle(
    id,
    state.resumeData.selectedProjects,
    (v) => _updateResumeData(selectedProjects: v),
  );

  void toggleCertification(String id) => _toggle(
    id,
    state.resumeData.selectedCertifications,
    (v) => _updateResumeData(selectedCertifications: v),
  );

  void toggleLanguage(String id) => _toggle(
    id,
    state.resumeData.selectedLanguages,
    (v) => _updateResumeData(selectedLanguages: v),
  );

  void updateStyling(ResumeStyling styling) {
    _updateResumeData(styling: styling);
  }

  void _toggle(
    String id,
    List<String> source,
    void Function(List<String>) onUpdate,
  ) {
    final list = List<String>.from(source);
    list.contains(id) ? list.remove(id) : list.add(id);
    onUpdate(list);
  }

  void _updateResumeData({
    List<ResumeSection>? sections,
    List<String>? selectedExperiences,
    List<String>? selectedEducation,
    List<String>? selectedSkills,
    List<String>? selectedProjects,
    List<String>? selectedCertifications,
    List<String>? selectedLanguages,
    ResumeStyling? styling,
  }) {
    state = state.copyWith(
      resumeData: ResumeData(
        sections: sections ?? state.resumeData.sections,
        selectedExperiences:
            selectedExperiences ?? state.resumeData.selectedExperiences,
        selectedEducation:
            selectedEducation ?? state.resumeData.selectedEducation,
        selectedSkills: selectedSkills ?? state.resumeData.selectedSkills,
        selectedProjects: selectedProjects ?? state.resumeData.selectedProjects,
        selectedCertifications:
            selectedCertifications ?? state.resumeData.selectedCertifications,
        selectedLanguages:
            selectedLanguages ?? state.resumeData.selectedLanguages,
        styling: styling ?? state.resumeData.styling,
      ),
    );

    _triggerAutoSaveAndGenerate();
  }

  void _triggerAutoSaveAndGenerate() {
    _debounceTimer?.cancel();

    _debounceTimer = Timer(const Duration(milliseconds: 1000), () async {
      await _saveAndGenerate();
    });
  }

  Future<void> _saveAndGenerate() async {
    // Fire and forget save (don't await) so UI doesn't lag
    saveResume();
    // Generate preview locally immediately
    await _generatePreview();
  }

  Future<void> saveResume() async {
    if (state.isSaving) return;

    state = state.copyWith(isSaving: true);

    try {
      if (state.resumeId == null) {
        final request = CreateResumeRequest(
          title: state.resumeTitle,
          data: state.resumeData,
          template: state.selectedTemplate,
        );

        final saved = await _service.createSavedResume(request);
        state = state.copyWith(resumeId: saved.id);
      } else {
        final request = UpdateResumeRequest(
          title: state.resumeTitle,
          data: state.resumeData,
          template: state.selectedTemplate,
        );

        await _service.updateSavedResume(state.resumeId!, request);
      }
    } catch (e) {
      logger.e('Auto-save failed', error: e);
    } finally {
      state = state.copyWith(isSaving: false);
    }
  }

  Future<void> _generatePreview() async {
    if (state.isGenerating || state.previewData == null) return;

    state = state.copyWith(isGenerating: true);

    try {
      // Use local generator
      final bytes = await generateResumePdf(
        state.previewData!,
        state.resumeData,
      );
      state = state.copyWith(pdfBytes: bytes);
    } catch (e) {
      logger.e('Preview generation failed', error: e);
    } finally {
      state = state.copyWith(isGenerating: false);
    }
  }

  Future<void> forceGenerate() async {
    await _generatePreview();
  }
}
