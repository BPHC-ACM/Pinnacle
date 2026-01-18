import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:printing/printing.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/components/pinnacle_header_banner.dart';
import '../providers/resume_builder_provider.dart';
import '../widgets/resume_editor_tab.dart';
import '../widgets/resume_preview_tab.dart';

class ResumeBuilderScreen extends ConsumerStatefulWidget {
  final String? resumeId;

  const ResumeBuilderScreen({super.key, this.resumeId});

  @override
  ConsumerState<ResumeBuilderScreen> createState() =>
      _ResumeBuilderScreenState();
}

class _ResumeBuilderScreenState extends ConsumerState<ResumeBuilderScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(resumeBuilderProvider.notifier).initialize(id: widget.resumeId);
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _sharePdf(String title, Uint8List bytes) async {
    await Printing.sharePdf(
      bytes: bytes,
      filename: '${title.replaceAll(' ', '_')}.pdf',
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(resumeBuilderProvider);
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) {
          return [
            SliverAppBar(
              expandedHeight: 220.0,
              pinned: true,
              floating: true,
              backgroundColor: theme.scaffoldBackgroundColor,
              surfaceTintColor: Colors.transparent,
              elevation: 0,
              forceElevated: innerBoxIsScrolled,
              leading: IconButton(
                icon: const Icon(LucideIcons.arrowLeft, color: Colors.white),
                onPressed: () => Navigator.pop(context),
              ),
              actions: [
                if (state.pdfBytes != null)
                  IconButton(
                    icon: const Icon(LucideIcons.printer, color: Colors.white),
                    tooltip: 'Print',
                    onPressed: () async {
                      await Printing.layoutPdf(
                        onLayout: (_) => Future.value(state.pdfBytes!),
                        name: state.resumeTitle,
                      );
                    },
                  ),
              ],
              flexibleSpace: FlexibleSpaceBar(
                collapseMode: CollapseMode.parallax,
                background: Stack(
                  fit: StackFit.expand,
                  children: [
                    Stack(
                      children: [
                        const PinnacleHeaderBanner(height: 280),
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
                    ),
                    Positioned(
                      top: 80,
                      left: 0,
                      right: 0,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            "Resume Builder",
                            style: GoogleFonts.inter(
                              fontSize: 26,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 8),
                          if (state.isSaving)
                            Text(
                              'Saving...',
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                color: Colors.white.withValues(alpha: 0.8),
                              ),
                            )
                          else if (state.isGenerating)
                            Text(
                              'Updating Preview...',
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                color: Colors.white.withValues(alpha: 0.8),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              bottom: PreferredSize(
                preferredSize: const Size.fromHeight(60),
                child: Container(
                  decoration: BoxDecoration(
                    color: theme.scaffoldBackgroundColor,
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(30),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 10,
                        offset: const Offset(0, -2),
                      ),
                    ],
                  ),
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                  child: TabBar(
                    controller: _tabController,
                    labelColor: colorScheme.primary,
                    unselectedLabelColor: colorScheme.onSurfaceVariant,
                    indicatorColor: colorScheme.primary,
                    indicatorSize: TabBarIndicatorSize.label,
                    indicatorWeight: 3,
                    dividerColor: colorScheme.outline.withValues(alpha: 0.5),
                    labelStyle: GoogleFonts.inter(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                    unselectedLabelStyle: GoogleFonts.inter(
                      fontWeight: FontWeight.w500,
                      fontSize: 14,
                    ),
                    tabs: const [
                      Tab(
                        text: 'Editor',
                        icon: Icon(LucideIcons.pencil, size: 18),
                      ),
                      Tab(
                        text: 'Preview',
                        icon: Icon(LucideIcons.eye, size: 18),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ];
        },
        body: state.isLoading
            ? const Center(child: CircularProgressIndicator())
            : state.errorMessage != null
            ? Center(child: Text(state.errorMessage!))
            : state.previewData == null
            ? _buildEmptyState(context)
            : TabBarView(
                controller: _tabController,
                children: const [ResumeEditorTab(), ResumePreviewTab()],
              ),
      ),
      floatingActionButton: state.pdfBytes != null
          ? FloatingActionButton.extended(
              onPressed: () => _sharePdf(state.resumeTitle, state.pdfBytes!),
              label: Text(
                "Export PDF",
                style: GoogleFonts.inter(
                  fontWeight: FontWeight.w600,
                  color: colorScheme.onPrimary,
                ),
              ),
              icon: Icon(LucideIcons.download, color: colorScheme.onPrimary),
              backgroundColor: colorScheme.primary,
              elevation: 4,
            )
          : null,
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            LucideIcons.userX,
            size: 64,
            color: colorScheme.onSurfaceVariant,
          ),
          const SizedBox(height: 16),
          Text(
            "Complete your profile to build a resume.",
            style: GoogleFonts.inter(color: colorScheme.onSurfaceVariant),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Go to Profile"),
          ),
        ],
      ),
    );
  }
}
