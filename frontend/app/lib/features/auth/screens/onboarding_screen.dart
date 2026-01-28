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

  // Step State
  int _currentStep = 0; // 0: Personal, 1: Parents
  bool _isSubmitting = false;

  // --- Constants (Matching Web) ---
  final List<String> _beBranches = [
    'B.E. Chemical',
    'B.E. Civil',
    'B.E. Computer Science',
    'B.E. Electronics and Communication',
    'B.E. Electrical and Electronics',
    'B.E. Electronics and Instrumentation',
    'B.E. Mathematics and Computing',
    'B.E. Mechanical',
    'B.E. Environmental and Sustainability',
  ];

  final List<String> _mscBranches = [
    'M.Sc. Biological Sciences',
    'M.Sc. Chemistry',
    'M.Sc. Economics',
    'M.Sc. Mathematics',
    'M.Sc. Physics',
    'M.Sc. Semiconductor and Nanoscience',
  ];

  List<String> get _singleDegreeBranches => [
    ..._beBranches,
    'B. Pharm.',
    ..._mscBranches,
  ];

  // --- Controllers ---
  // Personal
  late TextEditingController _nameController;
  late TextEditingController _idNumberController;
  String? _selectedDegreeType; // 'single' | 'dual'
  String? _selectedBranch; // For Single
  String? _selectedBeBranch; // For Dual
  String? _selectedMscBranch; // For Dual

  // Address
  late TextEditingController _addressLine1Controller;
  late TextEditingController _addressLine2Controller;
  late TextEditingController _cityController;
  late TextEditingController _pinCodeController;

  // Father
  late TextEditingController _fatherNameController;
  late TextEditingController _fatherPhoneController;
  late TextEditingController _fatherJobSectorController;
  late TextEditingController _fatherJobPositionController;

  // Mother
  late TextEditingController _motherNameController;
  late TextEditingController _motherPhoneController;
  late TextEditingController _motherJobSectorController;
  late TextEditingController _motherJobPositionController;

  @override
  void initState() {
    super.initState();
    final user = ref.read(authProvider).user;

    // Personal
    _nameController = TextEditingController(text: user?.name ?? '');
    _idNumberController = TextEditingController();

    // Address
    _addressLine1Controller = TextEditingController();
    _addressLine2Controller = TextEditingController();
    _cityController = TextEditingController();
    _pinCodeController = TextEditingController();

    // Father
    _fatherNameController = TextEditingController();
    _fatherPhoneController = TextEditingController();
    _fatherJobSectorController = TextEditingController();
    _fatherJobPositionController = TextEditingController();

    // Mother
    _motherNameController = TextEditingController();
    _motherPhoneController = TextEditingController();
    _motherJobSectorController = TextEditingController();
    _motherJobPositionController = TextEditingController();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _idNumberController.dispose();
    _addressLine1Controller.dispose();
    _addressLine2Controller.dispose();
    _cityController.dispose();
    _pinCodeController.dispose();
    _fatherNameController.dispose();
    _fatherPhoneController.dispose();
    _fatherJobSectorController.dispose();
    _fatherJobPositionController.dispose();
    _motherNameController.dispose();
    _motherPhoneController.dispose();
    _motherJobSectorController.dispose();
    _motherJobPositionController.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (_formKey.currentState!.validate()) {
      setState(() => _currentStep = 1);
    }
  }

  void _prevStep() {
    setState(() => _currentStep = 0);
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    try {
      // Construct payload matching UserDetails DTO
      final data = {
        // Personal
        'name': _nameController.text.trim(),
        'idNumber': _idNumberController.text.trim(),
        'degreeType': _selectedDegreeType,
        if (_selectedDegreeType == 'single') 'branch': _selectedBranch,
        if (_selectedDegreeType == 'dual') ...{
          'beBranch': _selectedBeBranch,
          'mscBranch': _selectedMscBranch,
        },

        // Address
        'addressLine1': _addressLine1Controller.text.trim(),
        'addressLine2': _addressLine2Controller.text.trim(),
        'city': _cityController.text.trim(),
        'pinCode': _pinCodeController.text.trim(),

        // Father
        'fatherName': _fatherNameController.text.trim(),
        'fatherMobileNumber': _fatherPhoneController.text.trim(),
        'fatherJobSector': _fatherJobSectorController.text.trim(),
        'fatherJobPosition': _fatherJobPositionController.text.trim(),

        // Mother
        'motherName': _motherNameController.text.trim(),
        'motherMobileNumber': _motherPhoneController.text.trim(),
        'motherJobSector': _motherJobSectorController.text.trim(),
        'motherJobPosition': _motherJobPositionController.text.trim(),
      };

      await ref.read(authProvider.notifier).completeOnboarding(data);
      // Navigation is handled by auth state change or router in main app
    } catch (e) {
      logger.e("Onboarding failed", error: e);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to submit: ${e.toString()}'),
            backgroundColor: AppColors.error,
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
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => ref.read(authProvider.notifier).logout(),
            tooltip: 'Logout',
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Progress Indicator
            LinearProgressIndicator(
              value: _currentStep == 0 ? 0.5 : 1.0,
              backgroundColor: theme.colorScheme.surface,
              valueColor: AlwaysStoppedAnimation<Color>(
                theme.colorScheme.primary,
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24.0),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header Section
                      Center(
                        child: Column(
                          children: [
                            if (user?.picture != null)
                              CircleAvatar(
                                radius: 40,
                                backgroundImage: NetworkImage(user!.picture!),
                                backgroundColor:
                                    theme.colorScheme.primaryContainer,
                              )
                            else
                              CircleAvatar(
                                radius: 40,
                                backgroundColor: theme.colorScheme.primary,
                                child: Text(
                                  user?.name.characters.first.toUpperCase() ??
                                      "U",
                                  style: theme.textTheme.headlineMedium
                                      ?.copyWith(
                                        color: theme.colorScheme.onPrimary,
                                      ),
                                ),
                              ),
                            const SizedBox(height: 16),
                            Text(
                              _currentStep == 0
                                  ? "Personal Details"
                                  : "Parent Details",
                              style: theme.textTheme.headlineSmall?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _currentStep == 0 ? "Step 1 of 2" : "Step 2 of 2",
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: AppColors.neutral500,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 32),

                      // Form Content
                      if (_currentStep == 0)
                        _buildPersonalStep()
                      else
                        _buildParentStep(),

                      const SizedBox(height: 32),

                      // Actions
                      Row(
                        children: [
                          if (_currentStep == 1) ...[
                            Expanded(
                              child: PinnacleButton(
                                label: "Back",
                                variant: ButtonVariant.outline,
                                onPressed: _prevStep,
                              ),
                            ),
                            const SizedBox(width: 16),
                          ],
                          Expanded(
                            child: PinnacleButton(
                              label: _currentStep == 0
                                  ? "Next"
                                  : "Complete Profile",
                              isLoading: _isSubmitting,
                              onPressed: _currentStep == 0
                                  ? _nextStep
                                  : _submit,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPersonalStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionHeader("Basic Info"),
        _buildTextField(
          label: "Full Name",
          controller: _nameController,
          hint: "Your full legal name",
          textCapitalization: TextCapitalization.words,
          required: true,
        ),
        _buildTextField(
          label: "ID Number",
          controller: _idNumberController,
          hint: "e.g., 2021A7PS0001P",
          textCapitalization: TextCapitalization.characters,
          required: true,
          validator: (val) {
            if (val == null || val.length != 13) {
              return 'Must be exactly 13 characters';
            }
            // Simple regex check matching web
            if (!RegExp(
              r'^[0-9]{4}[A-Z][0-9][A-Z]{2}[0-9]{4}[A-Z]$',
            ).hasMatch(val)) {
              return 'Invalid format';
            }
            return null;
          },
        ),

        // Degree Type Dropdown
        _buildDropdown(
          label: "Degree Type",
          value: _selectedDegreeType,
          items: const ['single', 'dual'],
          displayItems: const ['Single Degree', 'Dual Degree (B.E. + M.Sc.)'],
          onChanged: (val) {
            setState(() {
              _selectedDegreeType = val;
              // Reset dependent fields
              _selectedBranch = null;
              _selectedBeBranch = null;
              _selectedMscBranch = null;
            });
          },
        ),

        // Conditional Branch Dropdowns
        if (_selectedDegreeType == 'single')
          _buildDropdown(
            label: "Branch",
            value: _selectedBranch,
            items: _singleDegreeBranches,
            onChanged: (val) => setState(() => _selectedBranch = val),
          ),

        if (_selectedDegreeType == 'dual') ...[
          _buildDropdown(
            label: "B.E. Branch",
            value: _selectedBeBranch,
            items: _beBranches,
            onChanged: (val) => setState(() => _selectedBeBranch = val),
          ),
          _buildDropdown(
            label: "M.Sc. Branch",
            value: _selectedMscBranch,
            items: _mscBranches,
            onChanged: (val) => setState(() => _selectedMscBranch = val),
          ),
        ],

        const SizedBox(height: 16),
        _sectionHeader("Address Details"),

        _buildTextField(
          label: "Address Line 1",
          controller: _addressLine1Controller,
          hint: "Flat No, Building Name",
          textCapitalization: TextCapitalization.sentences,
          required: true,
        ),
        _buildTextField(
          label: "Address Line 2",
          controller: _addressLine2Controller,
          hint: "Street, Area, Locality",
          textCapitalization: TextCapitalization.sentences,
          required: true,
        ),
        Row(
          children: [
            Expanded(
              child: _buildTextField(
                label: "City",
                controller: _cityController,
                hint: "Mumbai",
                required: true,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildTextField(
                label: "PIN Code",
                controller: _pinCodeController,
                hint: "400001",
                keyboardType: TextInputType.number,
                required: true,
                validator: (v) => (v != null && RegExp(r'^\d{6}$').hasMatch(v))
                    ? null
                    : 'Invalid PIN',
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildParentStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Father
        _sectionHeader("Father's Details"),
        _buildTextField(
          label: "Name",
          controller: _fatherNameController,
          hint: "Father's Name",
          required: true,
        ),
        _buildTextField(
          label: "Mobile Number",
          controller: _fatherPhoneController,
          hint: "10-digit number",
          keyboardType: TextInputType.phone,
          required: true,
          validator: (v) =>
              (v != null && v.length == 10 && int.tryParse(v) != null)
              ? null
              : 'Invalid number',
        ),
        _buildTextField(
          label: "Job Sector",
          controller: _fatherJobSectorController,
          hint: "e.g. IT, Govt, Business",
          required: true,
        ),
        _buildTextField(
          label: "Job Position",
          controller: _fatherJobPositionController,
          hint: "e.g. Manager",
          required: true,
        ),

        const SizedBox(height: 24),

        // Mother
        _sectionHeader("Mother's Details"),
        _buildTextField(
          label: "Name",
          controller: _motherNameController,
          hint: "Mother's Name",
          required: true,
        ),
        _buildTextField(
          label: "Mobile Number",
          controller: _motherPhoneController,
          hint: "10-digit number",
          keyboardType: TextInputType.phone,
          required: true,
          validator: (v) =>
              (v != null && v.length == 10 && int.tryParse(v) != null)
              ? null
              : 'Invalid number',
        ),
        _buildTextField(
          label: "Job Sector",
          controller: _motherJobSectorController,
          hint: "e.g. Education, Govt",
          required: true,
        ),
        _buildTextField(
          label: "Job Position",
          controller: _motherJobPositionController,
          hint: "e.g. Teacher",
          required: true,
        ),
      ],
    );
  }

  // --- Helper Widgets matching Profile Section Styles ---

  Widget _sectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: GoogleFonts.inter(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Theme.of(context).colorScheme.primary,
            ),
          ),
          const SizedBox(height: 4),
          Divider(
            color: Theme.of(context).colorScheme.outline.withValues(alpha: 0.2),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
    String? hint,
    TextInputType? keyboardType,
    int maxLines = 1,
    bool required = false,
    String? Function(String?)? validator,
    TextCapitalization textCapitalization = TextCapitalization.none,
  }) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: theme.colorScheme.onSurfaceVariant,
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
                (value) {
                  if (required && (value == null || value.isEmpty)) {
                    return '$label is required';
                  }
                  return null;
                },
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: GoogleFonts.inter(
                color: AppColors.neutral400.withValues(alpha: 0.6),
              ),
              filled: true,
              fillColor: theme.colorScheme.surface,
              contentPadding: const EdgeInsets.all(16),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: theme.colorScheme.outline.withValues(alpha: 0.5),
                ),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: theme.colorScheme.outline.withValues(alpha: 0.5),
                ),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.primary500),
              ),
              errorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.error),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDropdown({
    required String label,
    required String? value,
    required List<String> items,
    List<String>? displayItems, // Optional labels
    required Function(String?) onChanged,
  }) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            initialValue: value,
            style: GoogleFonts.inter(
              fontSize: 14,
              color: theme.colorScheme.onSurface,
            ),
            decoration: InputDecoration(
              filled: true,
              fillColor: theme.colorScheme.surface,
              contentPadding: const EdgeInsets.all(16),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: theme.colorScheme.outline.withValues(alpha: 0.5),
                ),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: theme.colorScheme.outline.withValues(alpha: 0.5),
                ),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.primary500),
              ),
            ),
            items: List.generate(items.length, (index) {
              return DropdownMenuItem(
                value: items[index],
                child: Text(
                  displayItems != null ? displayItems[index] : items[index],
                  overflow: TextOverflow.ellipsis,
                ),
              );
            }),
            onChanged: onChanged,
            validator: (v) => v == null ? 'Required' : null,
          ),
        ],
      ),
    );
  }
}
