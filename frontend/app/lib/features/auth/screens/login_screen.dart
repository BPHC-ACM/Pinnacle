// lib/features/auth/screens/login_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../../../../core/components/pinnacle_button.dart';
import '../../../../core/constants/app_assets.dart';
import '../../../../core/theme/app_icons.dart';
import '../../../../core/theme/app_colors.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 5),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final authState = ref.watch(authProvider);

    return Scaffold(
      body: Stack(
        children: [
          // Animated Grid Background Pattern
          Positioned.fill(
            child: Opacity(
              opacity: 0.05,
              child: AnimatedBuilder(
                animation: _controller,
                builder: (context, child) {
                  return CustomPaint(
                    painter: GridPainter(
                      color: theme.colorScheme.onSurface,
                      animationValue: _controller.value,
                    ),
                  );
                },
              ),
            ),
          ),

          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: 24.0,
                vertical: 32.0,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Image.asset(
                    AppAssets.appLogo,
                    width: 226,
                    fit: BoxFit.contain,
                  ),

                  const SizedBox(height: 60),

                  RichText(
                    textAlign: TextAlign.center,
                    text: TextSpan(
                      style: theme.textTheme.displayLarge?.copyWith(
                        fontSize: 42,
                        height: 1.1,
                        color: theme.colorScheme.onSurface,
                      ),
                      children: [
                        const TextSpan(text: "Your Career Journey\n"),
                        WidgetSpan(
                          child: ShaderMask(
                            shaderCallback: (bounds) => LinearGradient(
                              colors: [
                                theme.colorScheme.primary,
                                theme.colorScheme.tertiary,
                              ],
                            ).createShader(bounds),
                            child: Text(
                              "Starts Here",
                              style: theme.textTheme.displayLarge?.copyWith(
                                fontSize: 42,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Subtitle
                  Text(
                    "Discover opportunities, connect with top companies, and take control of your professional growth.",
                    textAlign: TextAlign.center,
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: AppColors.neutral500,
                    ),
                  ),
                  const SizedBox(height: 48),

                  // Login Button
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: PinnacleButton(
                      label: "Sign in with Google",
                      variant: ButtonVariant.primary,
                      // Pass the loading state to the button
                      isLoading: authState.isLoading,
                      icon: SvgPicture.string(
                        AppIcons.googleSvg,
                        width: 20,
                        height: 20,
                      ),
                      onPressed: () {
                        ref.read(authProvider.notifier).login();
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// Grid Painter
class GridPainter extends CustomPainter {
  final Color color;
  final double animationValue;

  GridPainter({required this.color, required this.animationValue});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 1;

    const step = 40.0;
    final offset = animationValue * step;

    for (double i = -step + offset; i < size.width; i += step) {
      canvas.drawLine(Offset(i, 0), Offset(i, size.height), paint);
    }

    for (double i = -step + offset; i < size.height; i += step) {
      canvas.drawLine(Offset(0, i), Offset(size.width, i), paint);
    }
  }

  @override
  bool shouldRepaint(covariant GridPainter oldDelegate) {
    return oldDelegate.animationValue != animationValue ||
        oldDelegate.color != color;
  }
}
