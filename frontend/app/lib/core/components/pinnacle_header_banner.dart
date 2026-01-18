import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class PinnacleHeaderBanner extends StatefulWidget {
  final double height;

  const PinnacleHeaderBanner({
    super.key,
    this.height = 280,
  });

  @override
  State<PinnacleHeaderBanner> createState() => _PinnacleHeaderBannerState();
}

class _PinnacleHeaderBannerState extends State<PinnacleHeaderBanner>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    // Replicates the animation duration/feel from the Login Screen
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
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

    // "Brighter like the linear gradient": using the primary/tertiary gradient
    // as the background for the grid to maintain vibrancy.
    return Container(
      height: widget.height,
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.primary500,
            theme.colorScheme.tertiary,
          ],
        ),
      ),
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return CustomPaint(
            painter: _PinnacleGridPainter(
              color: Colors.white.withValues(alpha: 0.15), // White grid lines
              animationValue: _controller.value,
            ),
          );
        },
      ),
    );
  }
}

class _PinnacleGridPainter extends CustomPainter {
  final Color color;
  final double animationValue;

  _PinnacleGridPainter({required this.color, required this.animationValue});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 1;

    const step = 40.0;
    final offset = animationValue * step;

    // Vertical Lines
    for (double i = -step + offset; i < size.width; i += step) {
      canvas.drawLine(Offset(i, 0), Offset(i, size.height), paint);
    }

    // Horizontal Lines
    for (double i = -step + offset; i < size.height; i += step) {
      canvas.drawLine(Offset(0, i), Offset(size.width, i), paint);
    }
  }

  @override
  bool shouldRepaint(covariant _PinnacleGridPainter oldDelegate) {
    return oldDelegate.animationValue != animationValue ||
        oldDelegate.color != color;
  }
}
