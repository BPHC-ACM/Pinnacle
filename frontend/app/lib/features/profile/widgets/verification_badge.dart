import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
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
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(4),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: size, color: color),
            const SizedBox(width: 4),
            Text(
              status.name.substring(0, 1) +
                  status.name.substring(1).toLowerCase(),
              style: GoogleFonts.inter(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
