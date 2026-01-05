import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

class MainNavScaffold extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const MainNavScaffold({super.key, required this.navigationShell});

  void _onNavTap(int index) {
    if (index != navigationShell.currentIndex) {
      HapticFeedback.lightImpact();
      navigationShell.goBranch(
        index,
        initialLocation: index == navigationShell.currentIndex,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final currentIndex = navigationShell.currentIndex;

    // Radius logic for perfect concentricity
    const double outerRadius = 100.0;
    const double navHeight = 85.0;

    return Scaffold(
      extendBody: true,
      body: navigationShell,
      bottomNavigationBar: SafeArea(
        bottom: true,
        child: Container(
          // Increased bottom padding slightly to let the deeper shadow breathe
          padding: const EdgeInsets.fromLTRB(40, 0, 40, 25),
          color: Colors.transparent,
          child: Stack(
            alignment: Alignment.center,
            children: [
              // 1. Deep Shadow Layer (Multi-layered for depth)
              Container(
                height: navHeight,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(outerRadius),
                  boxShadow: [
                    // Broader, softer ambient shadow for lift
                    BoxShadow(
                      color: Colors.black.withOpacity(0.2),
                      blurRadius: 35,
                      offset: const Offset(0, 15),
                      spreadRadius: -5,
                    ),
                    // Tighter, darker shadow for definition right underneath
                    BoxShadow(
                      color: Colors.black.withOpacity(0.15),
                      blurRadius: 10,
                      offset: const Offset(0, 5),
                      spreadRadius: -2,
                    ),
                  ],
                ),
              ),

              // 2. Glass Effect Layer (More translucent)
              ClipRRect(
                borderRadius: BorderRadius.circular(outerRadius),
                child: BackdropFilter(
                  // Increased blur slightly for a stronger frosted look
                  filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                  child: Container(
                    height: navHeight,
                    // Key change: Reduced opacity significantly from 0.75 to 0.3
                    // This lets the background and blur show through much more.
                    color: colorScheme.surface.withOpacity(0.30),
                  ),
                ),
              ),

              // 3. Border Overlay Layer (Slightly more defined)
              IgnorePointer(
                child: Container(
                  height: navHeight,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(outerRadius),
                    border: Border.all(
                      // Increased opacity slightly so the edge isn't lost
                      // against varied backgrounds now that it's more transparent.
                      color: colorScheme.onSurface.withOpacity(0.12),
                      width: 1.5,
                      strokeAlign: BorderSide.strokeAlignInside,
                    ),
                  ),
                ),
              ),

              // 4. Content Layer (Unchanged)
              SizedBox(
                height: navHeight,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _buildNavItem(
                      context: context,
                      icon: LucideIcons.fileText,
                      label: 'Home',
                      index: 0,
                      currentIndex: currentIndex,
                    ),
                    _buildNavItem(
                      context: context,
                      icon: LucideIcons.briefcase,
                      label: 'Jobs',
                      index: 1,
                      currentIndex: currentIndex,
                    ),
                    _buildNavItem(
                      context: context,
                      icon: LucideIcons.user,
                      label: 'Profile',
                      index: 2,
                      currentIndex: currentIndex,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // _buildNavItem remains exactly the same as your original code
  Widget _buildNavItem({
    required BuildContext context,
    required IconData icon,
    required String label,
    required int index,
    required int currentIndex,
  }) {
    final bool isSelected = currentIndex == index;
    final colorScheme = Theme.of(context).colorScheme;

    return GestureDetector(
      onTap: () => _onNavTap(index),
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOutQuad,
        padding: EdgeInsets.symmetric(
          horizontal: isSelected ? 20 : 12,
          vertical: 12,
        ),
        decoration: BoxDecoration(
          color: isSelected ? colorScheme.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(100),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: colorScheme.primary.withOpacity(0.25),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ]
              : [],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              curve: Curves.fastOutSlowIn,
              transform: Matrix4.translationValues(0, isSelected ? -1 : 0, 0),
              child: Icon(
                icon,
                size:
                    22, // Lucide icons often look better slightly smaller than Material
                color: isSelected
                    ? colorScheme.onPrimary
                    : colorScheme.onSurfaceVariant.withOpacity(0.6),
              ),
            ),
            AnimatedSize(
              duration: const Duration(milliseconds: 150),
              curve: Curves.easeOut,
              child: isSelected
                  ? Padding(
                      padding: const EdgeInsets.only(left: 10),
                      child: Text(
                        label,
                        maxLines: 1,
                        overflow: TextOverflow.clip,
                        style: TextStyle(
                          color: colorScheme.onPrimary,
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 0.3,
                        ),
                      ),
                    )
                  : const SizedBox.shrink(),
            ),
          ],
        ),
      ),
    );
  }
}
