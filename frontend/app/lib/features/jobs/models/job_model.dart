class JobModel {
  final String id;
  final String companyId; // Added companyId field
  final String title;
  final Company company;
  final String? location;
  final String? type;
  final String? description;
  final String? descriptionDocument;
  final String? salary;
  final DateTime createdAt;
  final DateTime? deadline;
  final String status;

  JobModel({
    required this.id,
    required this.companyId,
    required this.title,
    required this.company,
    this.location,
    this.type,
    this.description,
    this.descriptionDocument,
    this.salary,
    required this.createdAt,
    this.deadline,
    required this.status,
  });

  factory JobModel.fromJson(
    Map<String, dynamic> json, {
    Company? companyOverride,
  }) {
    // Prefer the override (from repo), then try nested JSON, then fallback to ID/Placeholder
    final companyObj =
        companyOverride ??
        (json['company'] != null
            ? Company.fromJson(json['company'])
            : Company(id: json['companyId'] ?? '', name: 'Unknown Company'));

    return JobModel(
      id: json['id'],
      companyId: json['companyId'] ?? '',
      title: json['title'],
      company: companyObj,
      location: json['location'],
      type: json['type'] ?? json['jobType'],
      description: json['description'],
      descriptionDocument: json['descriptionDocument'],
      salary: json['salary'],
      createdAt: DateTime.parse(json['createdAt']),
      deadline: json['deadline'] != null
          ? DateTime.parse(json['deadline'])
          : null,
      status: json['status'] ?? 'OPEN',
    );
  }
}

class Company {
  final String id;
  final String name;

  Company({required this.id, required this.name});

  factory Company.fromJson(Map<String, dynamic> json) {
    return Company(id: json['id'], name: json['name']);
  }
}
