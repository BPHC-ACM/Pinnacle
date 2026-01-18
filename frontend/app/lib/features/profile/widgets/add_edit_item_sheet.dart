import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/components/pinnacle_button.dart';
import '../models/student_profile_model.dart';
import '../providers/profile_provider.dart';

enum ItemType { experience, education, project, skill, certification, language }

class AddEditItemSheet extends ConsumerStatefulWidget {
  final ItemType type;
  final Map<String, dynamic>? initialData; // If null, it's an "Add" action
  final String? itemId; // Required for "Edit"

  const AddEditItemSheet({
    super.key,
    required this.type,
    this.initialData,
    this.itemId,
  });

  @override
  ConsumerState<AddEditItemSheet> createState() => _AddEditItemSheetState();
}

class _AddEditItemSheetState extends ConsumerState<AddEditItemSheet> {
  final _formKey = GlobalKey<FormState>();
  final Map<String, dynamic> _formData = {};
  final Map<String, TextEditingController> _dateControllers = {};
  bool _isLoading = false;
  bool _isCurrent = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialData != null) {
      _formData.addAll(widget.initialData!);
      _isCurrent = _formData['current'] ?? false;
    }
  }

  @override
  void dispose() {
    for (var controller in _dateControllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  /// Helper to format date strings (ISO or other) into YYYY-MM
  String _formatDateValue(dynamic value) {
    if (value == null) return '';
    final str = value.toString();
    if (str.isEmpty) return '';
    try {
      final date = DateTime.parse(str);
      return "${date.year}-${date.month.toString().padLeft(2, '0')}";
    } catch (_) {
      return str;
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();

    setState(() => _isLoading = true);
    final notifier = ref.read(profileProvider.notifier);

    try {
      if (widget.itemId == null) {
        // Create
        switch (widget.type) {
          case ItemType.experience:
            await notifier.addExperience(_formData);
            break;
          case ItemType.education:
            await notifier.addEducation(_formData);
            break;
          case ItemType.project:
            await notifier.addProject(_formData);
            break;
          case ItemType.skill:
            await notifier.addSkill(_formData);
            break;
          case ItemType.certification:
            await notifier.addCertification(_formData);
            break;
          case ItemType.language:
            await notifier.addLanguage(_formData);
            break;
        }
      } else {
        // Update
        switch (widget.type) {
          case ItemType.experience:
            await notifier.editExperience(widget.itemId!, _formData);
            break;
          case ItemType.education:
            await notifier.editEducation(widget.itemId!, _formData);
            break;
          case ItemType.project:
            await notifier.editProject(widget.itemId!, _formData);
            break;
          case ItemType.skill:
            await notifier.editSkill(widget.itemId!, _formData);
            break;
          case ItemType.certification:
            await notifier.editCertification(widget.itemId!, _formData);
            break;
          case ItemType.language:
            await notifier.editLanguage(widget.itemId!, _formData);
            break;
        }
      }

      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isEdit = widget.itemId != null;
    final title = "${isEdit ? 'Edit' : 'Add'} ${_getTypeName()}";

    return Container(
      width: double.infinity,
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
        top: 12,
        left: 24,
        right: 24,
      ),
      decoration: BoxDecoration(
        color: theme.scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Drag Handle
              Center(
                child: Container(
                  width: 40,
                  height: 5,
                  margin: const EdgeInsets.only(bottom: 24),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.outline.withValues(alpha: 0.5),
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),

              Text(
                title,
                style: GoogleFonts.inter(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: theme.colorScheme.onSurface,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),

              ..._buildFields(context),

              const SizedBox(height: 32),
              SizedBox(
                height: 48,
                child: PinnacleButton(
                  label: isEdit ? "Save Changes" : "Add Item",
                  onPressed: _submit,
                  isLoading: _isLoading,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _getTypeName() {
    switch (widget.type) {
      case ItemType.experience:
        return "Experience";
      case ItemType.education:
        return "Education";
      case ItemType.project:
        return "Project";
      case ItemType.skill:
        return "Skill";
      case ItemType.certification:
        return "Certification";
      case ItemType.language:
        return "Language";
    }
  }

  List<Widget> _buildFields(BuildContext context) {
    switch (widget.type) {
      case ItemType.experience:
        return [
          _buildTextField("Position", "position", required: true),
          _buildTextField("Company", "company", required: true),
          _buildTextField("Location", "location", required: true),
          Row(
            children: [
              Expanded(
                child: _buildDateField(
                  "Start Date",
                  "startDate",
                  required: true,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildDateField(
                  "End Date",
                  "endDate",
                  enabled: !_isCurrent,
                ),
              ),
            ],
          ),
          _buildCheckbox("Currently working here", "current", (val) {
            setState(() => _isCurrent = val);
            _formData['current'] = val;
            if (val) {
              _formData['endDate'] = null;
              _dateControllers['endDate']?.clear();
            }
          }),
          _buildTextField("Description", "description", maxLines: 3),
          _buildTextField(
            "Highlights (One per line)",
            "highlights",
            maxLines: 3,
            isList: true,
          ),
        ];
      case ItemType.education:
        return [
          _buildTextField("Institution", "institution", required: true),
          _buildTextField("Degree", "degree", required: true),
          _buildTextField("Branch/Field", "branch", required: true),
          _buildTextField("Location", "location", required: true),
          Row(
            children: [
              Expanded(
                child: _buildDateField(
                  "Start Date",
                  "startDate",
                  required: true,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(child: _buildDateField("End Date", "endDate")),
            ],
          ),
          _buildTextField("GPA/Percentage", "gpa"),
          _buildTextField(
            "Achievements (One per line)",
            "achievements",
            maxLines: 3,
            isList: true,
          ),
        ];
      case ItemType.project:
        return [
          _buildTextField("Project Title", "title", required: true),
          _buildTextField("Domain", "domain", required: true),
          _buildTextField(
            "Tools (Comma separated)",
            "tools",
            isList: true,
            separator: ',',
          ),
          _buildTextField(
            "Description",
            "description",
            required: true,
            maxLines: 3,
          ),
          _buildTextField(
            "Outcomes (One per line)",
            "outcomes",
            maxLines: 3,
            isList: true,
          ),
          _buildTextField("Reference/Project URL", "referenceUrl"),
        ];
      case ItemType.skill:
        return [
          _buildTextField(
            "Category (e.g., Frontend)",
            "category",
            required: true,
          ),
          _buildTextField(
            "Skills (Comma separated)",
            "items",
            required: true,
            isList: true,
            separator: ',',
          ),
          _buildDropdown(
            "Proficiency",
            "proficiency",
            ProficiencyLevel.values.map((e) => e.name).toList(),
          ),
        ];
      case ItemType.certification:
        return [
          _buildTextField("Name", "name", required: true),
          _buildTextField("Issuer", "issuer", required: true),
          _buildDateField("Date", "date", required: true),
          _buildTextField("Credential URL", "url"),
        ];
      case ItemType.language:
        return [
          _buildTextField("Language", "name", required: true),
          _buildDropdown(
            "Proficiency",
            "proficiency",
            ProficiencyLevel.values.map((e) => e.name).toList(),
            required: true,
          ),
        ];
    }
  }

  Widget _buildTextField(
    String label,
    String key, {
    bool required = false,
    int maxLines = 1,
    bool isList = false,
    String separator = '\n',
  }) {
    String? initialValue;
    if (_formData[key] != null) {
      if (isList && _formData[key] is List) {
        initialValue = (_formData[key] as List).join(
          separator == '\n' ? '\n' : '$separator ',
        );
      } else {
        initialValue = _formData[key].toString();
      }
    }

    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 8),
          TextFormField(
            textCapitalization: TextCapitalization.sentences,
            initialValue: initialValue,
            maxLines: maxLines,
            style: GoogleFonts.inter(fontSize: 14),
            decoration: InputDecoration(
              filled: true,
              fillColor: theme.colorScheme.surface,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: theme.colorScheme.outline.withValues(alpha: 0.5),
                ),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: theme.colorScheme.outline.withValues(alpha: 0.5),
                ),
              ),
              contentPadding: const EdgeInsets.all(16),
            ),
            validator: required
                ? (v) => v?.isEmpty == true ? 'This field is required' : null
                : null,
            onSaved: (value) {
              if (value == null) return;
              if (isList) {
                _formData[key] = value
                    .split(separator)
                    .map((e) => e.trim())
                    .where((e) => e.isNotEmpty)
                    .toList();
              } else {
                _formData[key] = value.trim();
              }
            },
          ),
        ],
      ),
    );
  }

  Widget _buildDateField(
    String label,
    String key, {
    bool required = false,
    bool enabled = true,
  }) {
    // Lazily initialize controller with Formatted Date
    if (!_dateControllers.containsKey(key)) {
      _dateControllers[key] = TextEditingController(
        text: _formatDateValue(_formData[key]),
      );
    }
    final controller = _dateControllers[key]!;
    final theme = Theme.of(context);

    // Sync visual state
    if (!enabled) {
      controller.clear();
    } else if (_formData[key] != null && controller.text.isEmpty) {
      controller.text = _formatDateValue(_formData[key]);
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 8),
          TextFormField(
            textCapitalization: TextCapitalization.sentences,
            controller: controller,
            enabled: enabled,
            readOnly: true,
            style: GoogleFonts.inter(fontSize: 14),
            decoration: InputDecoration(
              filled: true,
              fillColor: theme.colorScheme.surface,
              hintText: "YYYY-MM",
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: theme.colorScheme.outline.withValues(alpha: 0.5),
                ),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: theme.colorScheme.outline.withValues(alpha: 0.5),
                ),
              ),
              contentPadding: const EdgeInsets.all(16),
              suffixIcon: Icon(
                LucideIcons.calendar,
                size: 18,
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            validator: required && enabled
                ? (v) => v?.isEmpty == true ? 'Required' : null
                : null,
            onTap: enabled
                ? () async {
                    DateTime initialDate = DateTime.now();
                    if (controller.text.isNotEmpty) {
                      try {
                        String dateText = controller.text;
                        if (dateText.length == 7) {
                          dateText += '-01';
                        }
                        initialDate = DateTime.parse(dateText);
                      } catch (_) {}
                    }

                    final picked = await showDatePicker(
                      context: context,
                      initialDate: initialDate,
                      firstDate: DateTime(1900),
                      lastDate: DateTime(2100),
                    );

                    if (picked != null) {
                      final formatted =
                          "${picked.year}-${picked.month.toString().padLeft(2, '0')}";
                      setState(() {
                        controller.text = formatted;
                        _formData[key] = formatted;
                      });
                    }
                  }
                : null,
            onSaved: (value) {
              if (enabled && value != null) _formData[key] = value;
            },
          ),
        ],
      ),
    );
  }

  Widget _buildDropdown(
    String label,
    String key,
    List<String> items, {
    bool required = false,
  }) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            initialValue: _formData[key]?.toString(),
            style: GoogleFonts.inter(
              fontSize: 14,
              color: theme.colorScheme.onSurface,
            ),
            decoration: InputDecoration(
              filled: true,
              fillColor: theme.colorScheme.surface,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: theme.colorScheme.outline.withValues(alpha: 0.5),
                ),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: theme.colorScheme.outline.withValues(alpha: 0.5),
                ),
              ),
              contentPadding: const EdgeInsets.all(16),
            ),
            items: items
                .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                .toList(),
            onChanged: (val) => setState(() => _formData[key] = val),
            validator: required ? (v) => v == null ? 'Required' : null : null,
            onSaved: (value) => _formData[key] = value,
          ),
        ],
      ),
    );
  }

  Widget _buildCheckbox(String label, String key, Function(bool) onChanged) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: CheckboxListTile(
        title: Text(label, style: GoogleFonts.inter(fontSize: 14)),
        value: _isCurrent,
        onChanged: (v) => onChanged(v ?? false),
        contentPadding: EdgeInsets.zero,
        controlAffinity: ListTileControlAffinity.leading,
        activeColor: Theme.of(context).primaryColor,
      ),
    );
  }
}
