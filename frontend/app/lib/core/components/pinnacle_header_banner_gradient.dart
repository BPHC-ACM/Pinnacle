import 'package:flutter/material.dart';
import 'pinnacle_header_banner.dart';

class PinnacleHeaderBannerGradient extends StatelessWidget {
  final double height;

  const PinnacleHeaderBannerGradient({
    super.key,
    this.height = 280,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Stack(
      children: [
        PinnacleHeaderBanner(height: height),
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
    );
  }
}
