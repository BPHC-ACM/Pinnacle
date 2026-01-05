import 'package:flutter/material.dart';
// import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../models/job_filter_model.dart';

class JobsFilterDialog extends StatefulWidget {
  final JobFilterModel currentFilters;
  final Function(JobFilterModel) onApply;
  final VoidCallback onClear;

  const JobsFilterDialog({
    super.key,
    required this.currentFilters,
    required this.onApply,
    required this.onClear,
  });

  @override
  State<JobsFilterDialog> createState() => _JobsFilterDialogState();
}

class _JobsFilterDialogState extends State<JobsFilterDialog> {
  late JobFilterModel _filters;

  @override
  void initState() {
    super.initState();
    _filters = widget.currentFilters;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          /// Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Filter Jobs",
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: Icon(LucideIcons.x, color: colorScheme.onSurface),
              ),
            ],
          ),
          const SizedBox(height: 24),

          /// Job Sector
          _buildDropdown(
            label: "Job Sector",
            value: _filters.sector,
            items: const [
              "All Sectors",
              "Technology",
              "Finance",
              "Healthcare",
              "Marketing",
            ],
            onChanged: (val) =>
                setState(() => _filters = _filters.copyWith(sector: val)),
          ),
          const SizedBox(height: 16),

          /// Position Type
          _buildDropdown(
            label: "Position Type",
            value: _filters.positionType,
            items: const ["All", "Internship", "Full-time", "Part-time"],
            onChanged: (val) =>
                setState(() => _filters = _filters.copyWith(positionType: val)),
          ),
          const SizedBox(height: 16),

          /// Application Status
          _buildDropdown(
            label: "Status",
            value: _filters.applicationStatus,
            items: const [
              "All",
              "Yet to apply",
              "Applied",
              "Under Review",
              "Accepted",
              "Rejected",
            ],
            onChanged: (val) => setState(
              () => _filters = _filters.copyWith(applicationStatus: val),
            ),
          ),
          const SizedBox(height: 16),

          /// Sort By
          _buildDropdown(
            label: "Sort by",
            value: _filters.sortBy,
            items: const ["Newest", "Oldest", "Deadline"],
            onChanged: (val) =>
                setState(() => _filters = _filters.copyWith(sortBy: val)),
          ),
          const SizedBox(height: 32),

          /// Actions
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    widget.onClear();
                    Navigator.pop(context);
                  },
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    side: BorderSide(color: colorScheme.outline),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Text(
                    "Clear All",
                    style: theme.textTheme.labelLarge?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: ElevatedButton(
                  onPressed: () {
                    widget.onApply(_filters);
                    Navigator.pop(context);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: colorScheme.primary,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
                  ),
                  child: Text(
                    "Apply Filters",
                    style: theme.textTheme.labelLarge?.copyWith(
                      color: colorScheme.onPrimary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 120),
        ],
      ),
    );
  }

  Widget _buildDropdown({
    required String label,
    required String value,
    required List<String> items,
    required Function(String?) onChanged,
  }) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: theme.textTheme.labelMedium?.copyWith(
            color: colorScheme.onSurfaceVariant,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: items.contains(value) ? value : items.first,
          decoration: InputDecoration(
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 12,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: colorScheme.outline),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: colorScheme.outline),
            ),
          ),
          icon: Icon(
            LucideIcons.chevronDown,
            size: 20,
            color: colorScheme.onSurfaceVariant,
          ),
          items: items.map((item) {
            return DropdownMenuItem(
              value: item,
              child: Text(item, style: theme.textTheme.bodyMedium),
            );
          }).toList(),
          onChanged: onChanged,
        ),
      ],
    );
  }
}
