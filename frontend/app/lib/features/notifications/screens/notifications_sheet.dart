import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../providers/notification_provider.dart';
import '../widgets/notification_skeleton.dart';
import '../widgets/notification_tile.dart';

class NotificationsSheet extends ConsumerStatefulWidget {
  const NotificationsSheet({super.key});

  @override
  ConsumerState<NotificationsSheet> createState() => _NotificationsSheetState();
}

class _NotificationsSheetState extends ConsumerState<NotificationsSheet> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(notificationProvider.notifier).loadNotifications();
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      ref.read(notificationProvider.notifier).loadMore();
    }
  }

  Future<void> _handleMarkAllRead() async {
    HapticFeedback.mediumImpact();
    await ref.read(notificationProvider.notifier).markAllAsRead();
    if (mounted) {
      _showSnackBar(context, 'All notifications marked as read');
    }
  }

  void _showSnackBar(BuildContext context, String message) {
    final theme = Theme.of(context);
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          message,
          style: GoogleFonts.inter(
            fontWeight: FontWeight.w500,
            color: theme.colorScheme.onInverseSurface,
          ),
        ),
        backgroundColor: theme.colorScheme.inverseSurface,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(notificationProvider);
    final theme = Theme.of(context);
    final colors = theme.colorScheme;

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        children: [
          const SizedBox(height: 12),

          // Drag handle
          Container(
            width: 42,
            height: 4,
            decoration: BoxDecoration(
              color: colors.outlineVariant,
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Notifications',
                        style: GoogleFonts.inter(
                          fontSize: 26,
                          fontWeight: FontWeight.w700,
                          color: colors.onSurface,
                        ),
                      ),
                      if (state.unreadCount > 0)
                        Padding(
                          padding: const EdgeInsets.only(top: 6),
                          child: Text(
                            '${state.unreadCount} unread',
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: colors.primary,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
                if (state.notifications.isNotEmpty)
                  IconButton(
                    onPressed: _handleMarkAllRead,
                    tooltip: 'Mark all as read',
                    style: IconButton.styleFrom(
                      backgroundColor: colors.surfaceBright,
                      foregroundColor: colors.onSurfaceVariant,
                      padding: const EdgeInsets.all(12),
                    ),
                    icon: const Icon(LucideIcons.checkCheck, size: 20),
                  ),
              ],
            ),
          ),

          Divider(height: 1, color: colors.outlineVariant),

          // Content
          Expanded(
            child: state.isLoading && state.notifications.isEmpty
                ? const NotificationSkeleton()
                : state.notifications.isEmpty
                ? _buildEmptyState(context)
                : RefreshIndicator(
                    color: colors.primary,
                    onRefresh: () async {
                      HapticFeedback.lightImpact();
                      await ref
                          .read(notificationProvider.notifier)
                          .loadNotifications(refresh: true);
                    },
                    child: ListView.builder(
                      controller: _scrollController,
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.only(bottom: 12),
                      itemCount:
                          state.notifications.length +
                          (state.isLoadingMore ? 1 : 0),
                      itemBuilder: (context, index) {
                        if (index == state.notifications.length) {
                          return const Padding(
                            padding: EdgeInsets.all(24),
                            child: Center(
                              child: SizedBox(
                                width: 22,
                                height: 22,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.5,
                                ),
                              ),
                            ),
                          );
                        }

                        final notification = state.notifications[index];

                        return Dismissible(
                          key: ValueKey(notification.id),
                          direction: !notification.isRead
                              ? DismissDirection.endToStart
                              : DismissDirection.none,
                          confirmDismiss: (_) async {
                            HapticFeedback.selectionClick();
                            await ref
                                .read(notificationProvider.notifier)
                                .markAsRead(notification.id);
                            return false;
                          },
                          background: Container(
                            alignment: Alignment.centerRight,
                            padding: const EdgeInsets.symmetric(horizontal: 24),
                            color: colors.primary,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                Text(
                                  'Mark read',
                                  style: GoogleFonts.inter(
                                    color: colors.onPrimary,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Icon(
                                  LucideIcons.check,
                                  color: colors.onPrimary,
                                ),
                              ],
                            ),
                          ),
                          child: NotificationTile(
                            notification: notification,
                            onTap: () {
                              if (!notification.isRead) {
                                ref
                                    .read(notificationProvider.notifier)
                                    .markAsRead(notification.id);
                              }
                            },
                          ),
                        );
                      },
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    final theme = Theme.of(context);
    final colors = theme.colorScheme;

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: colors.surfaceBright,
              shape: BoxShape.circle,
            ),
            child: Icon(
              LucideIcons.bell,
              size: 32,
              color: colors.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'You’re all caught up',
            style: GoogleFonts.inter(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: colors.onSurface,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'No new notifications right now.',
            style: GoogleFonts.inter(
              fontSize: 15,
              color: colors.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }
}
