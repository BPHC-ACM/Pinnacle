import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

class MainNavScaffold extends StatefulWidget {
  final StatefulNavigationShell navigationShell;
  final String currentPath;

  const MainNavScaffold({
    super.key,
    required this.navigationShell,
    required this.currentPath,
  });

  @override
  State<MainNavScaffold> createState() => _MainNavScaffoldState();
}

class _MainNavScaffoldState extends State<MainNavScaffold> {
  bool _isNavBarVisible = true;

  void _onNavTap(int index) {
    if (index != widget.navigationShell.currentIndex) {
      HapticFeedback.lightImpact();
      widget.navigationShell.goBranch(
        index,
        initialLocation: index == widget.navigationShell.currentIndex,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final currentIndex = widget.navigationShell.currentIndex;

    const double outerRadius = 100.0;
    const double navHeight = 85.0;

    final bool showNavBar = const [
      '/dashboard',
      '/jobs',
      '/profile',
    ].contains(widget.currentPath);

    return Scaffold(
      extendBody: true,

      body: NotificationListener<UserScrollNotification>(
        onNotification: (notification) {
          if (notification.direction == ScrollDirection.reverse) {
            if (_isNavBarVisible) setState(() => _isNavBarVisible = false);
          } else if (notification.direction == ScrollDirection.forward) {
            if (!_isNavBarVisible) setState(() => _isNavBarVisible = true);
          }
          return true;
        },
        child: widget.navigationShell,
      ),
      bottomNavigationBar: showNavBar
          ? AnimatedSlide(
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeInOut,

              offset: _isNavBarVisible ? Offset.zero : const Offset(0, 2),
              child: SafeArea(
                bottom: true,
                child: Container(
                  padding: const EdgeInsets.fromLTRB(40, 0, 40, 25),
                  color: Colors.transparent,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      Container(
                        height: navHeight,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(outerRadius),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.2),
                              blurRadius: 35,
                              offset: const Offset(0, 15),
                              spreadRadius: -5,
                            ),
                            BoxShadow(
                              color: Colors.black.withOpacity(0.15),
                              blurRadius: 10,
                              offset: const Offset(0, 5),
                              spreadRadius: -2,
                            ),
                          ],
                        ),
                      ),

                      ClipRRect(
                        borderRadius: BorderRadius.circular(outerRadius),
                        child: BackdropFilter(
                          filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                          child: Container(
                            height: navHeight,
                            color: colorScheme.surface.withOpacity(0.30),
                          ),
                        ),
                      ),

                      IgnorePointer(
                        child: Container(
                          height: navHeight,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(outerRadius),
                            border: Border.all(
                              color: colorScheme.onSurface.withOpacity(0.12),
                              width: 1.5,
                              strokeAlign: BorderSide.strokeAlignInside,
                            ),
                          ),
                        ),
                      ),

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
            )
          : null,
    );
  }

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
                size: 22,
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
