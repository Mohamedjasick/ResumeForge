package com.resumeforge.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Text;
import com.itextpdf.layout.properties.TextAlignment;
import com.resumeforge.backend.dto.response.ResumeExportData;
import com.resumeforge.backend.entity.ResumeVersion;
import com.resumeforge.backend.repository.ResumeVersionRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.xwpf.usermodel.*;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTPageMar;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTSectPr;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigInteger;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ResumeExportService {

    private final ResumeVersionRepository resumeVersionRepository;
    private final ObjectMapper objectMapper;

    // ─── Font resolution ──────────────────────────────────────────────────────
    //
    // Settings.jsx saves one of these values to localStorage key "rf_resume_font":
    //   georgia | playfair | lato | merriweather | nunito | libre_baskerville
    //
    // For PDF we map to iText StandardFonts (only Type-1 fonts are built in).
    // Web fonts (Playfair, Lato, etc.) are not available as StandardFonts, so we
    // map them to the closest professional equivalent:
    //
    //   georgia / merriweather / libre_baskerville / playfair  → TIMES_ROMAN (serif)
    //   lato / nunito                                          → HELVETICA   (sans-serif)
    //
    // For DOCX we use the actual font name — Word/LibreOffice will render it if
    // the font is installed on the reader's machine, which is standard behaviour.

    private String resolvePdfFontName(String fontKey) {
        if (fontKey == null) return StandardFonts.TIMES_ROMAN;
        return switch (fontKey.toLowerCase()) {
            case "lato", "nunito"                              -> StandardFonts.HELVETICA;
            default                                            -> StandardFonts.TIMES_ROMAN;
            // georgia, playfair, merriweather, libre_baskerville → Times Roman (best serif match)
        };
    }

    private String resolvePdfBoldFontName(String fontKey) {
        if (fontKey == null) return StandardFonts.TIMES_BOLD;
        return switch (fontKey.toLowerCase()) {
            case "lato", "nunito" -> StandardFonts.HELVETICA_BOLD;
            default               -> StandardFonts.TIMES_BOLD;
        };
    }

    /**
     * Returns the exact font-family name to embed in the DOCX run.
     * Word/LibreOffice will use the font if installed, or fall back gracefully.
     */
    private String resolveDocxFontFamily(String fontKey) {
        if (fontKey == null) return "Georgia";
        return switch (fontKey.toLowerCase()) {
            case "georgia"           -> "Georgia";
            case "playfair"          -> "Playfair Display";
            case "lato"              -> "Lato";
            case "merriweather"      -> "Merriweather";
            case "nunito"            -> "Nunito";
            case "libre_baskerville" -> "Libre Baskerville";
            default                  -> "Georgia";
        };
    }

    // ─── Shared: fetch and parse ──────────────────────────────────────────────

    private ResumeExportData getExportData(Long resumeVersionId, Long userId) {
        ResumeVersion version = resumeVersionRepository.findById(resumeVersionId)
                .orElseThrow(() -> new RuntimeException("ResumeVersion not found with id: " + resumeVersionId));

        if (!version.getUserId().equals(userId)) {
            throw new SecurityException("Access denied to this resume version");
        }

        try {
            return objectMapper.readValue(version.getGeneratedResume(), ResumeExportData.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse stored resume JSON: " + e.getMessage());
        }
    }

    // ─── PDF Export ───────────────────────────────────────────────────────────

    public byte[] exportToPdf(Long resumeVersionId, Long userId, String fontKey) throws IOException {
        ResumeExportData data = getExportData(resumeVersionId, userId);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter   writer = new PdfWriter(baos);
        PdfDocument pdf    = new PdfDocument(writer);
        Document    doc    = new Document(pdf, PageSize.A4);
        doc.setMargins(40, 50, 40, 50);

        // ── Resolve fonts from the key passed by the frontend ─────────────────
        PdfFont regular = PdfFontFactory.createFont(resolvePdfFontName(fontKey));
        PdfFont bold    = PdfFontFactory.createFont(resolvePdfBoldFontName(fontKey));

        DeviceRgb headerColor  = new DeviceRgb(30,  30,  30);
        DeviceRgb sectionColor = new DeviceRgb(26,  26,  26);
        DeviceRgb mutedColor   = new DeviceRgb(100, 100, 100);
        DeviceRgb linkColor    = new DeviceRgb(0,   102, 204);

        // ── Header ───────────────────────────────────────────────────────────
        ResumeExportData.ProfileSection p = data.getProfile();
        if (p != null) {
            if (p.getFullName() != null) {
                doc.add(new Paragraph(p.getFullName())
                        .setFont(bold).setFontSize(20)
                        .setFontColor(headerColor)
                        .setTextAlignment(TextAlignment.CENTER)
                        .setMarginBottom(2));
            }

            StringBuilder contactLine = new StringBuilder();
            appendIfNotBlank(contactLine, p.getEmail());
            appendIfNotBlank(contactLine, p.getPhone());
            appendIfNotBlank(contactLine, p.getLocation());
            if (contactLine.length() > 0) {
                doc.add(new Paragraph(contactLine.toString())
                        .setFont(regular).setFontSize(9)
                        .setFontColor(mutedColor)
                        .setTextAlignment(TextAlignment.CENTER)
                        .setMarginBottom(2));
            }

            StringBuilder linksLine = new StringBuilder();
            appendIfNotBlank(linksLine, p.getLinkedinUrl());
            appendIfNotBlank(linksLine, p.getGithubUrl());
            appendIfNotBlank(linksLine, p.getPortfolioUrl());
            if (linksLine.length() > 0) {
                doc.add(new Paragraph(linksLine.toString())
                        .setFont(regular).setFontSize(9)
                        .setFontColor(mutedColor)
                        .setTextAlignment(TextAlignment.CENTER)
                        .setMarginBottom(6));
            }
        }

        // ── Summary ───────────────────────────────────────────────────────────
        if (data.getSummary() != null && !data.getSummary().isBlank()) {
            addPdfSectionHeader(doc, bold, sectionColor, "SUMMARY");
            doc.add(new Paragraph(data.getSummary())
                    .setFont(regular).setFontSize(10)
                    .setMarginBottom(6));
        }

        // ── Skills ────────────────────────────────────────────────────────────
        if (data.getSkills() != null && !data.getSkills().isEmpty()) {
            addPdfSectionHeader(doc, bold, sectionColor, "SKILLS");
            String skillLine = data.getSkills().stream()
                    .map(ResumeExportData.SkillSection::getSkillName)
                    .collect(Collectors.joining(", "));
            doc.add(new Paragraph(skillLine)
                    .setFont(regular).setFontSize(10)
                    .setMarginBottom(6));
        }

        // ── Education ─────────────────────────────────────────────────────────
        List<ResumeExportData.EducationSection> educations = data.getEducations();
        if (educations != null && !educations.isEmpty()) {
            addPdfSectionHeader(doc, bold, sectionColor, "EDUCATION");
            for (ResumeExportData.EducationSection edu : educations) {
                Paragraph eduLine = new Paragraph()
                        .add(new Text(nvl(edu.getDegree())
                                + (edu.getFieldOfStudy() != null ? " — " + edu.getFieldOfStudy() : ""))
                                .setFont(bold).setFontSize(10))
                        .add(new Text("  |  " + nvl(edu.getUniversity()))
                                .setFont(regular).setFontSize(10))
                        .setMarginBottom(2);
                if (edu.getGraduationYear() != null) {
                    eduLine.add(new Text("  |  " + edu.getGraduationYear())
                            .setFont(regular).setFontSize(10).setFontColor(mutedColor));
                }
                if (edu.getGrade() != null) {
                    eduLine.add(new Text("  |  " + edu.getGrade())
                            .setFont(regular).setFontSize(10).setFontColor(mutedColor));
                }
                doc.add(eduLine);

                if (edu.getSchoolTwelfthName() != null && !edu.getSchoolTwelfthName().isBlank()) {
                    doc.add(new Paragraph()
                            .add(new Text("12th  |  " + edu.getSchoolTwelfthName())
                                    .setFont(bold).setFontSize(9))
                            .add(new Text(
                                    "  |  " + nvl(edu.getTwelfthBoard())
                                    + (edu.getTwelfthPercentage() != null ? "  |  " + edu.getTwelfthPercentage() : "")
                                    + (edu.getTwelfthYear()       != null ? "  |  " + edu.getTwelfthYear()       : ""))
                                    .setFont(regular).setFontSize(9).setFontColor(mutedColor))
                            .setMarginLeft(12).setMarginBottom(2));
                }

                if (edu.getSchoolTenthName() != null && !edu.getSchoolTenthName().isBlank()) {
                    doc.add(new Paragraph()
                            .add(new Text("10th  |  " + edu.getSchoolTenthName())
                                    .setFont(bold).setFontSize(9))
                            .add(new Text(
                                    "  |  " + nvl(edu.getTenthBoard())
                                    + (edu.getTenthPercentage() != null ? "  |  " + edu.getTenthPercentage() : "")
                                    + (edu.getTenthYear()       != null ? "  |  " + edu.getTenthYear()       : ""))
                                    .setFont(regular).setFontSize(9).setFontColor(mutedColor))
                            .setMarginLeft(12).setMarginBottom(2));
                }

                doc.add(new Paragraph("").setMarginBottom(4));
            }
        }

        // ── Experience ────────────────────────────────────────────────────────
        if (data.getExperiences() != null && !data.getExperiences().isEmpty()) {
            addPdfSectionHeader(doc, bold, sectionColor, "EXPERIENCE");
            for (ResumeExportData.ExperienceSection exp : data.getExperiences()) {
                String start = formatDate(exp.getStartDate());
                String end   = formatDate(exp.getEndDate());
                String dates = (start.equals("—") && end.equals("—")) ? "" : start + " – " + end;

                String titleLine = Stream.of(exp.getJobTitle(), exp.getCompanyName(), dates.isBlank() ? null : dates)
                        .filter(s -> s != null && !s.isBlank())
                        .collect(Collectors.joining("  |  "));

                doc.add(new Paragraph()
                        .add(new Text(titleLine).setFont(bold).setFontSize(10))
                        .setMarginBottom(3));

                if (exp.getDescription() != null && !exp.getDescription().isBlank()) {
                    String[] bullets = exp.getDescription().split("(?<=\\.)\\s+|\\n+");
                    for (String bullet : bullets) {
                        if (!bullet.isBlank()) {
                            doc.add(new Paragraph("• " + bullet.trim())
                                    .setFont(regular).setFontSize(10)
                                    .setMarginLeft(12).setMarginBottom(2));
                        }
                    }
                }
                doc.add(new Paragraph("").setMarginBottom(4));
            }
        }

        // ── Projects ──────────────────────────────────────────────────────────
        if (data.getProjects() != null && !data.getProjects().isEmpty()) {
            addPdfSectionHeader(doc, bold, sectionColor, "PROJECTS");
            for (ResumeExportData.ProjectSection proj : data.getProjects()) {
                String nonUrlPart = Stream.of(
                                proj.getTitle(),
                                (proj.getTechStack() != null && !proj.getTechStack().isBlank())
                                        ? proj.getTechStack() : null)
                        .filter(s -> s != null && !s.isBlank())
                        .collect(Collectors.joining("  |  "));

                Paragraph titlePara = new Paragraph().setMarginBottom(3);
                titlePara.add(new Text(nonUrlPart).setFont(bold).setFontSize(10));

                if (proj.getProjectUrl() != null && !proj.getProjectUrl().isBlank()) {
                    titlePara.add(new Text("  |  " + proj.getProjectUrl())
                            .setFont(regular).setFontSize(9).setFontColor(linkColor));
                }
                doc.add(titlePara);

                if (proj.getDescription() != null && !proj.getDescription().isBlank()) {
                    doc.add(new Paragraph("• " + proj.getDescription())
                            .setFont(regular).setFontSize(10)
                            .setMarginLeft(12).setMarginBottom(2));
                }
                doc.add(new Paragraph("").setMarginBottom(4));
            }
        }

        doc.close();
        return baos.toByteArray();
    }

    private void addPdfSectionHeader(Document doc, PdfFont bold,
                                     DeviceRgb color, String title) throws IOException {
        doc.add(new Paragraph(title)
                .setFont(bold).setFontSize(11)
                .setFontColor(color)
                .setBorderBottom(new com.itextpdf.layout.borders.SolidBorder(color, 1))
                .setMarginBottom(4).setMarginTop(8));
    }

    // ─── DOCX Export ──────────────────────────────────────────────────────────

    public byte[] exportToDocx(Long resumeVersionId, Long userId, String fontKey) throws IOException {
        ResumeExportData data = getExportData(resumeVersionId, userId);

        // ── Resolve font family name from key ─────────────────────────────────
        String fontFamily = resolveDocxFontFamily(fontKey);

        try (XWPFDocument docx = new XWPFDocument();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            CTSectPr  sectPr  = docx.getDocument().getBody().addNewSectPr();
            CTPageMar pageMar = sectPr.addNewPgMar();
            pageMar.setTop(BigInteger.valueOf(720));
            pageMar.setBottom(BigInteger.valueOf(720));
            pageMar.setLeft(BigInteger.valueOf(900));
            pageMar.setRight(BigInteger.valueOf(900));

            ResumeExportData.ProfileSection p = data.getProfile();

            // ── Header ───────────────────────────────────────────────────────
            if (p != null) {
                if (p.getFullName() != null) {
                    XWPFParagraph name    = docx.createParagraph();
                    name.setAlignment(ParagraphAlignment.CENTER);
                    XWPFRun nameRun = name.createRun();
                    nameRun.setText(p.getFullName());
                    nameRun.setBold(true);
                    nameRun.setFontSize(18);
                    nameRun.setFontFamily(fontFamily);
                    nameRun.setColor("1E1E1E");
                }

                StringBuilder contactStr = new StringBuilder();
                appendIfNotBlank(contactStr, p.getEmail());
                appendIfNotBlank(contactStr, p.getPhone());
                appendIfNotBlank(contactStr, p.getLocation());
                XWPFParagraph contact    = docx.createParagraph();
                contact.setAlignment(ParagraphAlignment.CENTER);
                XWPFRun contactRun = contact.createRun();
                contactRun.setText(contactStr.toString());
                contactRun.setFontSize(9);
                contactRun.setFontFamily(fontFamily);
                contactRun.setColor("646464");

                StringBuilder linksStr = new StringBuilder();
                appendIfNotBlank(linksStr, p.getLinkedinUrl());
                appendIfNotBlank(linksStr, p.getGithubUrl());
                appendIfNotBlank(linksStr, p.getPortfolioUrl());
                if (linksStr.length() > 0) {
                    XWPFParagraph links    = docx.createParagraph();
                    links.setAlignment(ParagraphAlignment.CENTER);
                    XWPFRun linksRun = links.createRun();
                    linksRun.setText(linksStr.toString());
                    linksRun.setFontSize(9);
                    linksRun.setFontFamily(fontFamily);
                    linksRun.setColor("0066CC");
                }
            }

            // ── Summary ───────────────────────────────────────────────────────
            if (data.getSummary() != null && !data.getSummary().isBlank()) {
                addDocxSectionHeader(docx, "SUMMARY", fontFamily);
                XWPFParagraph sp = docx.createParagraph();
                XWPFRun sr = sp.createRun();
                sr.setText(data.getSummary());
                sr.setFontSize(10);
                sr.setFontFamily(fontFamily);
            }

            // ── Skills ────────────────────────────────────────────────────────
            if (data.getSkills() != null && !data.getSkills().isEmpty()) {
                addDocxSectionHeader(docx, "SKILLS", fontFamily);
                String skillLine = data.getSkills().stream()
                        .map(ResumeExportData.SkillSection::getSkillName)
                        .collect(Collectors.joining(", "));
                XWPFParagraph sp = docx.createParagraph();
                XWPFRun sr = sp.createRun();
                sr.setText(skillLine);
                sr.setFontSize(10);
                sr.setFontFamily(fontFamily);
            }

            // ── Education ─────────────────────────────────────────────────────
            List<ResumeExportData.EducationSection> educations = data.getEducations();
            if (educations != null && !educations.isEmpty()) {
                addDocxSectionHeader(docx, "EDUCATION", fontFamily);
                for (ResumeExportData.EducationSection edu : educations) {
                    XWPFParagraph ep = docx.createParagraph();
                    XWPFRun er = ep.createRun();
                    String degreeLine = nvl(edu.getDegree())
                            + (edu.getFieldOfStudy() != null ? " — " + edu.getFieldOfStudy() : "")
                            + "  |  " + nvl(edu.getUniversity())
                            + (edu.getGraduationYear() != null ? "  |  " + edu.getGraduationYear() : "")
                            + (edu.getGrade()          != null ? "  |  " + edu.getGrade()          : "");
                    er.setText(degreeLine);
                    er.setBold(true);
                    er.setFontSize(10);
                    er.setFontFamily(fontFamily);

                    if (edu.getSchoolTwelfthName() != null && !edu.getSchoolTwelfthName().isBlank()) {
                        XWPFParagraph twelfthPara = docx.createParagraph();
                        twelfthPara.setIndentationLeft(300);
                        XWPFRun twelfthRun = twelfthPara.createRun();
                        twelfthRun.setText("12th  |  " + edu.getSchoolTwelfthName()
                                + "  |  " + nvl(edu.getTwelfthBoard())
                                + (edu.getTwelfthPercentage() != null ? "  |  " + edu.getTwelfthPercentage() : "")
                                + (edu.getTwelfthYear()       != null ? "  |  " + edu.getTwelfthYear()       : ""));
                        twelfthRun.setFontSize(9);
                        twelfthRun.setFontFamily(fontFamily);
                        twelfthRun.setColor("646464");
                    }

                    if (edu.getSchoolTenthName() != null && !edu.getSchoolTenthName().isBlank()) {
                        XWPFParagraph tenthPara = docx.createParagraph();
                        tenthPara.setIndentationLeft(300);
                        XWPFRun tenthRun = tenthPara.createRun();
                        tenthRun.setText("10th  |  " + edu.getSchoolTenthName()
                                + "  |  " + nvl(edu.getTenthBoard())
                                + (edu.getTenthPercentage() != null ? "  |  " + edu.getTenthPercentage() : "")
                                + (edu.getTenthYear()       != null ? "  |  " + edu.getTenthYear()       : ""));
                        tenthRun.setFontSize(9);
                        tenthRun.setFontFamily(fontFamily);
                        tenthRun.setColor("646464");
                    }

                    docx.createParagraph();
                }
            }

            // ── Experience ────────────────────────────────────────────────────
            if (data.getExperiences() != null && !data.getExperiences().isEmpty()) {
                addDocxSectionHeader(docx, "EXPERIENCE", fontFamily);
                for (ResumeExportData.ExperienceSection exp : data.getExperiences()) {
                    String start = formatDate(exp.getStartDate());
                    String end   = formatDate(exp.getEndDate());
                    String dates = (start.equals("—") && end.equals("—")) ? "" : start + " – " + end;

                    String titleLine = Stream.of(exp.getJobTitle(), exp.getCompanyName(), dates.isBlank() ? null : dates)
                            .filter(s -> s != null && !s.isBlank())
                            .collect(Collectors.joining("  |  "));

                    XWPFParagraph tp = docx.createParagraph();
                    XWPFRun tr = tp.createRun();
                    tr.setText(titleLine);
                    tr.setBold(true);
                    tr.setFontSize(10);
                    tr.setFontFamily(fontFamily);

                    if (exp.getDescription() != null && !exp.getDescription().isBlank()) {
                        String[] bullets = exp.getDescription().split("(?<=\\.)\\s+|\\n+");
                        for (String bullet : bullets) {
                            if (!bullet.isBlank()) {
                                XWPFParagraph bp = docx.createParagraph();
                                bp.setIndentationLeft(300);
                                XWPFRun br = bp.createRun();
                                br.setText("• " + bullet.trim());
                                br.setFontSize(10);
                                br.setFontFamily(fontFamily);
                            }
                        }
                    }
                    docx.createParagraph();
                }
            }

            // ── Projects ──────────────────────────────────────────────────────
            if (data.getProjects() != null && !data.getProjects().isEmpty()) {
                addDocxSectionHeader(docx, "PROJECTS", fontFamily);
                for (ResumeExportData.ProjectSection proj : data.getProjects()) {
                    XWPFParagraph tp = docx.createParagraph();

                    String boldPart = Stream.of(
                                    proj.getTitle(),
                                    (proj.getTechStack() != null && !proj.getTechStack().isBlank())
                                            ? proj.getTechStack() : null)
                            .filter(s -> s != null && !s.isBlank())
                            .collect(Collectors.joining("  |  "));

                    XWPFRun boldRun = tp.createRun();
                    boldRun.setText(boldPart);
                    boldRun.setBold(true);
                    boldRun.setFontSize(10);
                    boldRun.setFontFamily(fontFamily);

                    if (proj.getProjectUrl() != null && !proj.getProjectUrl().isBlank()) {
                        XWPFRun urlRun = tp.createRun();
                        urlRun.setText("  |  " + proj.getProjectUrl());
                        urlRun.setFontSize(9);
                        urlRun.setFontFamily(fontFamily);
                        urlRun.setColor("0066CC");
                    }

                    if (proj.getDescription() != null && !proj.getDescription().isBlank()) {
                        XWPFParagraph dp = docx.createParagraph();
                        dp.setIndentationLeft(300);
                        XWPFRun dr = dp.createRun();
                        dr.setText("• " + proj.getDescription());
                        dr.setFontSize(10);
                        dr.setFontFamily(fontFamily);
                    }

                    docx.createParagraph();
                }
            }

            docx.write(baos);
            return baos.toByteArray();
        }
    }

    private void addDocxSectionHeader(XWPFDocument docx, String title, String fontFamily) {
        XWPFParagraph header = docx.createParagraph();
        header.setSpacingBefore(160);
        XWPFRun run = header.createRun();
        run.setText(title);
        run.setBold(true);
        run.setFontSize(11);
        run.setFontFamily(fontFamily);
        run.setColor("1a1a1a");
        run.addBreak();
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private void appendIfNotBlank(StringBuilder sb, String value) {
        if (value != null && !value.isBlank()) {
            if (sb.length() > 0) sb.append("  |  ");
            sb.append(value);
        }
    }

    private String nvl(String value) {
        return value != null ? value : "";
    }

    private String nvl(Object value) {
        return value != null ? value.toString() : "";
    }

    private String formatDate(String date) {
        if (date == null || date.isBlank() || date.equals("—")) return "—";
        if (date.equalsIgnoreCase("present")) return "Present";
        try {
            LocalDate d = LocalDate.parse(date);
            return d.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + d.getYear();
        } catch (Exception e) {
            return date;
        }
    }
}