import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/components/pinnacle_card.dart';
import '../models/dashboard_stats_model.dart';
import 'animated_counter.dart';

class StatsOverviewGrid extends StatelessWidget {
  final DashboardStatsModel stats;
  final Function(String section)? onCardTap;

  const StatsOverviewGrid({
    super.key,
    required this.stats,
    this.onCardTap,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    final items = [
      _StatItem(
        label: 'Projects',
        count: stats.projects,
        icon: LucideIcons.folderGit2,
        color: colorScheme.primary,
        section: 'projects',
      ),
      _StatItem(
        label: 'Skills',
        count: stats.skills,
        icon: LucideIcons.zap,
        color: colorScheme.tertiary,
        section: 'skills',
      ),
      _StatItem(
        label: 'Experience',
        count: stats.experiences,
        icon: LucideIcons.briefcase,
        color: colorScheme.primary,
        section: 'experience',
      ),
      _StatItem(
        label: 'Education',
        count: stats.education,
        icon: LucideIcons.graduationCap,
        color: colorScheme.tertiary,
        section: 'education',
      ),
      _StatItem(
        label: 'Certs',
        count: stats.certifications,
        icon: LucideIcons.award,
        color: colorScheme.primary,
        section: 'certifications',
      ),
      _StatItem(
        label: 'Languages',
        count: stats.languages,
        icon: LucideIcons.languages,
        color: colorScheme.tertiary,
        section: 'languages',
      ),
    ];

    return GridView.builder(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
        childAspectRatio: 1.5,
      ),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        return _StatCard(
          item: item,
          onTap: () => onCardTap?.call(item.section),
        );
      },
    );
  }
}

class _StatItem {
  final String label;
  final int count;
  final IconData icon;
  final Color color;
  final String section;

  _StatItem({
    required this.label,
    required this.count,
    required this.icon,
    required this.color,
    required this.section,
  });
}

class _StatCard extends StatelessWidget {
  final _StatItem item;
  final VoidCallback onTap;

  const _StatCard({required this.item, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return GestureDetector(
      onTap: onTap,
      child: PinnacleCard(
        padding: EdgeInsets.zero,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: item.color.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(item.icon, color: item.color, size: 20),
                  ),
                  AnimatedCounter(
                    value: item.count,
                    style: theme.textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                ],
              ),
              Text(
                item.label,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
