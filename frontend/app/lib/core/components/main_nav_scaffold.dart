import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

class MainNavScaffold extends StatefulWidget {
  final StatefulNavigationShell navigationShell;
  final List<Widget> children; // List of branch Navigators
  final String currentPath;

  const MainNavScaffold({
    super.key,
    required this.navigationShell,
    required this.children,
    required this.currentPath,
  });

  @override
  State<MainNavScaffold> createState() => _MainNavScaffoldState();
}

class _MainNavScaffoldState extends State<MainNavScaffold> {
  bool _isNavBarVisible = true;
  int _previousIndex = 0;

  @override
  void initState() {
    super.initState();
    _previousIndex = widget.navigationShell.currentIndex;
  }

  @override
  void didUpdateWidget(MainNavScaffold oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Update previous index only when the index actually changes
    if (widget.navigationShell.currentIndex !=
        oldWidget.navigationShell.currentIndex) {
      _previousIndex = oldWidget.navigationShell.currentIndex;
    }
  }

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
        child: AnimatedSwitcher(
          duration: const Duration(milliseconds: 300),
          // Use easeOut for both IN and OUT to create a "Push" feel
          // where the whole locking mechanism slows down together.
          switchInCurve: Curves.easeOut,
          switchOutCurve: Curves.easeOut,
          transitionBuilder: (Widget child, Animation<double> animation) {
            // Robustly identify if this child is the "incoming" or "outgoing" one
            // by checking the ValueKey we assigned below.
            final int val = (child.key as ValueKey<int>).value;
            final bool isIncoming = val == currentIndex;

            // Determine direction: Moving Right (0->1) or Left (1->0)
            final bool isMovingRight = currentIndex > _previousIndex;

            // Define offsets for a standard "Push" transition
            // Moving Right: Everything slides LEFT.
            // Moving Left: Everything slides RIGHT.

            Offset begin;
            Offset end;

            if (isMovingRight) {
              // SCENARIO: Moving Right (e.g. Home -> Jobs) -> Slide Left
              if (isIncoming) {
                // Incoming enters from Right (1.0 -> 0.0)
                begin = const Offset(1.0, 0.0);
                end = Offset.zero;
              } else {
                // Outgoing leaves to Left (0.0 -> -1.0)
                // (Driven by reverse animation 1.0 -> 0.0, so we map 1->0 to 0->-1)
                // Tween: lerp(-1, 0, t). At t=1 (start of reverse), val=0. At t=0 (end of reverse), val=-1.
                begin = const Offset(-1.0, 0.0);
                end = Offset.zero;
              }
            } else {
              // SCENARIO: Moving Left (e.g. Jobs -> Home) -> Slide Right
              if (isIncoming) {
                // Incoming enters from Left (-1.0 -> 0.0)
                begin = const Offset(-1.0, 0.0);
                end = Offset.zero;
              } else {
                // Outgoing leaves to Right (0.0 -> 1.0)
                // (Driven by reverse animation)
                begin = const Offset(1.0, 0.0);
                end = Offset.zero;
              }
            }

            return SlideTransition(
              position: Tween<Offset>(
                begin: begin,
                end: end,
              ).animate(animation),
              child: child,
            );
          },
          // IMPORTANT: Wrap child in KeyedSubtree so AnimatedSwitcher
          // can track it even if the widget instance changes.
          child: KeyedSubtree(
            key: ValueKey<int>(currentIndex),
            child: widget.children[currentIndex],
          ),
        ),
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
                              color: Colors.black.withValues(alpha: 0.2),
                              blurRadius: 35,
                              offset: const Offset(0, 15),
                              spreadRadius: -5,
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
                            color: colorScheme.surface.withValues(alpha: 0.30),
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
                              icon: LucideIcons.house,
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
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 22,
              color: isSelected
                  ? colorScheme.onPrimary
                  : colorScheme.onSurfaceVariant.withValues(alpha: 0.6),
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
                        style: TextStyle(
                          color: colorScheme.onPrimary,
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
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
