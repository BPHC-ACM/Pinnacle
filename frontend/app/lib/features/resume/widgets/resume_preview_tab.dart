// lib/features/resume/widgets/resume_preview_tab.dart
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:printing/printing.dart';

import '../providers/resume_builder_provider.dart';

class ResumePreviewTab extends ConsumerWidget {
  const ResumePreviewTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(resumeBuilderProvider);
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Column(
      children: [
        if (state.isSaving || state.isGenerating)
          LinearProgressIndicator(
            backgroundColor: theme.scaffoldBackgroundColor,
            valueColor: AlwaysStoppedAnimation<Color>(
              state.isSaving ? colorScheme.error : colorScheme.primary,
            ),
            minHeight: 2,
          ),

        Expanded(
          child: Container(
            color: colorScheme.surfaceContainerHighest,
            child: (state.isGenerating || state.pdfBytes == null)
                ? _buildLoadingState(context)
                : _buildPdfPreview(context, state.pdfBytes!),
          ),
        ),
      ],
    );
  }

  Widget _buildLoadingState(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(),
          const SizedBox(height: 16),
          Text(
            'Generating Preview...',
            style: GoogleFonts.inter(
              color: colorScheme.onSurfaceVariant,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPdfPreview(BuildContext context, Uint8List bytes) {
    final colorScheme = Theme.of(context).colorScheme;
    return PdfPreview(
      build: (format) => Future.value(bytes),
      useActions: false,
      scrollViewDecoration: BoxDecoration(
        color: colorScheme.surfaceContainer,
      ),
      pdfPreviewPageDecoration: const BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 8,
            offset: Offset(0, 4),
          ),
        ],
      ),
      canChangeOrientation: false,
      canChangePageFormat: false,
      canDebug: false,
      loadingWidget: const Center(child: CircularProgressIndicator()),
    );
  }
}
