import '../models/notification_model.dart';

class NotificationState {
  final List<NotificationModel> notifications;
  final bool isLoading;
  final bool isLoadingMore;
  final String? error;
  final int unreadCount;
  final bool hasMore;

  const NotificationState({
    this.notifications = const [],
    this.isLoading = false,
    this.isLoadingMore = false,
    this.error,
    this.unreadCount = 0,
    this.hasMore = true,
  });

  factory NotificationState.initial() => const NotificationState();

  NotificationState copyWith({
    List<NotificationModel>? notifications,
    bool? isLoading,
    bool? isLoadingMore,
    String? error,
    int? unreadCount,
    bool? hasMore,
  }) {
    return NotificationState(
      notifications: notifications ?? this.notifications,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      error: error,
      unreadCount: unreadCount ?? this.unreadCount,
      hasMore: hasMore ?? this.hasMore,
    );
  }
}
