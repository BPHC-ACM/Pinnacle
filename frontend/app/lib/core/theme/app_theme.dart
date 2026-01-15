import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTheme {
  // --- Typography (Inter) ---
  static TextTheme _buildTextTheme(TextTheme base) {
    return GoogleFonts.interTextTheme(base).copyWith(
      displayLarge: GoogleFonts.inter(
        fontSize: 36,
        fontWeight: FontWeight.bold,
        height: 1.1,
      ), // H1
      headlineMedium: GoogleFonts.inter(
        fontSize: 30,
        fontWeight: FontWeight.bold,
        height: 1.2,
      ), // H2
      headlineSmall: GoogleFonts.inter(
        fontSize: 24,
        fontWeight: FontWeight.w600,
        height: 1.3,
      ), // H3
      bodyLarge: GoogleFonts.inter(fontSize: 16, height: 1.5), // Body
      bodyMedium: GoogleFonts.inter(
        fontSize: 14,
        height: 1.5,
      ), // Caption/Button
    );
  }

  // --- Light Theme ---
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: AppColors.neutral50, // --background

      colorScheme: const ColorScheme.light(
        primary: AppColors.primary500,
        // In Light mode, Accent is Teal
        tertiary: AppColors.accentTeal500,
        tertiaryContainer: AppColors.accentTeal100,

        surface: Colors.white, // --card
        onSurface: AppColors.neutral900, // --foreground

        error: AppColors.error,
        outline: AppColors.neutral200, // --border
      ),

      textTheme: _buildTextTheme(ThemeData.light().textTheme),

      // Global Card Style
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8), // --radius: 0.5rem
          side: const BorderSide(color: AppColors.neutral200),
        ),
      ),
    );
  }

  // --- Dark Theme ---
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.neutral950, // --background

      colorScheme: const ColorScheme.dark(
        primary: AppColors.primary500,
        // In Dark mode, Accent is Purple
        tertiary: AppColors.accentPurple500,
        tertiaryContainer: Color(0xFF2E1065), // deep purple for container

        surface: AppColors.neutral900, // --card
        onSurface: AppColors.neutral50, // --foreground

        error: AppColors.error,
        outline: AppColors.neutral800, // --border
      ),

      textTheme: _buildTextTheme(ThemeData.dark().textTheme).apply(
        bodyColor: AppColors.neutral50,
        displayColor: AppColors.neutral50,
      ),

      cardTheme: CardThemeData(
        color: AppColors.neutral900,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: const BorderSide(color: AppColors.neutral800),
        ),
      ),
    );
  }
}
