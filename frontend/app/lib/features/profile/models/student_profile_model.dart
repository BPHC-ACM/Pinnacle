enum VerificationStatus { PENDING, APPROVED, REJECTED }

enum ProficiencyLevel { BEGINNER, INTERMEDIATE, ADVANCED, EXPERT, NATIVE }

class StudentProfile {
  final String id;
  final String email;
  final String name;
  final String? picture;
  final String? phone;
  final String? location;
  final String? bio;
  final String? title;
  final String? linkedin;
  final String? github;
  final String? website;
  final List<Experience> experiences;
  final List<Education> education;
  final List<Skill> skills;
  final List<Project> projects;
  final List<Certification> certifications;
  final List<Language> languages;

  StudentProfile({
    required this.id,
    required this.email,
    required this.name,
    this.picture,
    this.phone,
    this.location,
    this.bio,
    this.title,
    this.linkedin,
    this.github,
    this.website,
    this.experiences = const [],
    this.education = const [],
    this.skills = const [],
    this.projects = const [],
    this.certifications = const [],
    this.languages = const [],
  });

  factory StudentProfile.fromJson(Map<String, dynamic> json) {
    return StudentProfile(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      name: json['name'] ?? '',
      picture: json['picture'],
      phone: json['phone'],
      location: json['location'],
      bio: json['bio'],
      title: json['title'],
      linkedin: json['linkedin'],
      github: json['github'],
      website: json['website'],
      experiences:
          (json['experiences'] as List?)
              ?.map((e) => Experience.fromJson(e))
              .toList() ??
          [],
      education:
          (json['education'] as List?)
              ?.map((e) => Education.fromJson(e))
              .toList() ??
          [],
      skills:
          (json['skills'] as List?)?.map((e) => Skill.fromJson(e)).toList() ??
          [],
      projects:
          (json['projects'] as List?)
              ?.map((e) => Project.fromJson(e))
              .toList() ??
          [],
      certifications:
          (json['certifications'] as List?)
              ?.map((e) => Certification.fromJson(e))
              .toList() ??
          [],
      languages:
          (json['languages'] as List?)
              ?.map((e) => Language.fromJson(e))
              .toList() ??
          [],
    );
  }

  StudentProfile copyWith({
    String? phone,
    String? location,
    String? bio,
    String? title,
    String? linkedin,
    String? github,
    String? website,
  }) {
    return StudentProfile(
      id: id,
      email: email,
      name: name,
      picture: picture,
      phone: phone ?? this.phone,
      location: location ?? this.location,
      bio: bio ?? this.bio,
      title: title ?? this.title,
      linkedin: linkedin ?? this.linkedin,
      github: github ?? this.github,
      website: website ?? this.website,
      experiences: experiences,
      education: education,
      skills: skills,
      projects: projects,
      certifications: certifications,
      languages: languages,
    );
  }
}

class Experience {
  final String id;
  final String company;
  final String position;
  final String? location;
  final String startDate;
  final String? endDate;
  final bool current;
  final String? description;
  final String? sector;
  final String? salaryRange;
  final List<String> highlights;
  final VerificationStatus verificationStatus;

  Experience({
    required this.id,
    required this.company,
    required this.position,
    this.location,
    required this.startDate,
    this.endDate,
    this.current = false,
    this.description,
    this.sector,
    this.salaryRange,
    this.highlights = const [],
    this.verificationStatus = VerificationStatus.PENDING,
  });

  factory Experience.fromJson(Map<String, dynamic> json) {
    return Experience(
      id: json['id'] ?? '',
      company: json['company'] ?? '',
      position: json['position'] ?? '',
      location: json['location'],
      startDate: json['startDate'] ?? '',
      endDate: json['endDate'],
      current: json['current'] ?? false,
      description: json['description'],
      sector: json['sector'],
      salaryRange: json['salaryRange'],
      highlights:
          (json['highlights'] as List?)?.map((e) => e.toString()).toList() ??
          [],
      verificationStatus: _parseStatus(json['verificationStatus']),
    );
  }
}

class Education {
  final String id;
  final String institution;
  final String degree;
  final String branch;
  final String startDate;
  final String? endDate;
  final String? gpa;
  final String? rollNumber;
  final String? location;
  final List<String> achievements;
  final VerificationStatus verificationStatus;

  Education({
    required this.id,
    required this.institution,
    required this.degree,
    required this.branch,
    required this.startDate,
    this.endDate,
    this.gpa,
    this.rollNumber,
    this.location,
    this.achievements = const [],
    this.verificationStatus = VerificationStatus.PENDING,
  });

  factory Education.fromJson(Map<String, dynamic> json) {
    return Education(
      id: json['id'] ?? '',
      institution: json['institution'] ?? '',
      degree: json['degree'] ?? '',
      branch: json['branch'] ?? '',
      startDate: json['startDate'] ?? '',
      endDate: json['endDate'],
      gpa: json['gpa'],
      rollNumber: json['rollNumber'],
      location: json['location'],
      achievements:
          (json['achievements'] as List?)?.map((e) => e.toString()).toList() ??
          [],
      verificationStatus: _parseStatus(json['verificationStatus']),
    );
  }
}

class Skill {
  final String id;
  final String category;
  final List<String> items;
  final ProficiencyLevel? proficiency;
  final VerificationStatus verificationStatus;

  Skill({
    required this.id,
    required this.category,
    required this.items,
    this.proficiency,
    this.verificationStatus = VerificationStatus.PENDING,
  });

  factory Skill.fromJson(Map<String, dynamic> json) {
    return Skill(
      id: json['id'] ?? '',
      category: json['category'] ?? '',
      items: (json['items'] as List?)?.map((e) => e.toString()).toList() ?? [],
      proficiency: _parseProficiency(json['proficiency']),
      verificationStatus: _parseStatus(json['verificationStatus']),
    );
  }
}

class Project {
  final String id;
  final String title;
  final String domain;
  final List<String> tools;
  final String description;
  final List<String> outcomes;
  final String? referenceUrl;
  final VerificationStatus verificationStatus;

  Project({
    required this.id,
    required this.title,
    required this.domain,
    required this.description,
    this.tools = const [],
    this.outcomes = const [],
    this.referenceUrl,
    this.verificationStatus = VerificationStatus.PENDING,
  });

  factory Project.fromJson(Map<String, dynamic> json) {
    return Project(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      domain: json['domain'] ?? '',
      description: json['description'] ?? '',
      tools: (json['tools'] as List?)?.map((e) => e.toString()).toList() ?? [],
      outcomes:
          (json['outcomes'] as List?)?.map((e) => e.toString()).toList() ?? [],
      referenceUrl: json['referenceUrl'],
      verificationStatus: _parseStatus(json['verificationStatus']),
    );
  }
}

class Certification {
  final String id;
  final String name;
  final String issuer;
  final String date;
  final String? url;
  final VerificationStatus verificationStatus;

  Certification({
    required this.id,
    required this.name,
    required this.issuer,
    required this.date,
    this.url,
    this.verificationStatus = VerificationStatus.PENDING,
  });

  factory Certification.fromJson(Map<String, dynamic> json) {
    return Certification(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      issuer: json['issuer'] ?? '',
      date: json['date'] ?? '',
      url: json['url'],
      verificationStatus: _parseStatus(json['verificationStatus']),
    );
  }
}

class Language {
  final String id;
  final String name;
  final ProficiencyLevel proficiency;

  Language({
    required this.id,
    required this.name,
    required this.proficiency,
  });

  factory Language.fromJson(Map<String, dynamic> json) {
    return Language(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      proficiency:
          _parseProficiency(json['proficiency']) ?? ProficiencyLevel.BEGINNER,
    );
  }
}

// Helpers
VerificationStatus _parseStatus(String? status) {
  switch (status) {
    case 'APPROVED':
      return VerificationStatus.APPROVED;
    case 'REJECTED':
      return VerificationStatus.REJECTED;
    default:
      return VerificationStatus.PENDING;
  }
}

ProficiencyLevel? _parseProficiency(String? level) {
  if (level == null) return null;
  try {
    return ProficiencyLevel.values.firstWhere((e) => e.name == level);
  } catch (_) {
    return null;
  }
}
