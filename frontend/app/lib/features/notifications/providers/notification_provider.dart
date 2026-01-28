import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/legacy.dart';
import '../models/notification_model.dart';
import '../repositories/notifications_repository.dart';
import 'notification_state.dart';

final notificationsRepositoryProvider = Provider<NotificationsRepository>((
  ref,
) {
  return NotificationsRepository();
});

final notificationProvider =
    StateNotifierProvider<NotificationNotifier, NotificationState>((ref) {
      final repository = ref.watch(notificationsRepositoryProvider);
      return NotificationNotifier(repository);
    });

class NotificationNotifier extends StateNotifier<NotificationState> {
  final NotificationsRepository _repository;
  static const int _limit = 20;

  NotificationNotifier(this._repository) : super(NotificationState.initial());

  Future<void> loadNotifications({bool refresh = false}) async {
    if (state.isLoading) return;

    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await _repository.getNotifications(
        limit: _limit,
        offset: 0,
      );

      state = state.copyWith(
        notifications: response.notifications,
        unreadCount: response.unreadCount,
        isLoading: false,
        hasMore: response.notifications.length >= _limit,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to load notifications',
      );
    }
  }

  Future<void> loadMore() async {
    if (state.isLoading || state.isLoadingMore || !state.hasMore) return;

    state = state.copyWith(isLoadingMore: true, error: null);

    try {
      final offset = state.notifications.length;
      final response = await _repository.getNotifications(
        limit: _limit,
        offset: offset,
      );

      state = state.copyWith(
        notifications: [...state.notifications, ...response.notifications],
        unreadCount: response.unreadCount,
        isLoadingMore: false,
        hasMore: response.notifications.length >= _limit,
      );
    } catch (e) {
      state = state.copyWith(
        isLoadingMore: false,
        error: 'Failed to load more notifications',
      );
    }
  }

  Future<void> markAsRead(String notificationId) async {
    final index = state.notifications.indexWhere((n) => n.id == notificationId);
    if (index == -1) return;

    final notification = state.notifications[index];
    if (notification.isRead) return;

    final updatedList = List<NotificationModel>.from(state.notifications);

    updatedList[index] = NotificationModel(
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      isRead: true,
      readAt: DateTime.now(),
      createdAt: notification.createdAt,
    );

    state = state.copyWith(
      notifications: updatedList,
      unreadCount: state.unreadCount > 0 ? state.unreadCount - 1 : 0,
    );

    try {
      await _repository.markAsRead([notificationId]);
    } catch (e) {
      // Silently fail or revert state if critical.
      // For read status, silent fail is usually acceptable UX.
    }
  }

  Future<void> markAllAsRead() async {
    if (state.unreadCount == 0) return;

    // 1. Optimistic Update
    final updatedList = state.notifications.map((n) {
      if (n.isRead) return n;
      return NotificationModel(
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        data: n.data,
        isRead: true,
        readAt: DateTime.now(),
        createdAt: n.createdAt,
      );
    }).toList();

    state = state.copyWith(
      notifications: updatedList,
      unreadCount: 0,
    );

    try {
      await _repository.markAllAsRead();
    } catch (e) {
      // Logic to revert or show error could go here
    }
  }

  Future<void> registerDeviceToken(String token) async {
    await _repository.registerDeviceToken(token);
  }
}
