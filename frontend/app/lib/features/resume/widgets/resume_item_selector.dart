import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
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

    switch (sectionType) {
      case 'experience':
        return _buildList(
          items: previewData.experiences,
          selectedIds: resumeData.selectedExperiences,
          onToggle: notifier.toggleExperience,
          titleBuilder: (item) => '${item.position} at ${item.company}',
          subtitleBuilder: (item) => '${item.startDate} - ${item.endDate ?? "Present"}',
        );
      case 'education':
        return _buildList(
          items: previewData.education,
          selectedIds: resumeData.selectedEducation,
          onToggle: notifier.toggleEducation,
          titleBuilder: (item) => '${item.degree} - ${item.institution}',
          subtitleBuilder: (item) => item.branch,
        );
      case 'skills':
        return _buildList(
          items: previewData.skills,
          selectedIds: resumeData.selectedSkills,
          onToggle: notifier.toggleSkill,
          titleBuilder: (item) => item.category,
          subtitleBuilder: (item) => item.items.join(', '),
        );
      case 'projects':
        return _buildList(
          items: previewData.projects,
          selectedIds: resumeData.selectedProjects,
          onToggle: notifier.toggleProject,
          titleBuilder: (item) => item.title,
          subtitleBuilder: (item) => item.domain,
        );
      case 'certifications':
        return _buildList(
          items: previewData.certifications,
          selectedIds: resumeData.selectedCertifications,
          onToggle: notifier.toggleCertification,
          titleBuilder: (item) => item.name,
          subtitleBuilder: (item) => item.issuer,
        );
      case 'languages':
        return _buildList(
          items: previewData.languages,
          selectedIds: resumeData.selectedLanguages,
          onToggle: notifier.toggleLanguage,
          titleBuilder: (item) => item.name,
          subtitleBuilder: (item) => item.proficiency.toString(),
        );
      case 'profile':
        return const Padding(
          padding: EdgeInsets.all(16.0),
          child: Text(
            'Profile details are managed in your main profile settings.',
            style: TextStyle(fontStyle: FontStyle.italic, color: Colors.grey),
          ),
        );
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildList<T>({
    required List<T> items,
    required List<String> selectedIds,
    required Function(String) onToggle,
    required String Function(T) titleBuilder,
    String Function(T)? subtitleBuilder,
  }) {
    if (items.isEmpty) {
      return const Padding(
        padding: EdgeInsets.all(16.0),
        child: Text('No items found. Add them in your Profile.'),
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        // Assuming all models have an 'id' field via dynamic access or specific interface
        // Since we are using generics loosely here, we cast to dynamic to access .id
        final itemId = (item as dynamic).id;
        final isSelected = selectedIds.contains(itemId);

        return CheckboxListTile(
          value: isSelected,
          onChanged: (_) => onToggle(itemId),
          title: Text(titleBuilder(item)),
          subtitle: subtitleBuilder != null ? Text(subtitleBuilder(item)) : null,
          dense: true,
          controlAffinity: ListTileControlAffinity.leading,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 0),
        );
      },
    );
  }
}