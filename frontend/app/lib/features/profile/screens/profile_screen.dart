import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher_string.dart';

import '../../auth/providers/auth_provider.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/components/pinnacle_button.dart';
import '../models/student_profile_model.dart';
import '../providers/profile_provider.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  // State for Inline Editing
  bool _isEditing = false;
  bool _isSaving = false;

  // Controllers
  late TextEditingController _titleController;
  late TextEditingController _bioController;
  late TextEditingController _phoneController;
  late TextEditingController _locationController;
  late TextEditingController _linkedinController;
  late TextEditingController _githubController;
  late TextEditingController _websiteController;

  @override
  void initState() {
    super.initState();
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
    _titleController.dispose();
    _bioController.dispose();
    _phoneController.dispose();
    _locationController.dispose();
    _linkedinController.dispose();
    _githubController.dispose();
    _websiteController.dispose();
    super.dispose();
  }

  void _populateControllers(StudentProfile profile) {
    _titleController.text = profile.title ?? '';
    _bioController.text = profile.bio ?? '';
    _phoneController.text = profile.phone ?? '';
    _locationController.text = profile.location ?? '';
    _linkedinController.text = profile.linkedin ?? '';
    _githubController.text = profile.github ?? '';
    _websiteController.text = profile.website ?? '';
  }

  void _toggleEditMode(StudentProfile profile) {
    if (_isEditing) {
      setState(() => _isEditing = false);
    } else {
      _populateControllers(profile);
      setState(() => _isEditing = true);
    }
  }

  Future<void> _saveChanges() async {
    setState(() => _isSaving = true);
    try {
      await ref
          .read(profileProvider.notifier)
          .updateProfile(
            title: _titleController.text,
            bio: _bioController.text,
            phone: _phoneController.text,
            location: _locationController.text,
            linkedin: _linkedinController.text,
            github: _githubController.text,
            website: _websiteController.text,
          );

      if (mounted) {
        setState(() {
          _isEditing = false;
          _isSaving = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Profile updated successfully'),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSaving = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final profileState = ref.watch(profileProvider);
    final theme = Theme.of(context);
    // final colorScheme = theme.colorScheme;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: profileState.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
        data: (profile) => Stack(
          children: [
            // 1. Gradient Banner Background
            _buildBanner(context),

            // 2. Main Scrollable Content
            CustomScrollView(
              physics: const BouncingScrollPhysics(),
              slivers: [
                SliverAppBar(
                  backgroundColor: Colors.transparent,
                  surfaceTintColor: Colors.transparent,
                  pinned: true,
                  elevation: 0,
                  centerTitle: true,
                  title: Text(
                    _isEditing ? "Edit Profile" : "",
                    style: GoogleFonts.inter(
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                  actions: [
                    if (!_isEditing)
                      IconButton(
                        onPressed: () =>
                            ref.read(authProvider.notifier).logout(),
                        icon: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.2),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            LucideIcons.logOut,
                            color: Colors.white,
                            size: 18,
                          ),
                        ),
                        tooltip: 'Logout',
                      ),
                    const SizedBox(width: 16),
                  ],
                ),

                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  sliver: SliverList(
                    delegate: SliverChildListDelegate([
                      const SizedBox(height: 60),

                      // --- Floating Profile Card ---
                      _buildFloatingHeaderCard(context, profile),

                      const SizedBox(height: 32),

                      // --- Edit/Save Actions ---
                      _buildActionButtons(profile),

                      const SizedBox(height: 40),

                      // --- Content Sections ---
                      if (!_isEditing) ...[
                        _buildSectionHeader(context, "Education"),
                        ...profile.education.map(
                          (e) => _buildEducationCard(context, e),
                        ),
                        if (profile.education.isEmpty)
                          _buildEmptySectionText(
                            context,
                            "No education details added.",
                          ),

                        const SizedBox(height: 32),

                        _buildSectionHeader(context, "Experience"),
                        ...profile.experiences.map(
                          (e) => _buildExperienceCard(context, e),
                        ),
                        if (profile.experiences.isEmpty)
                          _buildEmptySectionText(
                            context,
                            "No experience added yet.",
                          ),

                        const SizedBox(height: 32),

                        if (profile.skills.isNotEmpty) ...[
                          _buildSectionHeader(context, "Skills"),
                          _buildSkillsCard(context, profile.skills),
                          const SizedBox(height: 32),
                        ],

                        // Projects Section - Always visible now
                        _buildSectionHeader(context, "Projects"),
                        ...profile.projects.map(
                          (p) => _buildProjectCard(context, p),
                        ),
                        if (profile.projects.isEmpty)
                          _buildEmptySectionText(
                            context,
                            "No projects added yet.",
                          ),
                        const SizedBox(height: 32),
                      ],

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

  // --- Visual Components ---

  Widget _buildBanner(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      height: 280,
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [theme.colorScheme.primary, theme.colorScheme.tertiary],
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            top: -50,
            right: -50,
            child: CircleAvatar(
              radius: 100,
              backgroundColor: Colors.white.withOpacity(0.1),
            ),
          ),
          Positioned(
            bottom: 50,
            left: -30,
            child: CircleAvatar(
              radius: 60,
              backgroundColor: Colors.white.withOpacity(0.1),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFloatingHeaderCard(
    BuildContext context,
    StudentProfile profile,
  ) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(16), // Compact padding
      decoration: BoxDecoration(
        // Uses Theme Card Color
        color: theme.cardTheme.color,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 24,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Column(
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
          const SizedBox(height: 8), // Reduced spacing

          Text(
            profile.name,
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: theme.colorScheme.onSurface,
            ),
          ),

          const SizedBox(height: 4), // Reduced spacing

          AnimatedSize(
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOutBack,
            alignment: Alignment.topCenter,
            child: _isEditing
                ? _buildEditFields(context)
                : _buildViewFields(context, profile),
          ),
        ],
      ),
    );
  }

  Widget _buildViewFields(BuildContext context, StudentProfile profile) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    final title = profile.title;
    final location = profile.location;
    final bio = profile.bio;
    final phone = profile.phone;

    final hasSocials =
        (profile.linkedin?.isNotEmpty ?? false) ||
        (profile.github?.isNotEmpty ?? false) ||
        (profile.website?.isNotEmpty ?? false) ||
        profile.email.isNotEmpty;

    return Column(
      children: [
        if (title != null && title.isNotEmpty)
          Text(
            title,
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              fontSize: 16,
              color: colorScheme.primary,
              fontWeight: FontWeight.w500,
            ),
          )
        else
          _buildEmptyText(context, "No headline added"),

        const SizedBox(height: 8), // Reduced spacing

        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (location != null && location.isNotEmpty)
              _buildIconText(context, LucideIcons.mapPin, location)
            else
              _buildEmptyText(context, "No location"),

            const SizedBox(width: 16),
            Container(width: 1, height: 16, color: colorScheme.outline),
            const SizedBox(width: 16),

            if (phone != null && phone.isNotEmpty)
              _buildIconText(context, LucideIcons.phone, phone)
            else
              _buildEmptyText(context, "No phone"),
          ],
        ),

        const SizedBox(height: 12), // Reduced spacing

        if (bio != null && bio.isNotEmpty)
          Text(
            bio,
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              fontSize: 15,
              height: 1.6,
              color: colorScheme.onSurfaceVariant,
            ),
          )
        else
          Container(
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 24),
            decoration: BoxDecoration(
              // Uses Theme Background
              color: theme.scaffoldBackgroundColor,
              borderRadius: BorderRadius.circular(8),
            ),
            child: _buildEmptyText(
              context,
              "No bio added yet. Tap edit to introduce yourself!",
            ),
          ),

        const SizedBox(height: 12), // Reduced spacing
        Divider(color: colorScheme.outline.withOpacity(0.5)),
        const SizedBox(height: 12), // Reduced spacing

        if (hasSocials)
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
                _buildSocialBtn(
                  context,
                  LucideIcons.linkedin,
                  profile.linkedin!,
                ),
              if (profile.github?.isNotEmpty == true)
                _buildSocialBtn(context, LucideIcons.github, profile.github!),
              if (profile.website?.isNotEmpty == true)
                _buildSocialBtn(context, LucideIcons.globe, profile.website!),
            ],
          )
        else
          _buildEmptyText(context, "No social links added"),
      ],
    );
  }

  Widget _buildEditFields(BuildContext context) {
    final theme = Theme.of(context);
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
                "+1 234...",
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
        Align(
          alignment: Alignment.centerLeft,
          child: Text(
            "Social Links",
            style: GoogleFonts.inter(
              fontWeight: FontWeight.w600,
              fontSize: 14,
              color: theme.colorScheme.onSurface,
            ),
          ),
        ),
        const SizedBox(height: 12),
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

  Widget _buildActionButtons(StudentProfile profile) {
    if (_isEditing) {
      return Row(
        children: [
          Expanded(
            child: PinnacleButton(
              label: "Cancel",
              variant: ButtonVariant.ghost,
              onPressed: () => setState(() => _isEditing = false),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: PinnacleButton(
              label: "Save Details",
              variant: ButtonVariant.primary,
              isLoading: _isSaving,
              onPressed: _saveChanges,
            ),
          ),
        ],
      );
    } else {
      return SizedBox(
        width: double.infinity,
        child: PinnacleButton(
          label: "Edit Profile Details",
          variant: ButtonVariant.outline,
          icon: const Icon(LucideIcons.pencil, size: 16),
          onPressed: () => _toggleEditMode(profile),
        ),
      );
    }
  }

  // --- Helpers ---

  Widget _buildEmptyText(BuildContext context, String text) {
    return Text(
      text,
      style: GoogleFonts.inter(
        fontSize: 14,
        fontStyle: FontStyle.italic,
        color: Theme.of(context).colorScheme.onSurfaceVariant.withOpacity(0.7),
      ),
      textAlign: TextAlign.center,
    );
  }

  Widget _buildEmptySectionText(BuildContext context, String text) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 20),
      child: Text(
        text,
        style: GoogleFonts.inter(
          color: Theme.of(
            context,
          ).colorScheme.onSurfaceVariant.withOpacity(0.7),
          fontSize: 14,
          fontStyle: FontStyle.italic,
        ),
      ),
    );
  }

  Widget _buildIconText(BuildContext context, IconData icon, String text) {
    final colorScheme = Theme.of(context).colorScheme;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: colorScheme.onSurfaceVariant),
        const SizedBox(width: 6),
        Text(
          text,
          style: GoogleFonts.inter(fontSize: 14, color: colorScheme.onSurface),
        ),
      ],
    );
  }

  Widget _buildSocialBtn(BuildContext context, IconData icon, String url) {
    final theme = Theme.of(context);
    return InkWell(
      onTap: () => launchUrlString(url),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          // Uses Theme scaffold background instead of neutral50
          color: theme.scaffoldBackgroundColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: theme.colorScheme.outline.withOpacity(0.5)),
        ),
        child: Icon(icon, size: 20, color: theme.colorScheme.onSurface),
      ),
    );
  }

  Widget _buildTextField(
    BuildContext context,
    TextEditingController controller,
    String label,
    String hint, {
    IconData? icon,
    int maxLines = 1,
  }) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return TextField(
      controller: controller,
      maxLines: maxLines,
      style: GoogleFonts.inter(fontSize: 14, color: colorScheme.onSurface),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: GoogleFonts.inter(color: colorScheme.onSurfaceVariant),
        hintText: hint,
        hintStyle: GoogleFonts.inter(
          color: colorScheme.onSurfaceVariant.withOpacity(0.5),
        ),
        floatingLabelBehavior: FloatingLabelBehavior.always,
        prefixIcon: icon != null
            ? Icon(icon, size: 18, color: colorScheme.onSurfaceVariant)
            : null,
        filled: true,
        // Uses scaffold background for input fill to contrast with the card
        fillColor: theme.scaffoldBackgroundColor,
        contentPadding: const EdgeInsets.all(16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: colorScheme.outline.withOpacity(0.3)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: colorScheme.primary),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16, left: 4),
      child: Text(
        title,
        style: GoogleFonts.inter(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: Theme.of(context).colorScheme.onSurface,
        ),
      ),
    );
  }

  // --- Section Cards (Read-only) ---

  Widget _buildEducationCard(BuildContext context, Education edu) {
    return _buildContentCard(
      context,
      icon: LucideIcons.graduationCap,
      color: AppColors
          .primary500, // Semantic color remains (OK to keep semantic colors)
      title: edu.institution,
      subtitle: "${edu.degree} in ${edu.branch}",
      meta: "${_formatDate(edu.startDate)} - ${_formatDate(edu.endDate)}",
    );
  }

  Widget _buildExperienceCard(BuildContext context, Experience exp) {
    return _buildContentCard(
      context,
      icon: LucideIcons.briefcase,
      color: AppColors.accentTeal500,
      title: exp.position,
      subtitle: exp.company,
      meta:
          "${_formatDate(exp.startDate)} - ${exp.current ? 'Present' : _formatDate(exp.endDate)}",
      body: exp.description,
    );
  }

  Widget _buildProjectCard(BuildContext context, Project proj) {
    return _buildContentCard(
      context,
      icon: LucideIcons.folderGit2,
      color: AppColors.accentPurple500,
      title: proj.name,
      subtitle: proj.technologies.join(" • "),
      footer: (proj.url != null || proj.repoUrl != null)
          ? Row(
              children: [
                if (proj.repoUrl != null)
                  _buildLink(context, "Code", proj.repoUrl!),
                if (proj.repoUrl != null && proj.url != null)
                  const SizedBox(width: 16),
                if (proj.url != null)
                  _buildLink(context, "Live Demo", proj.url!),
              ],
            )
          : null,
    );
  }

  Widget _buildSkillsCard(BuildContext context, List<Skill> skills) {
    final theme = Theme.of(context);
    final allSkills = skills.expand((s) => s.items).toList();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: theme.cardTheme.color,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: theme.colorScheme.outline.withOpacity(0.5)),
      ),
      child: Wrap(
        spacing: 8,
        runSpacing: 10,
        children: allSkills
            .map(
              (skill) => Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: theme.scaffoldBackgroundColor,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: theme.colorScheme.outline.withOpacity(0.3),
                  ),
                ),
                child: Text(
                  skill,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
              ),
            )
            .toList(),
      ),
    );
  }

  // --- Shared Card Logic ---

  Widget _buildContentCard(
    BuildContext context, {
    required IconData icon,
    required Color color,
    required String title,
    required String subtitle,
    String? meta,
    String? body,
    Widget? footer,
  }) {
    final theme = Theme.of(context);

    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: theme.cardTheme.color,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: theme.colorScheme.outline.withOpacity(0.5)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 22),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: GoogleFonts.inter(
                        fontWeight: FontWeight.w600,
                        fontSize: 16,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                    const SizedBox(height: 4),
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
                          color: theme.colorScheme.onSurfaceVariant.withOpacity(
                            0.8,
                          ),
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
          if (body != null && body.isNotEmpty) ...[
            const SizedBox(height: 16),
            Text(
              body,
              style: GoogleFonts.inter(
                color: theme.colorScheme.onSurfaceVariant,
                height: 1.5,
              ),
            ),
          ],
          if (footer != null) ...[const SizedBox(height: 16), footer],
        ],
      ),
    );
  }

  Widget _buildLink(BuildContext context, String text, String url) {
    return InkWell(
      onTap: () => launchUrlString(url),
      child: Text(
        text,
        style: GoogleFonts.inter(
          color: AppColors.primary500,
          fontWeight: FontWeight.w600,
          fontSize: 13,
          decoration: TextDecoration.underline,
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
}
