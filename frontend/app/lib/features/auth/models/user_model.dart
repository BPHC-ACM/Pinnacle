class User {
  final String id;
  final String email;
  final String name;
  final String role; // 'USER' or 'ADMIN'
  final String? picture;
  final String? googleId;
  final String? phone;
  final String? location;
  final String? linkedin;
  final String? github;
  final String? website;
  final String? bio;
  final String? title;

  User({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    this.picture,
    this.googleId,
    this.phone,
    this.location,
    this.linkedin,
    this.github,
    this.website,
    this.bio,
    this.title,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String,
      role: json['role'] as String,
      picture: json['picture'] as String?,
      googleId: json['googleId'] as String?,
      phone: json['phone'] as String?,
      location: json['location'] as String?,
      linkedin: json['linkedin'] as String?,
      github: json['github'] as String?,
      website: json['website'] as String?,
      bio: json['bio'] as String?,
      title: json['title'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'role': role,
      'picture': picture,
      'googleId': googleId,
      'phone': phone,
      'location': location,
      'linkedin': linkedin,
      'github': github,
      'website': website,
      'bio': bio,
      'title': title,
    };
  }
}
