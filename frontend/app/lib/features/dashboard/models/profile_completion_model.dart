class ProfileCompletionModel {
  final int completionPercentage;
  final List<String> completedFields;
  final List<String> missingFields;
  final String recommendations;

  ProfileCompletionModel({
    required this.completionPercentage,
    required this.completedFields,
    required this.missingFields,
    required this.recommendations,
  });

  factory ProfileCompletionModel.fromJson(Map<String, dynamic> json) {
    return ProfileCompletionModel(
      completionPercentage: json['completionPercentage'] as int? ?? 0,
      completedFields:
          (json['completedFields'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      missingFields:
          (json['missingFields'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      recommendations: json['recommendations'] as String? ?? '',
    );
  }
}
