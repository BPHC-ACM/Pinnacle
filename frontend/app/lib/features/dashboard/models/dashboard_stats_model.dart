class DashboardStatsModel {
  final int experiences;
  final int education;
  final int skills;
  final int skillItems;
  final int projects;
  final int certifications;
  final int languages;

  DashboardStatsModel({
    required this.experiences,
    required this.education,
    required this.skills,
    required this.skillItems,
    required this.projects,
    required this.certifications,
    required this.languages,
  });

  factory DashboardStatsModel.fromJson(Map<String, dynamic> json) {
    return DashboardStatsModel(
      experiences: json['experiences'] as int? ?? 0,
      education: json['education'] as int? ?? 0,
      skills: json['skills'] as int? ?? 0,
      skillItems: json['skillItems'] as int? ?? 0,
      projects: json['projects'] as int? ?? 0,
      certifications: json['certifications'] as int? ?? 0,
      languages: json['languages'] as int? ?? 0,
    );
  }
}
