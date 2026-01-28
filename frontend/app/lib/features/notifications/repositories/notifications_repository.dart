import '../../../core/network/api_client.dart';
import '../../../core/utils/logger.dart';
import '../models/notification_model.dart';

class NotificationsRepository {
  final ApiClient _apiClient = ApiClient();

  /// Fetches a paginated list of notifications.
  /// Returns a [NotificationResponse] containing the list and unread count.
  Future<NotificationResponse> getNotifications({
    int limit = 20,
    int offset = 0,
  }) async {
    try {
      final response = await _apiClient.get(
        '/api/notifications',
        queryParameters: {
          'limit': limit,
          'offset': offset,
        },
      );
      return NotificationResponse.fromJson(response.data);
    } catch (e) {
      logger.e(
        'NotificationsRepository: Failed to fetch notifications',
        error: e,
      );
      rethrow;
    }
  }

  /// Marks a list of specific notifications as read.
  Future<void> markAsRead(List<String> notificationIds) async {
    try {
      if (notificationIds.isEmpty) return;

      await _apiClient.post(
        '/api/notifications/mark-read',
        data: {'notificationIds': notificationIds},
      );
    } catch (e) {
      logger.e(
        'NotificationsRepository: Failed to mark notifications as read',
        error: e,
      );
      rethrow;
    }
  }

  /// Marks all notifications for the current user as read.
  Future<void> markAllAsRead() async {
    try {
      await _apiClient.post('/notifications/mark-all-read');
    } catch (e) {
      logger.e('NotificationsRepository: Failed to mark all as read', error: e);
      rethrow;
    }
  }

  /// Registers a device token for push notifications.
  Future<void> registerDeviceToken(
    String token, {
    String platform = 'android',
  }) async {
    try {
      await _apiClient.post(
        '/api/notifications/device-token',
        data: {
          'token': token,
          'platform': platform,
        },
      );
      logger.i('NotificationsRepository: Device token registered');
    } catch (e) {
      // Log but don't rethrow, as this is often a background maintenance task
      logger.e(
        'NotificationsRepository: Failed to register device token',
        error: e,
      );
    }
  }

  /// Unregisters a device token (e.g., on logout).
  Future<void> unregisterDeviceToken(String token) async {
    try {
      await _apiClient.delete(
        '/api/notifications/device-token',
        data: {'token': token},
      );
      logger.i('NotificationsRepository: Device token unregistered');
    } catch (e) {
      logger.e(
        'NotificationsRepository: Failed to unregister device token',
        error: e,
      );
    }
  }
}
