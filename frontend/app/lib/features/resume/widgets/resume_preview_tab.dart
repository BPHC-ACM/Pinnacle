import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:printing/printing.dart';

import '../../../core/theme/app_colors.dart';
import '../providers/resume_builder_provider.dart';

class ResumePreviewTab extends ConsumerWidget {
  const ResumePreviewTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(resumeBuilderProvider);

    return Column(
      children: [
        // Status Bar (Sync Status)
        if (state.isSaving || state.isGenerating)
          LinearProgressIndicator(
            backgroundColor: AppColors.neutral100,
            valueColor: AlwaysStoppedAnimation<Color>(
              state.isSaving ? AppColors.warning : AppColors.primary500,
            ),
            minHeight: 2,
          ),

        // PDF View
        Expanded(
          child: state.pdfBytes == null
              ? _buildLoadingState()
              : _buildPdfPreview(state.pdfBytes!),
        ),
      ],
    );
  }

  Widget _buildLoadingState() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(),
          SizedBox(height: 16),
          Text(
            'Generating Preview...',
            style: TextStyle(color: AppColors.neutral500),
          ),
        ],
      ),
    );
  }

  Widget _buildPdfPreview(Uint8List bytes) {
    // PdfPreview from the 'printing' package
    return PdfPreview(
      // The build callback requires a Future, so we wrap our bytes
      build: (format) => Future.value(bytes),
      
      // We disable the built-in actions toolbar to use our own AppBar buttons
      useActions: false, 
      
      // Visual styling to make it look like a document on a background
      scrollViewDecoration: const BoxDecoration(
        color: AppColors.neutral100, 
      ),
      pdfPreviewPageDecoration: const BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      // Use standard scrolling (can zoom/pan)
      canChangeOrientation: false,
      canChangePageFormat: false,
      canDebug: false,
    );
  }
}