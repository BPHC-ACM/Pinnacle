import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/theme/app_colors.dart';
import '../models/resume_model.dart';
import '../providers/resume_builder_provider.dart';
import 'resume_item_selector.dart';

class ResumeEditorTab extends ConsumerWidget {
  const ResumeEditorTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(resumeBuilderProvider);
    final notifier = ref.read(resumeBuilderProvider.notifier);
    final sections = state.resumeData.sections;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Resume Title
          _buildTitleInput(state.resumeTitle, notifier),
          const SizedBox(height: 24),

          // 2. Template Selection (Phase 5)
          Text(
            'Choose Template',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 90,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                _buildTemplateCard(
                  context,
                  id: 'modern',
                  name: 'Modern',
                  icon: LucideIcons.layoutTemplate,
                  isSelected: state.selectedTemplate == 'modern',
                  onTap: () => notifier.updateTemplate('modern'),
                ),
                _buildTemplateCard(
                  context,
                  id: 'classic',
                  name: 'Classic',
                  icon: LucideIcons.fileText,
                  isSelected: state.selectedTemplate == 'classic',
                  onTap: () => notifier.updateTemplate('classic'),
                ),
                _buildTemplateCard(
                  context,
                  id: 'minimal',
                  name: 'Minimal',
                  icon: LucideIcons.alignEndVertical,
                  isSelected: state.selectedTemplate == 'minimal',
                  onTap: () => notifier.updateTemplate('minimal'),
                ),
                _buildTemplateCard(
                  context,
                  id: 'professional',
                  name: 'Professional',
                  icon: LucideIcons.briefcase,
                  isSelected: state.selectedTemplate == 'professional',
                  onTap: () => notifier.updateTemplate('professional'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // 3. Sections Reordering
          Text(
            'Customize Sections',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Reorder sections and select what to include.',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: AppColors.neutral500,
            ),
          ),
          const SizedBox(height: 16),
          ReorderableListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: sections.length,
            onReorder: notifier.reorderSections,
            itemBuilder: (context, index) {
              final section = sections[index];
              return _buildSectionTile(
                context,
                section,
                state.previewData!,
                state.resumeData,
                notifier,
              );
            },
          ),
          const SizedBox(height: 100), // Padding for FAB
        ],
      ),
    );
  }

  Widget _buildTemplateCard(
    BuildContext context, {
    required String id,
    required String name,
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 80,
        margin: const EdgeInsets.only(right: 12),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary50.withValues(alpha: 0.5)
              : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary500 : AppColors.neutral200,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: isSelected ? AppColors.primary500 : AppColors.neutral500,
            ),
            const SizedBox(height: 8),
            Text(
              name,
              style: TextStyle(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: isSelected ? AppColors.primary500 : AppColors.neutral600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTitleInput(String currentTitle, ResumeBuilderNotifier notifier) {
    return TextFormField(
      initialValue: currentTitle,
      decoration: const InputDecoration(
        labelText: 'Resume Title',
        border: OutlineInputBorder(),
        hintText: 'e.g., Software Engineer Resume',
        prefixIcon: Icon(LucideIcons.type),
      ),
      onChanged: notifier.updateTitle,
    );
  }

  Widget _buildSectionTile(
    BuildContext context,
    ResumeSection section,
    ResumePreviewData previewData,
    ResumeData resumeData,
    ResumeBuilderNotifier notifier,
  ) {
    final showContent = section.enabled;

    return Card(
      key: ValueKey(section.id),
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: AppColors.neutral200),
      ),
      child: ExpansionTile(
        key: PageStorageKey(section.id),
        leading: const Icon(Icons.drag_handle, color: AppColors.neutral400),
        title: Text(
          section.type.toUpperCase(),
          style: const TextStyle(
            fontWeight: FontWeight.w600,
            letterSpacing: 0.5,
            fontSize: 14,
          ),
        ),
        trailing: Switch(
          value: section.enabled,
          onChanged: (_) => notifier.toggleSection(section.id),
          activeColor: AppColors.primary500,
        ),
        children: showContent
            ? [
                const Divider(height: 1),
                ResumeItemSelector(
                  sectionType: section.type,
                  previewData: previewData,
                  resumeData: resumeData,
                ),
              ]
            : [],
      ),
    );
  }
}
