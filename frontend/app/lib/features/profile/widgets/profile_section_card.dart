import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

class ProfileSectionCard extends StatefulWidget {
  final String title;
  final Widget? action;
  final List<Widget> children;
  final bool initiallyExpanded;

  const ProfileSectionCard({
    super.key,
    required this.title,
    required this.children,
    this.action,
    this.initiallyExpanded = true,
  });

  @override
  State<ProfileSectionCard> createState() => _ProfileSectionCardState();
}

class _ProfileSectionCardState extends State<ProfileSectionCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _iconTurns;
  late Animation<double> _heightFactor;

  bool _isExpanded = false;

  @override
  void initState() {
    super.initState();

    _controller = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );

    _iconTurns = Tween<double>(begin: 0.0, end: 0.5).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
    );

    _heightFactor = _controller.drive(
      CurveTween(curve: Curves.easeOut),
    );

    // Restore state from PageStorage if available, otherwise use initial
    _isExpanded =
        PageStorage.of(context).readState(context) as bool? ??
        widget.initiallyExpanded;

    if (_isExpanded) {
      _controller.value = 1.0;
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleTap() {
    setState(() {
      _isExpanded = !_isExpanded;

      if (_isExpanded) {
        _controller.forward();
      } else {
        _controller.reverse();
      }

      // Persist expansion state across scrolls
      PageStorage.of(context).writeState(context, _isExpanded);
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: theme.cardTheme.color ?? colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: colorScheme.outline.withValues(alpha: 0.5)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          InkWell(
            onTap: _handleTap,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      widget.title,
                      style: GoogleFonts.inter(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                        color: colorScheme.onSurface,
                      ),
                    ),
                  ),
                  if (widget.action != null) ...[
                    widget.action!,
                    const SizedBox(width: 12),
                  ],
                  RotationTransition(
                    turns: _iconTurns,
                    child: Icon(
                      LucideIcons.chevronDown,
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Animated body (no sliding)
          SizeTransition(
            sizeFactor: _heightFactor,
            axisAlignment: -1.0,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Divider(
                  height: 1,
                  color: colorScheme.outline.withValues(alpha: 0.5),
                ),
                if (widget.children.isEmpty)
                  Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Center(
                      child: Text(
                        "No details added yet.",
                        style: GoogleFonts.inter(
                          color: colorScheme.onSurface.withValues(alpha: 0.5),
                          fontSize: 14,
                        ),
                      ),
                    ),
                  )
                else
                  ...widget.children,
                const SizedBox(height: 8),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
