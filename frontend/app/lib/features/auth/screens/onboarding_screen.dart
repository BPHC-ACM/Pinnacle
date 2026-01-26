import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../core/components/pinnacle_button.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/logger.dart';
import '../providers/auth_provider.dart';

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final _formKey = GlobalKey<FormState>();

  // Controllers
  late TextEditingController _nameController;
  late TextEditingController _branchController;
  late TextEditingController _addressController;
  late TextEditingController _parentNameController;
  late TextEditingController _parentPhoneController;

  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    final user = ref.read(authProvider).user;

    // UX Polish 1: Pre-fill data from Google Auth
    _nameController = TextEditingController(text: user?.name ?? '');
    _addressController = TextEditingController(text: user?.location ?? '');

    _branchController = TextEditingController();
    _parentNameController = TextEditingController();
    _parentPhoneController = TextEditingController();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _branchController.dispose();
    _addressController.dispose();
    _parentNameController.dispose();
    _parentPhoneController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    try {
      final data = {
        'name': _nameController.text.trim(),
        'branch': _branchController.text.trim(),
        'address': _addressController.text.trim(),
        'parentName': _parentNameController.text.trim(),
        'parentMobileNumber': _parentPhoneController.text.trim(),
      };

      await ref.read(authProvider.notifier).completeOnboarding(data);
      // Navigation handled by Router redirect
    } catch (e) {
      logger.e("Onboarding failed", error: e);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to submit: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final user = ref.watch(authProvider).user;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Setup Profile'),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          // UX Polish 2: Logout button to prevent getting stuck
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => ref.read(authProvider.notifier).logout(),
            tooltip: 'Logout',
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                // UX Polish 3: User Identity Header
                if (user?.picture != null)
                  CircleAvatar(
                    radius: 40,
                    backgroundImage: NetworkImage(user!.picture!),
                    backgroundColor: theme.colorScheme.primaryContainer,
                  )
                else
                  CircleAvatar(
                    radius: 40,
                    backgroundColor: theme.colorScheme.primary,
                    child: Text(
                      user?.name.characters.first.toUpperCase() ?? "U",
                      style: theme.textTheme.headlineMedium?.copyWith(
                        color: theme.colorScheme.onPrimary,
                      ),
                    ),
                  ),

                const SizedBox(height: 16),

                Text(
                  "Welcome, ${user?.name.split(' ').first ?? 'Student'}!",
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),

                const SizedBox(height: 4),

                Text(
                  user?.email ?? "",
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: AppColors.neutral500,
                  ),
                ),

                const SizedBox(height: 32),

                const Divider(),

                const SizedBox(height: 24),

                // --- Form Fields ---
                _buildTextField(
                  label: "Full Name",
                  controller: _nameController,
                  icon: Icons.person_outline,
                  textCapitalization: TextCapitalization.words,
                ),

                const SizedBox(height: 20),

                _buildTextField(
                  label: "Branch",
                  controller: _branchController,
                  icon: Icons.school_outlined,
                  hint: "e.g. Computer Science",
                  textCapitalization: TextCapitalization.words,
                ),

                const SizedBox(height: 20),

                _buildTextField(
                  label: "Permanent Address",
                  controller: _addressController,
                  icon: Icons.location_on_outlined,
                  maxLines: 2,
                  textCapitalization: TextCapitalization.sentences,
                ),

                const SizedBox(height: 20),

                _buildTextField(
                  label: "Parent/Guardian Name",
                  controller: _parentNameController,
                  icon: Icons.family_restroom_outlined,
                  textCapitalization: TextCapitalization.words,
                ),

                const SizedBox(height: 20),

                _buildTextField(
                  label: "Parent Mobile Number",
                  controller: _parentPhoneController,
                  icon: Icons.phone_outlined,
                  keyboardType: TextInputType.phone,
                  validator: (value) {
                    if (value == null || value.isEmpty) return 'Required';
                    if (value.length < 10) return 'Invalid number';
                    return null;
                  },
                ),

                const SizedBox(height: 40),

                // UX Polish 4: Sticky-style button area
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: PinnacleButton(
                    label: "Complete Setup",
                    isLoading: _isSubmitting,
                    onPressed: _submit,
                  ),
                ),

                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
    required IconData icon,
    String? hint,
    TextInputType? keyboardType,
    int maxLines = 1,
    String? Function(String?)? validator,
    TextCapitalization textCapitalization = TextCapitalization.none,
  }) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: AppColors.neutral700,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          maxLines: maxLines,
          textCapitalization: textCapitalization,
          style: GoogleFonts.inter(fontSize: 14),
          validator:
              validator ??
              (value) =>
                  value == null || value.isEmpty ? '$label is required' : null,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: GoogleFonts.inter(
              color: AppColors.neutral400.withValues(alpha: 0.6),
            ),
            prefixIcon: Icon(icon, size: 20, color: AppColors.neutral400),
            filled: true,
            fillColor: theme.colorScheme.surface,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 14,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: theme.colorScheme.outline.withValues(alpha: .5),
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: theme.colorScheme.outline.withValues(alpha: .5),
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.primary500),
            ),
          ),
        ),
      ],
    );
  }
}
