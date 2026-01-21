import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/components/pinnacle_card.dart';
import '../models/profile_completion_model.dart';

class ProfileCompletionCard extends StatelessWidget {
  final ProfileCompletionModel data;
  final VoidCallback? onCompleteProfile;

  const ProfileCompletionCard({
    super.key,
    required this.data,
    this.onCompleteProfile,
  });

  @override
  Widget build(BuildContext context) {
    final isComplete = data.completionPercentage >= 100;
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    return PinnacleCard(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Profile Strength",
                style: textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: isComplete
                      ? Colors.green.withValues(alpha: 0.1)
                      : colorScheme.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  "${data.completionPercentage}%",
                  style: textTheme.labelLarge?.copyWith(
                    color: isComplete ? Colors.green : colorScheme.primary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: data.completionPercentage / 100,
              backgroundColor: colorScheme.surfaceContainerHighest,
              color: isComplete ? Colors.green : colorScheme.primary,
              minHeight: 6,
            ),
          ),

          if (!isComplete) ...[
            const SizedBox(height: 12),
            Row(
              children: [
                Icon(
                  LucideIcons.sparkles,
                  size: 16,
                  color: colorScheme.tertiary,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    data.recommendations.isNotEmpty
                        ? "Tip: ${data.recommendations}"
                        : "Add more details to reach 100%",
                    style: textTheme.bodySmall?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 8),
                InkWell(
                  onTap: onCompleteProfile,
                  child: Text(
                    "Improve",
                    style: textTheme.labelLarge?.copyWith(
                      color: colorScheme.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
