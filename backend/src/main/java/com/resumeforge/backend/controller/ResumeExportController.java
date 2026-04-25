package com.resumeforge.backend.controller;

import com.resumeforge.backend.service.ResumeExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resume/export")
@RequiredArgsConstructor
public class ResumeExportController {

    private final ResumeExportService resumeExportService;

    /**
     * GET /api/resume/export/pdf/{resumeVersionId}?font=georgia
     *
     * The `font` query param is the key saved by Settings.jsx into localStorage
     * under "rf_resume_font". Accepted values:
     *   georgia | playfair | lato | merriweather | nunito | libre_baskerville
     *
     * Defaults to "georgia" if not supplied.
     */
    @GetMapping("/pdf/{resumeVersionId}")
    public ResponseEntity<byte[]> exportPdf(
            Authentication authentication,
            @PathVariable Long resumeVersionId,
            @RequestParam(defaultValue = "georgia") String font) throws Exception {

        Long userId = (Long) authentication.getCredentials();
        byte[] pdfBytes = resumeExportService.exportToPdf(resumeVersionId, userId, font);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"resume_" + resumeVersionId + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    /**
     * GET /api/resume/export/docx/{resumeVersionId}?font=georgia
     *
     * Same font param as above. Defaults to "georgia".
     */
    @GetMapping("/docx/{resumeVersionId}")
    public ResponseEntity<byte[]> exportDocx(
            Authentication authentication,
            @PathVariable Long resumeVersionId,
            @RequestParam(defaultValue = "georgia") String font) throws Exception {

        Long userId = (Long) authentication.getCredentials();
        byte[] docxBytes = resumeExportService.exportToDocx(resumeVersionId, userId, font);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"resume_" + resumeVersionId + ".docx\"")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                .body(docxBytes);
    }
}