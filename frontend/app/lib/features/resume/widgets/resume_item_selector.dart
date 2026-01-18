import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../models/resume_model.dart';
import '../providers/resume_builder_provider.dart';

class ResumeItemSelector extends ConsumerWidget {
  final String sectionType;
  final ResumePreviewData previewData;
  final ResumeData resumeData;

  const ResumeItemSelector({
    super.key,
    required this.sectionType,
    required this.previewData,
    required this.resumeData,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifier = ref.read(resumeBuilderProvider.notifier);
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    switch (sectionType) {
      case 'experience':
        return _buildList(
          context: context,
          items: previewData.experiences,
          selectedIds: resumeData.selectedExperiences,
          onToggle: notifier.toggleExperience,
          titleBuilder: (item) => '${item.position} at ${item.company}',
          subtitleBuilder: (item) =>
              '${item.startDate} - ${item.endDate ?? "Present"}',
        );

      case 'education':
        return _buildList(
          context: context,
          items: previewData.education,
          selectedIds: resumeData.selectedEducation,
          onToggle: notifier.toggleEducation,
          titleBuilder: (item) => '${item.degree} - ${item.institution}',
          subtitleBuilder: (item) => item.branch,
        );

      case 'skills':
        return _buildList(
          context: context,
          items: previewData.skills,
          selectedIds: resumeData.selectedSkills,
          onToggle: notifier.toggleSkill,
          titleBuilder: (item) => item.category,
          subtitleBuilder: (item) => item.items.join(', '),
        );

      case 'projects':
        return _buildList(
          context: context,
          items: previewData.projects,
          selectedIds: resumeData.selectedProjects,
          onToggle: notifier.toggleProject,
          titleBuilder: (item) => item.title,
          subtitleBuilder: (item) => item.domain,
        );

      case 'certifications':
        return _buildList(
          context: context,
          items: previewData.certifications,
          selectedIds: resumeData.selectedCertifications,
          onToggle: notifier.toggleCertification,
          titleBuilder: (item) => item.name,
          subtitleBuilder: (item) => item.issuer,
        );

      case 'languages':
        return _buildList(
          context: context,
          items: previewData.languages,
          selectedIds: resumeData.selectedLanguages,
          onToggle: notifier.toggleLanguage,
          titleBuilder: (item) => item.name,
          subtitleBuilder: (item) =>
              item.proficiency.toString().split('.').last,
        );

      case 'profile':
        return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Text(
            'Profile details are managed in your main profile settings.',
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              fontStyle: FontStyle.italic,
              fontSize: 13,
              color: colorScheme.onSurfaceVariant,
            ),
          ),
        );

      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildList<T>({
    required BuildContext context,
    required List<T> items,
    required List<String> selectedIds,
    required Function(String) onToggle,
    required String Function(T) titleBuilder,
    String Function(T)? subtitleBuilder,
  }) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    if (items.isEmpty) {
      return Padding(
        padding: const EdgeInsets.all(24.0),
        child: Center(
          child: Text(
            'No items found. Add them in your Profile.',
            style: GoogleFonts.inter(
              fontSize: 13,
              color: colorScheme.onSurfaceVariant,
            ),
          ),
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        children: items.map((item) {
          final itemId = (item as dynamic).id;
          final isSelected = selectedIds.contains(itemId);

          return CheckboxListTile(
            value: isSelected,
            onChanged: (_) => onToggle(itemId),
            activeColor: colorScheme.primary,
            checkboxShape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(4),
            ),
            title: Text(
              titleBuilder(item),
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: colorScheme.onSurface,
              ),
            ),
            subtitle: subtitleBuilder != null
                ? Text(
                    subtitleBuilder(item),
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: colorScheme.onSurfaceVariant,
                    ),
                  )
                : null,
            dense: true,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 4,
            ),
          );
        }).toList(),
      ),
    );
  }
}
