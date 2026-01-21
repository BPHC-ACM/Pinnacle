import 'package:flutter/material.dart';

class PinnacleCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final BorderRadius? borderRadius;

  const PinnacleCard({
    super.key,
    required this.child,
    this.padding,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: borderRadius ?? BorderRadius.circular(16),
      ),
      clipBehavior: Clip.antiAlias, // IMPORTANT for InkWell
      child: Padding(
        padding: padding ?? const EdgeInsets.all(24.0),
        child: child,
      ),
    );
  }
}
