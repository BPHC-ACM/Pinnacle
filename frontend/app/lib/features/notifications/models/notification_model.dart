class NotificationModel {
  final String id;
  final String type;
  final String title;
  final String message;
  final Map<String, dynamic>? data;
  final bool isRead;
  final DateTime? readAt;
  final DateTime createdAt;

  NotificationModel({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
    this.data,
    required this.isRead,
    this.readAt,
    required this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'] as String,
      type: json['type'] as String,
      title: json['title'] as String,
      message: json['message'] as String,
      data: json['data'] != null
          ? Map<String, dynamic>.from(json['data'])
          : null,
      isRead: json['isRead'] as bool? ?? false,
      readAt: json['readAt'] != null
          ? DateTime.parse(json['readAt'] as String)
          : null,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}

class NotificationResponse {
  final List<NotificationModel> notifications;
  final int unreadCount;

  NotificationResponse({
    required this.notifications,
    required this.unreadCount,
  });

  factory NotificationResponse.fromJson(Map<String, dynamic> json) {
    return NotificationResponse(
      notifications: (json['notifications'] as List)
          .map((e) => NotificationModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      unreadCount: json['unreadCount'] as int,
    );
  }
}
