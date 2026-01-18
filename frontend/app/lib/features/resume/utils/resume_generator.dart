import 'dart:typed_data';

import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

import '../../profile/models/student_profile_model.dart';
import '../models/resume_model.dart';

Future<Uint8List> generateResumePdf(
  ResumePreviewData data,
  ResumeData resumeData,
) async {
  final pdf = pw.Document();

  // Load fonts (using standard fonts for reliability)
  final fontRegular = await PdfGoogleFonts.interRegular();
  final fontBold = await PdfGoogleFonts.interBold();
  final fontItalic = await PdfGoogleFonts.interItalic();

  // Load Images
  pw.ImageProvider? profileImage;
  if (data.profile.picture != null && data.profile.picture!.isNotEmpty) {
    try {
      profileImage = await networkImage(data.profile.picture!);
    } catch (_) {}
  }

  // BITS Logo (Static URL from your React component)
  final bitsLogo = await networkImage(
    'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/BITS_Pilani-Logo.svg/250px-BITS_Pilani-Logo.svg.png',
  );

  // Filter Data Logic (Matching React component)
  final filteredExperiences = data.experiences
      .where((e) => resumeData.selectedExperiences.contains(e.id))
      .toList();

  final filteredEducation = data.education
      .where((e) => resumeData.selectedEducation.contains(e.id))
      .toList();

  final filteredSkills = data.skills
      .where((e) => resumeData.selectedSkills.contains(e.id))
      .toList();

  final filteredProjects = data.projects
      .where((e) => resumeData.selectedProjects.contains(e.id))
      .toList();

  final filteredCertifications = data.certifications
      .where((e) => resumeData.selectedCertifications.contains(e.id))
      .toList();

  final filteredLanguages = data.languages
      .where((e) => resumeData.selectedLanguages.contains(e.id))
      .toList();

  // Sort Sections
  final sortedSections = List<ResumeSection>.from(resumeData.sections)
    ..sort((a, b) => a.order.compareTo(b.order));

  // Helper Methods
  String formatDate(String? dateStr) {
    if (dateStr == null) return '';
    try {
      final date = DateTime.parse(dateStr);
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      return '${months[date.month - 1]} ${date.year}';
    } catch (_) {
      return dateStr;
    }
  }

  String formatDuration(String startDate, String? endDate, bool current) {
    final start = formatDate(startDate);
    final end = current ? 'Present' : formatDate(endDate);
    return '$start - $end';
  }

  // Styles
  final primaryColor = PdfColor.fromHex(
    resumeData.styling?.primaryColor ?? '#111827',
  );
  final bodyStyle = pw.TextStyle(
    font: fontRegular,
    fontSize: 10,
    color: PdfColors.grey800,
  );
  final boldStyle = pw.TextStyle(
    font: fontBold,
    fontSize: 10.5,
    color: PdfColors.black,
  );
  final italicStyle = pw.TextStyle(
    font: fontItalic,
    fontSize: 9,
    color: PdfColors.grey700,
  );

  // Widget Builders
  pw.Widget buildHeader() {
    final contactItems = [
      data.profile.email,
      data.profile.phone,
      data.profile.location,
      data.profile.linkedin?.replaceAll(RegExp(r'https?://'), ''),
      data.profile.github?.replaceAll(RegExp(r'https?://'), ''),
      data.profile.website?.replaceAll(RegExp(r'https?://'), ''),
    ].where((e) => e != null && e.isNotEmpty).toList();

    return pw.Container(
      decoration: pw.BoxDecoration(
        border: pw.Border(bottom: pw.BorderSide(color: primaryColor, width: 2)),
      ),
      padding: const pw.EdgeInsets.only(bottom: 10),
      margin: const pw.EdgeInsets.only(bottom: 15),
      child: pw.Row(
        crossAxisAlignment: pw.CrossAxisAlignment.center,
        children: [
          pw.Expanded(
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Text(
                  data.profile.name,
                  style: pw.TextStyle(
                    font: fontBold,
                    fontSize: 24,
                    color: primaryColor,
                  ),
                ),
                if (data.profile.title != null)
                  pw.Text(
                    data.profile.title!.toUpperCase(),
                    style: pw.TextStyle(
                      font: fontRegular,
                      fontSize: 11,
                      letterSpacing: 1,
                    ),
                  ),
                pw.SizedBox(height: 4),
                pw.Wrap(
                  spacing: 6,
                  children: List.generate(contactItems.length, (index) {
                    final item = contactItems[index];
                    if (index < contactItems.length - 1) {
                      return pw.Row(
                        mainAxisSize: pw.MainAxisSize.min,
                        children: [
                          pw.Text(
                            item!,
                            style: pw.TextStyle(
                              fontSize: 9,
                              color: PdfColors.grey700,
                            ),
                          ),
                          pw.SizedBox(width: 6),
                          pw.Text(
                            "|",
                            style: pw.TextStyle(
                              fontSize: 9,
                              color: PdfColors.grey400,
                              fontBold: pw.Font.courierBold(),
                            ),
                          ),
                        ],
                      );
                    }
                    return pw.Text(
                      item!,
                      style: pw.TextStyle(
                        fontSize: 9,
                        color: PdfColors.grey700,
                      ),
                    );
                  }),
                ),
              ],
            ),
          ),
          pw.SizedBox(width: 15),
          if (profileImage != null)
            pw.Container(
              width: 80,
              height: 80,
              decoration: pw.BoxDecoration(
                borderRadius: pw.BorderRadius.circular(4),
                border: pw.Border.all(color: PdfColors.grey300),
                image: pw.DecorationImage(
                  image: profileImage,
                  fit: pw.BoxFit.cover,
                ),
              ),
            ),
          pw.SizedBox(width: 10),
          pw.Image(bitsLogo, width: 80, height: 50),
        ],
      ),
    );
  }

  pw.Widget buildSectionTitle(String title) {
    return pw.Container(
      margin: const pw.EdgeInsets.only(bottom: 8),
      padding: const pw.EdgeInsets.only(bottom: 2),
      decoration: const pw.BoxDecoration(
        border: pw.Border(bottom: pw.BorderSide(color: PdfColors.grey300)),
      ),
      child: pw.Text(
        title,
        style: pw.TextStyle(
          font: fontBold,
          fontSize: 10,
          color: primaryColor,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  pw.Widget buildExperience() {
    if (filteredExperiences.isEmpty) return pw.Container();
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: [
        buildSectionTitle('EXPERIENCE'),
        ...filteredExperiences.map(
          (exp) => pw.Container(
            margin: const pw.EdgeInsets.only(bottom: 8),
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text(exp.position, style: boldStyle),
                    pw.Text(
                      formatDuration(exp.startDate, exp.endDate, exp.current),
                      style: pw.TextStyle(
                        fontSize: 9,
                        fontWeight: pw.FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text(exp.company, style: italicStyle),
                    pw.Text(exp.location ?? '', style: italicStyle),
                  ],
                ),
                if (exp.highlights.isNotEmpty)
                  pw.Padding(
                    padding: const pw.EdgeInsets.only(left: 10, top: 2),
                    child: pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: exp.highlights
                          .map(
                            (h) => pw.Row(
                              crossAxisAlignment: pw.CrossAxisAlignment.start,
                              children: [
                                pw.Text("• ", style: bodyStyle),
                                pw.Expanded(
                                  child: pw.Text(h, style: bodyStyle),
                                ),
                              ],
                            ),
                          )
                          .toList(),
                    ),
                  ),
              ],
            ),
          ),
        ),
        pw.SizedBox(height: 4),
      ],
    );
  }

  pw.Widget buildEducation() {
    if (filteredEducation.isEmpty) return pw.Container();
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: [
        buildSectionTitle('EDUCATION'),
        ...filteredEducation.map(
          (edu) => pw.Container(
            margin: const pw.EdgeInsets.only(bottom: 8),
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text(edu.institution, style: boldStyle),
                    pw.Text(
                      formatDuration(edu.startDate, edu.endDate, false),
                      style: pw.TextStyle(
                        fontSize: 9,
                        fontWeight: pw.FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text(
                      '${edu.degree} in ${edu.branch}',
                      style: italicStyle,
                    ),
                    pw.Text(
                      edu.gpa != null
                          ? 'GPA: ${edu.gpa}'
                          : (edu.location ?? ''),
                      style: italicStyle,
                    ),
                  ],
                ),
                if (edu.achievements.isNotEmpty)
                  pw.Padding(
                    padding: const pw.EdgeInsets.only(left: 10, top: 2),
                    child: pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: edu.achievements
                          .map(
                            (h) => pw.Row(
                              crossAxisAlignment: pw.CrossAxisAlignment.start,
                              children: [
                                pw.Text("• ", style: bodyStyle),
                                pw.Expanded(
                                  child: pw.Text(h, style: bodyStyle),
                                ),
                              ],
                            ),
                          )
                          .toList(),
                    ),
                  ),
              ],
            ),
          ),
        ),
        pw.SizedBox(height: 4),
      ],
    );
  }

  pw.Widget buildProjects() {
    if (filteredProjects.isEmpty) return pw.Container();
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: [
        buildSectionTitle('PROJECTS'),
        ...filteredProjects.map(
          (proj) => pw.Container(
            margin: const pw.EdgeInsets.only(bottom: 8),
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Row(
                      children: [
                        pw.Text(proj.title, style: boldStyle),
                        if (proj.referenceUrl != null &&
                            proj.referenceUrl!.isNotEmpty)
                          pw.Text(
                            ' [Link]',
                            style: pw.TextStyle(
                              fontSize: 8,
                              color: PdfColors.grey700,
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
                if (proj.tools.isNotEmpty)
                  pw.Text(
                    'Stack: ${proj.tools.join(', ')}',
                    style: italicStyle,
                  ),
                if (proj.outcomes.isNotEmpty)
                  pw.Padding(
                    padding: const pw.EdgeInsets.only(left: 10, top: 2),
                    child: pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: proj.outcomes
                          .map(
                            (h) => pw.Row(
                              crossAxisAlignment: pw.CrossAxisAlignment.start,
                              children: [
                                pw.Text("• ", style: bodyStyle),
                                pw.Expanded(
                                  child: pw.Text(h, style: bodyStyle),
                                ),
                              ],
                            ),
                          )
                          .toList(),
                    ),
                  ),
              ],
            ),
          ),
        ),
        pw.SizedBox(height: 4),
      ],
    );
  }

  pw.Widget buildSkills() {
    if (filteredSkills.isEmpty) return pw.Container();
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: [
        buildSectionTitle('SKILLS'),
        pw.Wrap(
          spacing: 12,
          runSpacing: 4,
          children: filteredSkills
              .map(
                (skill) => pw.RichText(
                  text: pw.TextSpan(
                    children: [
                      pw.TextSpan(
                        text: '${skill.category}: ',
                        style: pw.TextStyle(font: fontBold, fontSize: 9.5),
                      ),
                      pw.TextSpan(
                        text: skill.items.join(', '),
                        style: bodyStyle,
                      ),
                    ],
                  ),
                ),
              )
              .toList(),
        ),
        pw.SizedBox(height: 12),
      ],
    );
  }

  pw.Widget buildCertifications() {
    if (filteredCertifications.isEmpty) return pw.Container();
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: [
        buildSectionTitle('CERTIFICATIONS'),
        ...filteredCertifications.map(
          (cert) => pw.Container(
            margin: const pw.EdgeInsets.only(bottom: 2),
            child: pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.RichText(
                  text: pw.TextSpan(
                    children: [
                      pw.TextSpan(
                        text: cert.name,
                        style: pw.TextStyle(font: fontBold, fontSize: 9.5),
                      ),
                      pw.TextSpan(
                        text: ' — ${cert.issuer}',
                        style: pw.TextStyle(
                          fontSize: 9.5,
                          color: PdfColors.grey700,
                        ),
                      ),
                    ],
                  ),
                ),
                pw.Text(formatDate(cert.date), style: bodyStyle),
              ],
            ),
          ),
        ),
        pw.SizedBox(height: 12),
      ],
    );
  }

  pw.Widget buildLanguages() {
    if (filteredLanguages.isEmpty) return pw.Container();
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: [
        buildSectionTitle('LANGUAGES'),
        pw.Text(
          filteredLanguages
              .map((l) => '${l.name} (${l.proficiency.displayName})')
              .join(', '),
          style: bodyStyle,
        ),
        pw.SizedBox(height: 12),
      ],
    );
  }

  // Build Pages
  pdf.addPage(
    pw.MultiPage(
      pageFormat: PdfPageFormat.a4,
      margin: const pw.EdgeInsets.all(40),
      build: (pw.Context context) {
        return [
          buildHeader(),
          ...sortedSections.where((s) => s.enabled).map((section) {
            switch (section.type) {
              case 'experience':
                return buildExperience();
              case 'education':
                return buildEducation();
              case 'projects':
                return buildProjects();
              case 'skills':
                return buildSkills();
              case 'certifications':
                return buildCertifications();
              case 'languages':
                return buildLanguages();
              default:
                return pw.Container();
            }
          }),
        ];
      },
      footer: (context) => pw.Align(
        alignment: pw.Alignment.centerRight,
        child: pw.Text(
          'Generated by Pinnacle',
          style: const pw.TextStyle(fontSize: 7, color: PdfColors.grey500),
        ),
      ),
    ),
  );

  return pdf.save();
}
