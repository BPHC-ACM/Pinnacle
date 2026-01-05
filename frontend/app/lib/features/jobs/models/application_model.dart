class ApplicationModel {
  final String id;
  final String jobId;
  final String status; // 'applied', 'review', 'accepted', 'rejected'
  final DateTime createdAt;

  ApplicationModel({
    required this.id,
    required this.jobId,
    required this.status,
    required this.createdAt,
  });

  factory ApplicationModel.fromJson(Map<String, dynamic> json) {
    return ApplicationModel(
      id: json['id'],
      jobId: json['jobId'],
      status: json['status'],
      createdAt: DateTime.parse(
        json['appliedAt'] ??
            json['createdAt'] ??
            DateTime.now().toIso8601String(),
      ),
    );
  }
}
