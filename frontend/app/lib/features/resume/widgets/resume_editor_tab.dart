import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

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
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Resume Title",
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 8),
          _buildTitleInput(context, state.resumeTitle, notifier),
          const SizedBox(height: 32),

          Text(
            'Choose Template',
            style: GoogleFonts.inter(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 110,
            child: ListView(
              scrollDirection: Axis.horizontal,
              clipBehavior: Clip.none,
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
                  name: 'Pro',
                  icon: LucideIcons.briefcase,
                  isSelected: state.selectedTemplate == 'professional',
                  onTap: () => notifier.updateTemplate('professional'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),

          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Customize Sections',
                      style: GoogleFonts.inter(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                        color: colorScheme.onSurface,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Reorder and select content.',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          ReorderableListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: sections.length,
            onReorder: notifier.reorderSections,
            proxyDecorator: (child, index, animation) {
              return Material(
                color: Colors.transparent,
                elevation: 4,
                child: child,
              );
            },
            itemBuilder: (context, index) {
              final section = sections[index];
              return Padding(
                key: ValueKey(section.id),
                padding: const EdgeInsets.only(bottom: 16),
                child: _buildSectionTile(
                  context,
                  section,
                  state.previewData!,
                  state.resumeData,
                  notifier,
                ),
              );
            },
          ),
          const SizedBox(height: 80),
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
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: 90,
        margin: const EdgeInsets.only(right: 16),
        decoration: BoxDecoration(
          color: isSelected
              ? colorScheme.primaryContainer.withValues(alpha: 0.5)
              : theme.cardTheme.color,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected
                ? colorScheme.primary
                : colorScheme.outline.withValues(alpha: 0.5),
            width: isSelected ? 2 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: isSelected
                    ? colorScheme.primary
                    : theme.scaffoldBackgroundColor,
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                size: 20,
                color: isSelected
                    ? colorScheme.onPrimary
                    : colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              name,
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                color: isSelected ? colorScheme.primary : colorScheme.onSurface,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTitleInput(
    BuildContext context,
    String currentTitle,
    ResumeBuilderNotifier notifier,
  ) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return TextFormField(
      initialValue: currentTitle,
      style: GoogleFonts.inter(fontSize: 14),
      decoration: InputDecoration(
        filled: true,
        fillColor: colorScheme.surface,
        hintText: 'e.g., Software Engineer Resume',
        prefixIcon: Icon(
          LucideIcons.type,
          size: 18,
          color: colorScheme.onSurfaceVariant,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: colorScheme.outline.withValues(alpha: 0.5),
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: colorScheme.outline.withValues(alpha: 0.5),
          ),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 14,
        ),
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
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Container(
      decoration: BoxDecoration(
        color: theme.cardTheme.color,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: colorScheme.outline.withValues(alpha: 0.5),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ExpansionTile(
        key: PageStorageKey(section.id),
        shape: const Border(),
        tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: theme.scaffoldBackgroundColor,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            Icons.drag_handle,
            color: colorScheme.onSurfaceVariant,
            size: 18,
          ),
        ),
        title: Text(
          section.type.toUpperCase(),
          style: GoogleFonts.inter(
            fontWeight: FontWeight.w600,
            fontSize: 13,
            letterSpacing: 0.5,
            color: colorScheme.onSurface,
          ),
        ),
        trailing: Switch(
          value: section.enabled,
          onChanged: (_) => notifier.toggleSection(section.id),
          activeColor: colorScheme.primary,
        ),
        children: showContent
            ? [
                Divider(
                  height: 1,
                  color: colorScheme.outline.withValues(alpha: 0.5),
                ),
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
