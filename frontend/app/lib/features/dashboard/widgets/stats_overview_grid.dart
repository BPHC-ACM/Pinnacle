import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../models/dashboard_stats_model.dart';

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
    final items = [
      _StatItem(
        label: 'Projects',
        count: stats.projects,
        icon: LucideIcons.folderGit2,
        section: 'projects',
      ),
      _StatItem(
        label: 'Skills',
        count: stats.skills,
        icon: LucideIcons.zap,
        section: 'skills',
      ),
      _StatItem(
        label: 'Experience',
        count: stats.experiences,
        icon: LucideIcons.briefcase,
        section: 'experience',
      ),
      _StatItem(
        label: 'Certificates',
        count: stats.certifications,
        icon: LucideIcons.award,
        section: 'certifications',
      ),
    ];

    return GridView.builder(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 1.6,
      ),
      itemCount: items.length,
      itemBuilder: (context, index) {
        return _StatCard(
          item: items[index],
          onTap: () => onCardTap?.call(items[index].section),
        );
      },
    );
  }
}

class _StatItem {
  final String label;
  final int count;
  final IconData icon;
  final String section;

  _StatItem({
    required this.label,
    required this.count,
    required this.icon,
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
    final colorScheme = theme.colorScheme;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: theme.scaffoldBackgroundColor,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: colorScheme.outline.withValues(alpha: 0.5),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    item.count.toString(),
                    style: GoogleFonts.inter(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: colorScheme.onSurface,
                    ),
                  ),
                  Icon(
                    item.icon,
                    size: 20,
                    color: colorScheme.onSurfaceVariant.withValues(alpha: 0.5),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                item.label,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
