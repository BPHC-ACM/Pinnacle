import 'package:flutter/material.dart';

class AnimatedGridBackground extends StatefulWidget {
  final Color? color;
  const AnimatedGridBackground({super.key, this.color});

  @override
  State<AnimatedGridBackground> createState() => _AnimatedGridBackgroundState();
}

class _AnimatedGridBackgroundState extends State<AnimatedGridBackground>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10), // Slower animation for background
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
    // Default to a subtle version of primary or onSurface
    final gridColor =
        widget.color ?? theme.colorScheme.onSurface.withValues(alpha: 0.05);

    return CustomPaint(
      painter: GridPainter(
        color: gridColor,
        animationValue: _controller.value,
      ),
      child: Container(), // Fills the available space
    );
  }
}

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

    // Draw vertical lines
    for (double i = -step + offset; i < size.width; i += step) {
      canvas.drawLine(Offset(i, 0), Offset(i, size.height), paint);
    }

    // Draw horizontal lines
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
