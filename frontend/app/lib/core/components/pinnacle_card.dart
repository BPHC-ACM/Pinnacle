import 'package:flutter/material.dart';

class PinnacleCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;

  const PinnacleCard({super.key, required this.child, this.padding});

  @override
  Widget build(BuildContext context) {
    // Relies on global CardTheme defined in AppTheme
    return Card(
      child: Padding(
        padding: padding ?? const EdgeInsets.all(24.0), // p-6 default
        child: child,
      ),
    );
  }
}