class StudentProfile {
  final String id;
  final String email;
  final String name;
  final String? picture;
  final String? phone;
  final String? location;
  final String? bio;
  final String? title; // Professional headline
  final String? linkedin;
  final String? github;
  final String? website;
  final List<Experience> experiences;
  final List<Education> education;
  final List<Skill> skills;
  final List<Project> projects;
  final List<Certification> certifications;

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
      experiences: (json['experiences'] as List?)
              ?.map((e) => Experience.fromJson(e))
              .toList() ??
          [],
      education: (json['education'] as List?)
              ?.map((e) => Education.fromJson(e))
              .toList() ??
          [],
      skills: (json['skills'] as List?)
              ?.map((e) => Skill.fromJson(e))
              .toList() ??
          [],
      projects: (json['projects'] as List?)
              ?.map((e) => Project.fromJson(e))
              .toList() ??
          [],
      certifications: (json['certifications'] as List?)
              ?.map((e) => Certification.fromJson(e))
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

  Experience({
    required this.id,
    required this.company,
    required this.position,
    this.location,
    required this.startDate,
    this.endDate,
    this.current = false,
    this.description,
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

  Education({
    required this.id,
    required this.institution,
    required this.degree,
    required this.branch,
    required this.startDate,
    this.endDate,
    this.gpa,
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
    );
  }
}

class Skill {
  final String id;
  final String category;
  final List<String> items;

  Skill({
    required this.id,
    required this.category,
    required this.items,
  });

  factory Skill.fromJson(Map<String, dynamic> json) {
    return Skill(
      id: json['id'] ?? '',
      category: json['category'] ?? '',
      items: (json['items'] as List?)?.map((e) => e.toString()).toList() ?? [],
    );
  }
}

class Project {
  final String id;
  final String name;
  final List<String> technologies;
  final String? url;
  final String? repoUrl;
  final List<String> highlights;

  Project({
    required this.id,
    required this.name,
    this.technologies = const [],
    this.url,
    this.repoUrl,
    this.highlights = const [],
  });

  factory Project.fromJson(Map<String, dynamic> json) {
    return Project(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      technologies: (json['technologies'] as List?)?.map((e) => e.toString()).toList() ?? [],
      url: json['url'],
      repoUrl: json['repoUrl'],
      highlights: (json['highlights'] as List?)?.map((e) => e.toString()).toList() ?? [],
    );
  }
}

class Certification {
  final String id;
  final String name;
  final String issuer;
  final String date;
  final String? url;

  Certification({
    required this.id,
    required this.name,
    required this.issuer,
    required this.date,
    this.url,
  });

  factory Certification.fromJson(Map<String, dynamic> json) {
    return Certification(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      issuer: json['issuer'] ?? '',
      date: json['date'] ?? '',
      url: json['url'],
    );
  }
}