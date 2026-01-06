class JobModel {
  final String id;
  final String companyId;
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
  final List<JobQuestion> questions; // Added questions field

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
    this.questions = const [], // Default to empty list
  });

  factory JobModel.fromJson(
    Map<String, dynamic> json, {
    Company? companyOverride,
  }) {
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
      questions:
          (json['questions'] as List<dynamic>?)
              ?.map((e) => JobQuestion.fromJson(e))
              .toList() ??
          [],
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

class JobQuestion {
  final String id;
  final String question;
  final bool required;

  JobQuestion({
    required this.id,
    required this.question,
    required this.required,
  });

  factory JobQuestion.fromJson(Map<String, dynamic> json) {
    return JobQuestion(
      id: json['id'],
      question: json['question'],
      required: json['required'] ?? true,
    );
  }
}
