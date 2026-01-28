import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../models/notification_model.dart';

class NotificationTile extends StatelessWidget {
  final NotificationModel notification;
  final VoidCallback onTap;

  const NotificationTile({
    super.key,
    required this.notification,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colors = theme.colorScheme;
    final isUnread = !notification.isRead;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: Material(
        color: isUnread
            ? colors.primaryContainer.withValues(alpha: 0.35)
            : colors.surface,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Icon
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: isUnread ? colors.primary : colors.surfaceBright,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    _getIconForType(notification.type),
                    size: 18,
                    color: isUnread
                        ? colors.onPrimary
                        : colors.onSurfaceVariant,
                  ),
                ),
                const SizedBox(width: 16),

                // Text
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              notification.title,
                              style: GoogleFonts.inter(
                                fontSize: 15,
                                fontWeight: isUnread
                                    ? FontWeight.w700
                                    : FontWeight.w600,
                                color: colors.onSurface,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            _formatTime(notification.createdAt),
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              color: isUnread
                                  ? colors.primary
                                  : colors.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        notification.message,
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          height: 1.4,
                          color: isUnread
                              ? colors.onSurface
                              : colors.onSurfaceVariant,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),

                if (isUnread) ...[
                  const SizedBox(width: 12),
                  Container(
                    margin: const EdgeInsets.only(top: 6),
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: colors.primary,
                      shape: BoxShape.circle,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  IconData _getIconForType(String type) {
    switch (type.toLowerCase()) {
      case 'alert':
        return LucideIcons.triangleAlert;
      case 'success':
        return LucideIcons.circleCheck;
      case 'info':
        return LucideIcons.info;
      case 'message':
        return LucideIcons.messageSquare;
      default:
        return LucideIcons.bell;
    }
  }

  String _formatTime(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays > 7) {
      return "${date.day}/${date.month}";
    } else if (difference.inDays >= 1) {
      return "${difference.inDays}d";
    } else if (difference.inHours >= 1) {
      return "${difference.inHours}h";
    } else if (difference.inMinutes >= 1) {
      return "${difference.inMinutes}m";
    } else {
      return "Now";
    }
  }
}
