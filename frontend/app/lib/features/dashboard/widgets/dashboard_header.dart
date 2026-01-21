import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../auth/models/user_model.dart';
import '../../../core/theme/app_colors.dart';

class DashboardHeader extends StatelessWidget {
  final User? user;

  const DashboardHeader({super.key, this.user});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    // Fallbacks
    final name = user?.name ?? "Student";
    final email = user?.email ?? "";
    final initial = name.isNotEmpty ? name[0].toUpperCase() : "S";

    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      decoration: BoxDecoration(
        color: theme.cardTheme.color,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: colorScheme.outline.withValues(alpha: 0.5),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 24,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Row(
          children: [
            // Avatar Circle
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: colorScheme.primaryContainer,
                border: Border.all(
                  color: colorScheme.surface,
                  width: 3,
                ),
                boxShadow: [
                  BoxShadow(
                    color: colorScheme.primary.withValues(alpha: 0.2),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ],
                image: user?.picture != null
                    ? DecorationImage(
                        image: NetworkImage(user!.picture!),
                        fit: BoxFit.cover,
                      )
                    : null,
              ),
              alignment: Alignment.center,
              child: user?.picture == null
                  ? Text(
                      initial,
                      style: GoogleFonts.inter(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: colorScheme.primary,
                      ),
                    )
                  : null,
            ),
            const SizedBox(width: 20),

            // Text Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Welcome back,",
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      color: AppColors.neutral500,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.inter(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: colorScheme.onSurface,
                    ),
                  ),
                  if (email.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      email,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        color: colorScheme.onSurfaceVariant.withValues(
                          alpha: 0.8,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
