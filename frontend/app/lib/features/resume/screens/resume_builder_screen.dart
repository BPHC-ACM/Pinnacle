import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:printing/printing.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/theme/app_colors.dart';
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

    return Scaffold(
      appBar: AppBar(
        title: _buildAppBarTitle(state),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary500,
          unselectedLabelColor: AppColors.neutral500,
          indicatorColor: AppColors.primary500,
          tabs: const [
            Tab(text: 'Editor', icon: Icon(LucideIcons.pencil)),
            Tab(text: 'Preview', icon: Icon(LucideIcons.eye)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.printer),
            tooltip: 'Print',
            onPressed: state.pdfBytes == null
                ? null
                : () async {
                    await Printing.layoutPdf(
                      onLayout: (_) => Future.value(state.pdfBytes!),
                      name: state.resumeTitle,
                    );
                  },
          ),
        ],
      ),
      body: _buildBody(state),

      // Added FAB for Quick Export
      floatingActionButton: state.pdfBytes != null
          ? FloatingActionButton.extended(
              onPressed: () => _sharePdf(state.resumeTitle, state.pdfBytes!),
              label: const Text("Export PDF"),
              icon: const Icon(LucideIcons.download),
              backgroundColor: AppColors.primary500,
            )
          : null,
    );
  }

  Widget _buildAppBarTitle(ResumeBuilderState state) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          state.resumeTitle,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        if (state.isSaving)
          const Text(
            'Saving...',
            style: TextStyle(fontSize: 12, color: AppColors.neutral500),
          )
        else if (state.isGenerating)
          const Text(
            'Updating Preview...',
            style: TextStyle(fontSize: 12, color: AppColors.neutral500),
          ),
      ],
    );
  }

  Widget _buildBody(ResumeBuilderState state) {
    if (state.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state.errorMessage != null) {
      return Center(child: Text(state.errorMessage!));
    }

    if (state.previewData == null) {
      return _buildEmptyState();
    }

    return TabBarView(
      controller: _tabController,
      physics: const NeverScrollableScrollPhysics(),
      children: const [
        ResumeEditorTab(),
        ResumePreviewTab(),
      ],
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(LucideIcons.userX, size: 64, color: Colors.grey),
          const SizedBox(height: 16),
          const Text("Complete your profile to build a resume."),
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
