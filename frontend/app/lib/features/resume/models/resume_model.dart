import '../../profile/models/student_profile_model.dart';

// --- Resume Preview Data ---

class ResumePreviewData {
  final ResumeProfile profile;
  final List<Experience> experiences;
  final List<Education> education;
  final List<Skill> skills;
  final List<Project> projects;
  final List<Certification> certifications;
  final List<Language> languages;

  ResumePreviewData({
    required this.profile,
    required this.experiences,
    required this.education,
    required this.skills,
    required this.projects,
    required this.certifications,
    required this.languages,
  });

  factory ResumePreviewData.fromJson(Map<String, dynamic> json) {
    return ResumePreviewData(
      profile: ResumeProfile.fromJson(json['profile'] ?? {}),
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
}

class ResumeProfile {
  final String id;
  final String email;
  final String name;
  final String? picture;
  final String? phone;
  final String? location;
  final String? linkedin;
  final String? github;
  final String? website;
  final String? bio;
  final String? title;
  final String? summary;

  ResumeProfile({
    required this.id,
    required this.email,
    required this.name,
    this.picture,
    this.phone,
    this.location,
    this.linkedin,
    this.github,
    this.website,
    this.bio,
    this.title,
    this.summary,
  });

  factory ResumeProfile.fromJson(Map<String, dynamic> json) {
    return ResumeProfile(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      name: json['name'] ?? '',
      picture: json['picture'],
      phone: json['phone'],
      location: json['location'],
      linkedin: json['linkedin'],
      github: json['github'],
      website: json['website'],
      bio: json['bio'],
      title: json['title'],
      summary: json['summary'],
    );
  }
}

// --- Saved Resume & Configuration ---

class SavedResume {
  final String id;
  final String userId;
  final String title;
  final String template;
  final ResumeData data;
  final DateTime createdAt;
  final DateTime updatedAt;

  SavedResume({
    required this.id,
    required this.userId,
    required this.title,
    required this.template,
    required this.data,
    required this.createdAt,
    required this.updatedAt,
  });

  factory SavedResume.fromJson(Map<String, dynamic> json) {
    return SavedResume(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      title: json['title'] ?? '',
      template: json['template'] ?? 'modern',
      data: ResumeData.fromJson(json['data'] ?? {}),
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updatedAt'] ?? '') ?? DateTime.now(),
    );
  }
}

class ResumeData {
  final List<ResumeSection> sections;
  final List<String> selectedExperiences;
  final List<String> selectedEducation;
  final List<String> selectedSkills;
  final List<String> selectedProjects;
  final List<String> selectedCertifications;
  final List<String> selectedLanguages;
  final ResumeStyling? styling;

  ResumeData({
    required this.sections,
    this.selectedExperiences = const [],
    this.selectedEducation = const [],
    this.selectedSkills = const [],
    this.selectedProjects = const [],
    this.selectedCertifications = const [],
    this.selectedLanguages = const [],
    this.styling,
  });

  factory ResumeData.fromJson(Map<String, dynamic> json) {
    return ResumeData(
      sections:
          (json['sections'] as List?)
              ?.map((e) => ResumeSection.fromJson(e))
              .toList() ??
          [],
      selectedExperiences:
          (json['selectedExperiences'] as List?)?.cast<String>() ?? [],
      selectedEducation:
          (json['selectedEducation'] as List?)?.cast<String>() ?? [],
      selectedSkills: (json['selectedSkills'] as List?)?.cast<String>() ?? [],
      selectedProjects:
          (json['selectedProjects'] as List?)?.cast<String>() ?? [],
      selectedCertifications:
          (json['selectedCertifications'] as List?)?.cast<String>() ?? [],
      selectedLanguages:
          (json['selectedLanguages'] as List?)?.cast<String>() ?? [],
      styling: json['styling'] != null
          ? ResumeStyling.fromJson(json['styling'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'sections': sections.map((e) => e.toJson()).toList(),
      'selectedExperiences': selectedExperiences,
      'selectedEducation': selectedEducation,
      'selectedSkills': selectedSkills,
      'selectedProjects': selectedProjects,
      'selectedCertifications': selectedCertifications,
      'selectedLanguages': selectedLanguages,
      if (styling != null) 'styling': styling!.toJson(),
    };
  }

  // Helper to create a default configuration
  factory ResumeData.defaults() {
    return ResumeData(
      sections: [
        ResumeSection(id: 'profile', type: 'profile', enabled: true, order: 0),
        ResumeSection(
          id: 'experience',
          type: 'experience',
          enabled: true,
          order: 1,
        ),
        ResumeSection(
          id: 'education',
          type: 'education',
          enabled: true,
          order: 2,
        ),
        ResumeSection(id: 'skills', type: 'skills', enabled: true, order: 3),
        ResumeSection(
          id: 'projects',
          type: 'projects',
          enabled: true,
          order: 4,
        ),
        ResumeSection(
          id: 'certifications',
          type: 'certifications',
          enabled: true,
          order: 5,
        ),
        ResumeSection(
          id: 'languages',
          type: 'languages',
          enabled: true,
          order: 6,
        ),
      ],
    );
  }
}

class ResumeSection {
  final String id;
  final String type;
  final bool enabled;
  final int order;

  ResumeSection({
    required this.id,
    required this.type,
    required this.enabled,
    required this.order,
  });

  factory ResumeSection.fromJson(Map<String, dynamic> json) {
    return ResumeSection(
      id: json['id'] ?? '',
      type: json['type'] ?? '',
      enabled: json['enabled'] ?? true,
      order: json['order'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'enabled': enabled,
      'order': order,
    };
  }
}

class ResumeStyling {
  final String? primaryColor;
  final String? fontFamily;
  final String? fontSize; // 'small' | 'medium' | 'large'
  final String? spacing; // 'compact' | 'normal' | 'relaxed'

  ResumeStyling({
    this.primaryColor,
    this.fontFamily,
    this.fontSize,
    this.spacing,
  });

  factory ResumeStyling.fromJson(Map<String, dynamic> json) {
    return ResumeStyling(
      primaryColor: json['primaryColor'],
      fontFamily: json['fontFamily'],
      fontSize: json['fontSize'],
      spacing: json['spacing'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (primaryColor != null) 'primaryColor': primaryColor,
      if (fontFamily != null) 'fontFamily': fontFamily,
      if (fontSize != null) 'fontSize': fontSize,
      if (spacing != null) 'spacing': spacing,
    };
  }
}

// --- Request Objects ---

class CreateResumeRequest {
  final String title;
  final String template;
  final ResumeData data;

  CreateResumeRequest({
    required this.title,
    this.template = 'modern',
    required this.data,
  });

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'template': template,
      'data': data.toJson(),
    };
  }
}

class UpdateResumeRequest {
  final String? title;
  final String? template;
  final ResumeData? data;

  UpdateResumeRequest({
    this.title,
    this.template,
    this.data,
  });

  Map<String, dynamic> toJson() {
    return {
      if (title != null) 'title': title,
      if (template != null) 'template': template,
      if (data != null) 'data': data!.toJson(),
    };
  }
}

class TemplateInfo {
  final String id;
  final String name;
  final String description;
  final String? preview;

  TemplateInfo({
    required this.id,
    required this.name,
    required this.description,
    this.preview,
  });

  factory TemplateInfo.fromJson(Map<String, dynamic> json) {
    return TemplateInfo(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      preview: json['preview'],
    );
  }
}
