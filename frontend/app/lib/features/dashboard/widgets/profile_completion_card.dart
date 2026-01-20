import 'package:flutter/material.dart';
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

    return PinnacleCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Profile Completion",
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                "${data.completionPercentage}%",
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: isComplete ? Colors.green : colorScheme.primary,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          LinearProgressIndicator(
            value: data.completionPercentage / 100,
            backgroundColor: colorScheme.surfaceContainerHighest,
            color: isComplete ? Colors.green : colorScheme.primary,
            borderRadius: BorderRadius.circular(4),
            minHeight: 8,
          ),
          const SizedBox(height: 16),
          if (!isComplete) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: colorScheme.surfaceContainer,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: colorScheme.outlineVariant.withValues(alpha: 0.5),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.info_outline,
                    size: 20,
                    color: colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      data.recommendations.isNotEmpty
                          ? data.recommendations
                          : "Complete your profile to stand out!",
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: onCompleteProfile,
                icon: const Icon(Icons.edit_note),
                label: const Text("Improve Profile"),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
          ] else
            Row(
              children: [
                const Icon(Icons.check_circle, color: Colors.green, size: 20),
                const SizedBox(width: 8),
                Text(
                  "Your profile is looking great!",
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.green[700],
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }
}
