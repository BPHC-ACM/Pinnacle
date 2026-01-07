import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../../core/theme/app_colors.dart';
import '../models/student_profile_model.dart';

class VerificationBadge extends StatelessWidget {
  final VerificationStatus status;
  final double size;

  const VerificationBadge({
    super.key,
    required this.status,
    this.size = 16,
  });

  @override
  Widget build(BuildContext context) {
    Color color;
    IconData icon;
    String tooltip;

    switch (status) {
      case VerificationStatus.APPROVED:
        color = AppColors.success;
        icon = LucideIcons.badgeCheck;
        tooltip = "Verified";
        break;
      case VerificationStatus.REJECTED:
        color = AppColors.error;
        icon = Icons.warning_amber_rounded;
        tooltip = "Rejected";
        break;
      case VerificationStatus.PENDING:
        color = Colors.orange;
        icon = LucideIcons.clock;
        tooltip = "Verification Pending";
        break;
    }

    return Tooltip(
      message: tooltip,
      triggerMode: TooltipTriggerMode.tap,
      child: Column(
        children: [
          SizedBox(height: 4),
          Icon(
            icon,
            size: size,
            color: color,
          ),
        ],
      ),
    );
  }
}
