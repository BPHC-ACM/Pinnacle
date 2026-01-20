import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/components/pinnacle_card.dart';

class QuickActionsBar extends StatelessWidget {
  final VoidCallback? onBuildResume;
  final VoidCallback? onViewJobs;
  final VoidCallback? onAddProject;

  const QuickActionsBar({
    super.key,
    this.onBuildResume,
    this.onViewJobs,
    this.onAddProject,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Row(
      children: [
        Expanded(
          child: _QuickActionButton(
            label: "Build Resume",
            icon: LucideIcons.fileText,
            color: colorScheme.primary,
            onTap: onBuildResume,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _QuickActionButton(
            label: "Explore Jobs",
            icon: LucideIcons.search,
            color: colorScheme.tertiary,
            onTap: onViewJobs,
          ),
        ),
      ],
    );
  }
}

class _QuickActionButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final VoidCallback? onTap;

  const _QuickActionButton({
    required this.label,
    required this.icon,
    required this.color,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return PinnacleCard(
      borderRadius: BorderRadius.circular(22),
      padding: EdgeInsets.zero,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(24),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: .1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: color, size: 24),
              ),
              const SizedBox(height: 12),
              Text(
                label,
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: theme.colorScheme.onSurface,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
