import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher_string.dart';

import '../../auth/providers/auth_provider.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/components/pinnacle_button.dart';
import '../../../../core/components/pinnacle_header_banner.dart';
import '../../resume/screens/resume_builder_screen.dart';
import '../models/student_profile_model.dart';
import '../providers/profile_provider.dart';
import '../widgets/verification_badge.dart';
import '../widgets/add_edit_item_sheet.dart';
import '../widgets/profile_section_card.dart'; // Ensure this is imported

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  // State for Inline Editing (Personal Info)
  bool _isEditingPersonal = false;
  bool _isSavingPersonal = false;

  // Controllers
  late TextEditingController _titleController;
  late TextEditingController _bioController;
  late TextEditingController _phoneController;
  late TextEditingController _locationController;
  late TextEditingController _linkedinController;
  late TextEditingController _githubController;
  late TextEditingController _websiteController;

  late ScrollController _scrollController;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _titleController = TextEditingController();
    _bioController = TextEditingController();
    _phoneController = TextEditingController();
    _locationController = TextEditingController();
    _linkedinController = TextEditingController();
    _githubController = TextEditingController();
    _websiteController = TextEditingController();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _titleController.dispose();
    _bioController.dispose();
    _phoneController.dispose();
    _locationController.dispose();
    _linkedinController.dispose();
    _githubController.dispose();
    _websiteController.dispose();
    super.dispose();
  }

  void _populatePersonalControllers(StudentProfile profile) {
    _titleController.text = profile.title ?? '';
    _bioController.text = profile.bio ?? '';
    _phoneController.text = profile.phone ?? '';
    _locationController.text = profile.location ?? '';
    _linkedinController.text = profile.linkedin ?? '';
    _githubController.text = profile.github ?? '';
    _websiteController.text = profile.website ?? '';
  }

  void _togglePersonalEdit(StudentProfile profile) {
    if (_isEditingPersonal) {
      setState(() => _isEditingPersonal = false);
    } else {
      _populatePersonalControllers(profile);
      setState(() => _isEditingPersonal = true);
    }
  }

  Future<void> _savePersonalChanges() async {
    setState(() => _isSavingPersonal = true);
    try {
      await ref.read(profileProvider.notifier).updateBasicProfile({
        'title': _titleController.text,
        'bio': _bioController.text,
        'phone': _phoneController.text,
        'location': _locationController.text,
        'linkedin': _linkedinController.text,
        'github': _githubController.text,
        'website': _websiteController.text,
      });

      if (mounted) {
        setState(() {
          _isEditingPersonal = false;
          _isSavingPersonal = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Profile updated successfully'),
            backgroundColor: AppColors.success,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSavingPersonal = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _pickAndUploadImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);

    if (pickedFile == null) return;

    if (!mounted) return;

    final messenger = ScaffoldMessenger.of(context);

    try {
      messenger.showSnackBar(
        const SnackBar(content: Text('Uploading image...')),
      );

      await ref
          .read(profileProvider.notifier)
          .updateProfilePicture(File(pickedFile.path));

      if (!mounted) return;

      messenger.showSnackBar(
        const SnackBar(
          content: Text('Profile picture updated successfully'),
          backgroundColor: AppColors.success,
        ),
      );
    } catch (e) {
      if (!mounted) return;

      messenger.showSnackBar(
        SnackBar(
          content: Text('Error updating profile picture: $e'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  // --- Sheet Handlers ---

  void _openAddSheet(ItemType type) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useRootNavigator: true, // Hides bottom nav by pushing to root navigator
      backgroundColor: Colors.transparent,
      builder: (_) => AddEditItemSheet(type: type),
    );
  }

  void _openEditSheet(ItemType type, String id, Map<String, dynamic> data) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useRootNavigator: true, // Hides bottom nav by pushing to root navigator
      backgroundColor: Colors.transparent,
      builder: (_) =>
          AddEditItemSheet(type: type, itemId: id, initialData: data),
    );
  }

  void _deleteItem(
    Future<void> Function(String) deleteMethod,
    String id,
  ) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text("Delete Item?"),
        content: const Text("This action cannot be undone."),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text("Cancel"),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text(
              "Delete",
              style: TextStyle(color: AppColors.error),
            ),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        await deleteMethod(id);
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text("Error: $e")));
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final profileState = ref.watch(profileProvider);
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: profileState.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
        data: (profile) => Stack(
          children: [
            // 1. Animated Header
            AnimatedBuilder(
              animation: _scrollController,
              builder: (context, child) {
                double offset = 0;
                if (_scrollController.hasClients) {
                  offset = _scrollController.offset;
                }
                final opacity = (1.0 - (offset / 150.0)).clamp(0.0, 1.0);
                return Opacity(opacity: opacity, child: child);
              },
              child: Stack(
                children: [
                  const PinnacleHeaderBanner(height: 280),
                  Positioned.fill(
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Colors.transparent,
                            theme.scaffoldBackgroundColor,
                          ],
                          stops: const [0, 1],
                          begin: AlignmentDirectional.topCenter,
                          end: AlignmentDirectional.bottomCenter,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // 2. Main Content
            CustomScrollView(
              controller: _scrollController,
              physics: const BouncingScrollPhysics(),
              slivers: [
                SliverAppBar(
                  expandedHeight: 80.0,
                  backgroundColor: Colors.transparent,
                  surfaceTintColor: Colors.transparent,
                  pinned: true,
                  elevation: 0,
                  centerTitle: true,
                  title: _isEditingPersonal
                      ? Text(
                          "Edit Personal Info",
                          style: GoogleFonts.inter(
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        )
                      : null,
                  flexibleSpace: FlexibleSpaceBar(
                    background: Column(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        const SizedBox(height: 60),
                        if (!_isEditingPersonal)
                          Text(
                            "My Profile",
                            style: GoogleFonts.inter(
                              fontSize: 26,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                      ],
                    ),
                  ),
                  actions: [
                    if (!_isEditingPersonal)
                      IconButton(
                        onPressed: () =>
                            ref.read(authProvider.notifier).logout(),
                        icon: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.2),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            LucideIcons.logOut,
                            color: Colors.white,
                            size: 18,
                          ),
                        ),
                      ),
                    const SizedBox(width: 16),
                  ],
                ),
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  sliver: SliverList(
                    delegate: SliverChildListDelegate([
                      const SizedBox(height: 10),
                      _buildFloatingHeaderCard(context, profile),
                      const SizedBox(height: 32),
                      _buildPersonalActionButtons(profile),
                      const SizedBox(height: 40),

                      // --- Grouped Sections ---

                      // Experience
                      ProfileSectionCard(
                        key: const PageStorageKey('experience_section'),
                        title: "Experience",
                        action: _buildAddButton(
                          () => _openAddSheet(ItemType.experience),
                        ),
                        children: profile.experiences
                            .map(
                              (e) => _buildExperienceItem(
                                context,
                                e,
                                profile.experiences.last == e,
                              ),
                            )
                            .toList(),
                      ),

                      // Education
                      ProfileSectionCard(
                        key: const PageStorageKey('education_section'),
                        title: "Education",
                        action: _buildAddButton(
                          () => _openAddSheet(ItemType.education),
                        ),
                        children: profile.education
                            .map(
                              (e) => _buildEducationItem(
                                context,
                                e,
                                profile.education.last == e,
                              ),
                            )
                            .toList(),
                      ),

                      // Skills
                      ProfileSectionCard(
                        key: const PageStorageKey('skills_section'),
                        title: "Skills",
                        action: _buildAddButton(
                          () => _openAddSheet(ItemType.skill),
                        ),
                        children: profile.skills
                            .map(
                              (s) => _buildSkillItem(
                                context,
                                s,
                                profile.skills.last == s,
                              ),
                            )
                            .toList(),
                      ),

                      // Projects
                      ProfileSectionCard(
                        key: const PageStorageKey('projects_section'),
                        title: "Projects",
                        action: _buildAddButton(
                          () => _openAddSheet(ItemType.project),
                        ),
                        children: profile.projects
                            .map(
                              (p) => _buildProjectItem(
                                context,
                                p,
                                profile.projects.last == p,
                              ),
                            )
                            .toList(),
                      ),

                      // Certifications
                      ProfileSectionCard(
                        key: const PageStorageKey('certifications_section'),
                        title: "Certifications",
                        action: _buildAddButton(
                          () => _openAddSheet(ItemType.certification),
                        ),
                        children: profile.certifications
                            .map(
                              (c) => _buildCertificationItem(
                                context,
                                c,
                                profile.certifications.last == c,
                              ),
                            )
                            .toList(),
                      ),

                      // Languages
                      ProfileSectionCard(
                        key: const PageStorageKey('languages_section'),
                        title: "Languages",
                        action: _buildAddButton(
                          () => _openAddSheet(ItemType.language),
                        ),
                        children: [
                          if (profile.languages.isNotEmpty)
                            Padding(
                              padding: const EdgeInsets.all(20),
                              child: _buildLanguagesWrap(
                                context,
                                profile.languages,
                              ),
                            ),
                        ],
                      ),

                      const SizedBox(height: 120),
                    ]),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAddButton(VoidCallback onTap) {
    return IconButton(
      onPressed: onTap,
      icon: const Icon(LucideIcons.plus, size: 20),
      style: IconButton.styleFrom(
        // foregroundColor: AppColors.primary500,
        // backgroundColor: AppColors.neutral800,
        foregroundColor: Theme.of(context).colorScheme.primary,
        backgroundColor: Theme.of(context).colorScheme.outline,
      ),
    );
  }

  // --- Visual Components ---

  Widget _buildFloatingHeaderCard(
    BuildContext context,
    StudentProfile profile,
  ) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.cardTheme.color,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 24,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Column(
        children: [
          // Avatar with Edit Button
          Stack(
            children: [
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: theme.scaffoldBackgroundColor,
                  border: Border.all(
                    color: theme.scaffoldBackgroundColor,
                    width: 4,
                  ),
                  image: profile.picture != null
                      ? DecorationImage(
                          image: NetworkImage(profile.picture!),
                          fit: BoxFit.cover,
                        )
                      : null,
                ),
                alignment: Alignment.center,
                child: profile.picture == null
                    ? Text(
                        profile.name.isNotEmpty
                            ? profile.name[0].toUpperCase()
                            : '?',
                        style: GoogleFonts.inter(
                          fontSize: 36,
                          fontWeight: FontWeight.bold,
                          color: theme.colorScheme.primary,
                        ),
                      )
                    : null,
              ),
              // Edit Icon Button
              Positioned(
                bottom: 0,
                right: 0,
                child: InkWell(
                  onTap: _pickAndUploadImage,
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primary,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: theme.cardTheme.color ?? Colors.white,
                        width: 2,
                      ),
                    ),
                    child: const Icon(
                      LucideIcons.camera,
                      size: 16,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            profile.name,
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: theme.colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 4),
          AnimatedSize(
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOutBack,
            alignment: Alignment.topCenter,
            child: _isEditingPersonal
                ? _buildEditFields(context)
                : _buildViewFields(context, profile),
          ),
        ],
      ),
    );
  }

  Widget _buildViewFields(BuildContext context, StudentProfile profile) {
    final theme = Theme.of(context);
    return Column(
      children: [
        if (profile.title != null)
          Text(
            profile.title!,
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              fontSize: 16,
              color: theme.colorScheme.primary,
              fontWeight: FontWeight.w500,
            ),
          ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (profile.location != null)
              _buildIconText(context, LucideIcons.mapPin, profile.location!),
            if (profile.location != null && profile.phone != null) ...[
              const SizedBox(width: 16),
              Container(width: 1, height: 16, color: theme.colorScheme.outline),
            ],
            if (profile.phone != null) ...[
              const SizedBox(width: 16),
              _buildIconText(context, LucideIcons.phone, profile.phone!),
            ],
          ],
        ),
        if (profile.bio == null)
          Text(
            'Add your bio',
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              fontSize: 15,
              height: 1.6,
              color: theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.6),
              fontStyle: FontStyle.italic,
            ),
          )
        else ...[
          const SizedBox(height: 12),
          Text(
            profile.bio!,
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              fontSize: 15,
              height: 1.6,
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ],
        const SizedBox(height: 12),
        Divider(color: theme.colorScheme.outline.withValues(alpha: 0.5)),
        const SizedBox(height: 12),
        Wrap(
          spacing: 16,
          runSpacing: 16,
          alignment: WrapAlignment.center,
          children: [
            if (profile.email.isNotEmpty)
              _buildSocialBtn(
                context,
                LucideIcons.mail,
                'mailto:${profile.email}',
              ),
            if (profile.linkedin?.isNotEmpty == true)
              _buildSocialBtn(context, LucideIcons.linkedin, profile.linkedin!),
            if (profile.github?.isNotEmpty == true)
              _buildSocialBtn(context, LucideIcons.github, profile.github!),
            if (profile.website?.isNotEmpty == true)
              _buildSocialBtn(context, LucideIcons.globe, profile.website!),
          ],
        ),
      ],
    );
  }

  Widget _buildEditFields(BuildContext context) {
    return Column(
      children: [
        const SizedBox(height: 16),
        _buildTextField(
          context,
          _titleController,
          "Headline",
          "Ex: Student at XYZ Univ",
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: _buildTextField(
                context,
                _locationController,
                "Location",
                "City, Country",
                icon: LucideIcons.mapPin,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildTextField(
                context,
                _phoneController,
                "Phone",
                "9876543210",
                icon: LucideIcons.phone,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        _buildTextField(
          context,
          _bioController,
          "Bio",
          "Tell us about yourself...",
          maxLines: 3,
        ),
        const SizedBox(height: 24),
        _buildTextField(
          context,
          _linkedinController,
          "LinkedIn",
          "https://linkedin.com/in/...",
          icon: LucideIcons.linkedin,
        ),
        const SizedBox(height: 12),
        _buildTextField(
          context,
          _githubController,
          "GitHub",
          "https://github.com/...",
          icon: LucideIcons.github,
        ),
        const SizedBox(height: 12),
        _buildTextField(
          context,
          _websiteController,
          "Website",
          "https://portfolio.com",
          icon: LucideIcons.globe,
        ),
      ],
    );
  }

  Widget _buildPersonalActionButtons(StudentProfile profile) {
    if (_isEditingPersonal) {
      return Row(
        children: [
          Expanded(
            child: PinnacleButton(
              label: "Cancel",
              variant: ButtonVariant.ghost,
              onPressed: () => setState(() => _isEditingPersonal = false),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: PinnacleButton(
              label: "Save Details",
              variant: ButtonVariant.primary,
              isLoading: _isSavingPersonal,
              onPressed: _savePersonalChanges,
            ),
          ),
        ],
      );
    }

    // CHANGED: Split into two buttons (Edit Profile & Resume Builder)
    return Row(
      children: [
        Expanded(
          child: PinnacleButton(
            label: "Edit Info",
            variant: ButtonVariant.outline,
            icon: const Icon(LucideIcons.pencil, size: 16),
            onPressed: () => _togglePersonalEdit(profile),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: PinnacleButton(
            label: "Resume",
            variant: ButtonVariant.primary,
            icon: const Icon(LucideIcons.fileText, size: 16),
            onPressed: () {
              // IMPORTANT: rootNavigator: true ensures the resume builder
              // covers the bottom navigation bar.
              Navigator.of(context, rootNavigator: true).push(
                MaterialPageRoute(
                  builder: (context) => const ResumeBuilderScreen(),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  // --- Item Renderers (Rows inside ProfileSectionCard) ---

  Widget _buildEducationItem(BuildContext context, Education edu, bool isLast) {
    return _buildRowItem(
      context,
      icon: LucideIcons.graduationCap,
      color: AppColors.primary500,
      title: edu.institution,
      subtitle: "${edu.degree} in ${edu.branch}",
      meta: "${_formatDate(edu.startDate)} - ${_formatDate(edu.endDate)}",
      verificationStatus: edu.verificationStatus,
      isLast: isLast,
      onEdit: () => _openEditSheet(ItemType.education, edu.id, {
        'institution': edu.institution,
        'degree': edu.degree,
        'branch': edu.branch,
        'location': edu.location,
        'startDate': edu.startDate,
        'endDate': edu.endDate,
        'gpa': edu.gpa,
        'achievements': edu.achievements,
      }),
      onDelete: () => _deleteItem(
        ref.read(profileProvider.notifier).removeEducation,
        edu.id,
      ),
    );
  }

  Widget _buildExperienceItem(
    BuildContext context,
    Experience exp,
    bool isLast,
  ) {
    return _buildRowItem(
      context,
      icon: LucideIcons.briefcase,
      color: AppColors.accentTeal500,
      title: exp.position,
      subtitle: exp.company,
      meta:
          "${_formatDate(exp.startDate)} - ${exp.current ? 'Present' : _formatDate(exp.endDate)}",
      body: exp.description,
      verificationStatus: exp.verificationStatus,
      isLast: isLast,
      onEdit: () => _openEditSheet(ItemType.experience, exp.id, {
        'position': exp.position,
        'company': exp.company,
        'location': exp.location,
        'startDate': exp.startDate,
        'endDate': exp.endDate,
        'current': exp.current,
        'description': exp.description,
        'highlights': exp.highlights,
      }),
      onDelete: () => _deleteItem(
        ref.read(profileProvider.notifier).removeExperience,
        exp.id,
      ),
    );
  }

  Widget _buildProjectItem(BuildContext context, Project proj, bool isLast) {
    return _buildRowItem(
      context,
      icon: LucideIcons.folderGit2,
      color: AppColors.accentPurple500,
      title: proj.title,
      subtitle: "${proj.domain} • ${proj.tools.join(", ")}",
      body: proj.description,
      verificationStatus: proj.verificationStatus,
      isLast: isLast,
      // Removed footer chip
      onEdit: () => _openEditSheet(ItemType.project, proj.id, {
        'title': proj.title,
        'domain': proj.domain,
        'tools': proj.tools,
        'description': proj.description,
        'outcomes': proj.outcomes,
        'referenceUrl': proj.referenceUrl,
      }),
      onDelete: () => _deleteItem(
        ref.read(profileProvider.notifier).removeProject,
        proj.id,
      ),
      // Moved view logic here
      onView: (proj.referenceUrl != null && proj.referenceUrl!.isNotEmpty)
          ? () => launchUrlString(proj.referenceUrl!)
          : null,
      viewIcon: LucideIcons.globe,
    );
  }

  Widget _buildCertificationItem(
    BuildContext context,
    Certification cert,
    bool isLast,
  ) {
    return _buildRowItem(
      context,
      icon: LucideIcons.award,
      color: Colors.orange,
      title: cert.name,
      subtitle: cert.issuer,
      meta: "Issued: ${_formatDate(cert.date)}",
      verificationStatus: cert.verificationStatus,
      isLast: isLast,
      // Removed footer chip
      onEdit: () => _openEditSheet(ItemType.certification, cert.id, {
        'name': cert.name,
        'issuer': cert.issuer,
        'date': cert.date,
        'url': cert.url,
      }),
      onDelete: () => _deleteItem(
        ref.read(profileProvider.notifier).removeCertification,
        cert.id,
      ),
      // Moved view logic here
      onView: (cert.url != null && cert.url!.isNotEmpty)
          ? () => launchUrlString(cert.url!)
          : null,
      viewIcon: LucideIcons.externalLink,
    );
  }

  Widget _buildSkillItem(BuildContext context, Skill skill, bool isLast) {
    final theme = Theme.of(context);
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    skill.category,
                    style: GoogleFonts.inter(
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                  Row(
                    children: [
                      _buildActionIcon(
                        icon: LucideIcons.pencil,
                        onTap: () => _openEditSheet(ItemType.skill, skill.id, {
                          'category': skill.category,
                          'items': skill.items,
                          'proficiency': skill.proficiency?.name,
                        }),
                      ),
                      const SizedBox(width: 8),
                      _buildActionIcon(
                        icon: LucideIcons.trash2,
                        color: AppColors.error.withValues(alpha: 0.8),
                        onTap: () => _deleteItem(
                          ref.read(profileProvider.notifier).removeSkill,
                          skill.id,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: skill.items
                    .map(
                      (item) => Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: theme.scaffoldBackgroundColor,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(
                            color: theme.colorScheme.outline.withValues(
                              alpha: 0.5,
                            ),
                          ),
                        ),
                        child: Text(
                          item,
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ),
                    )
                    .toList(),
              ),
            ],
          ),
        ),
        if (!isLast)
          Divider(
            height: 1,
            color: theme.colorScheme.outline.withValues(alpha: 0.5),
          ),
      ],
    );
  }

  Widget _buildLanguagesWrap(BuildContext context, List<Language> languages) {
    final theme = Theme.of(context);
    return Wrap(
      spacing: 4,
      children: languages.map((lang) {
        return GestureDetector(
          onTap: () => _openEditSheet(ItemType.language, lang.id, {
            'name': lang.name,
            'proficiency': lang.proficiency.name,
          }),
          child: Chip(
            label: Text(
              "${lang.name} • ${_formatProficiency(lang.proficiency)}",
              style: GoogleFonts.inter(fontSize: 13),
            ),
            deleteIcon: const Icon(LucideIcons.x, size: 14),
            onDeleted: () => _deleteItem(
              ref.read(profileProvider.notifier).removeLanguage,
              lang.id,
            ),
            backgroundColor: theme.scaffoldBackgroundColor,
            side: BorderSide(
              color: theme.colorScheme.outline.withValues(alpha: 0.5),
            ),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(50),
            ),
          ),
        );
      }).toList(),
    );
  }

  // --- Helper Widgets ---

  Widget _buildRowItem(
    BuildContext context, {
    required IconData icon,
    required Color color,
    required String title,
    required String subtitle,
    VerificationStatus? verificationStatus,
    String? meta,
    String? body,
    Widget? footer,
    VoidCallback? onEdit,
    VoidCallback? onDelete,
    VoidCallback? onView, // New: Callback for view action
    IconData? viewIcon, // New: Icon for view action
    required bool isLast,
  }) {
    final theme = Theme.of(context);

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(20),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // --- 1. Icon Box & Verification Badge Column ---
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: color.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    alignment: Alignment.center,
                    child: Icon(icon, color: color, size: 20),
                  ),
                  if (verificationStatus != null) ...[
                    const SizedBox(height: 8),
                    VerificationBadge(status: verificationStatus),
                  ],
                ],
              ),

              const SizedBox(width: 16),

              // --- 2. Content ---
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: GoogleFonts.inter(
                        fontWeight: FontWeight.w600,
                        fontSize: 15,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: GoogleFonts.inter(
                        color: theme.colorScheme.onSurfaceVariant,
                        fontSize: 14,
                      ),
                    ),
                    if (meta != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        meta,
                        style: GoogleFonts.inter(
                          color: theme.colorScheme.onSurfaceVariant.withValues(
                            alpha: 0.8,
                          ),
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                    if (body != null) ...[
                      const SizedBox(height: 12),
                      Text(
                        body,
                        style: GoogleFonts.inter(
                          color: theme.colorScheme.onSurfaceVariant,
                          height: 1.5,
                          fontSize: 13,
                        ),
                      ),
                    ],
                    if (footer != null) footer,
                  ],
                ),
              ),

              // --- 3. Actions ---
              const SizedBox(width: 8),
              Column(
                children: [
                  if (onEdit != null)
                    _buildActionIcon(
                      icon: LucideIcons.pencil,
                      onTap: onEdit,
                    ),
                  if (onDelete != null) ...[
                    _buildActionIcon(
                      icon: LucideIcons.trash2,
                      color: AppColors.error.withValues(alpha: 0.8),
                      onTap: onDelete,
                    ),
                  ],
                  // Added View Icon here
                  if (onView != null) ...[
                    _buildActionIcon(
                      icon: viewIcon ?? LucideIcons.externalLink,
                      color: AppColors.primary500,
                      onTap: onView,
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
        if (!isLast)
          Divider(
            height: 1,
            color: theme.colorScheme.outline.withValues(alpha: 0.5),
          ),
      ],
    );
  }

  Widget _buildActionIcon({
    required IconData icon,
    required VoidCallback onTap,
    Color? color,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.all(6),
        child: Icon(icon, size: 16, color: color ?? Colors.grey),
      ),
    );
  }

  // --- Simple Utilities ---

  Widget _buildIconText(BuildContext context, IconData icon, String text) {
    return Row(
      children: [
        Icon(
          icon,
          size: 14,
          color: Theme.of(context).colorScheme.onSurfaceVariant,
        ),
        const SizedBox(width: 6),
        Text(text, style: GoogleFonts.inter(fontSize: 14)),
      ],
    );
  }

  Widget _buildSocialBtn(BuildContext context, IconData icon, String url) {
    return InkWell(
      onTap: () => launchUrlString(url),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: Theme.of(context).colorScheme.outline.withValues(alpha: 0.5),
          ),
        ),
        child: Icon(icon, size: 20),
      ),
    );
  }

  Widget _buildTextField(
    BuildContext context,
    TextEditingController c,
    String l,
    String h, {
    IconData? icon,
    int maxLines = 1,
  }) {
    final theme = Theme.of(context);
    return TextField(
      controller: c,
      maxLines: maxLines,
      decoration: InputDecoration(
        labelText: l,
        hintText: h,
        hintStyle: TextStyle(
          color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
        ),
        labelStyle: TextStyle(
          color: theme.colorScheme.onSurface.withValues(alpha: 0.7),
        ),
        prefixIcon: icon != null ? Icon(icon, size: 18) : null,
        filled: true,
        fillColor: theme.scaffoldBackgroundColor,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: theme.colorScheme.outline.withValues(alpha: 0.3),
          ),
        ),
      ),
    );
  }

  String _formatDate(String? isoString) {
    if (isoString == null) return "Present";
    try {
      final date = DateTime.parse(isoString);
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return "${months[date.month - 1]} ${date.year}";
    } catch (_) {
      return isoString;
    }
  }

  String _formatProficiency(ProficiencyLevel level) {
    return level.name[0] + level.name.substring(1).toLowerCase();
  }
}
