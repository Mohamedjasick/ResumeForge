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

    @GetMapping("/pdf/{resumeVersionId}")
    public ResponseEntity<byte[]> exportPdf(
            Authentication authentication,
            @PathVariable Long resumeVersionId) throws Exception {

        Long userId = (Long) authentication.getCredentials();
        byte[] pdfBytes = resumeExportService.exportToPdf(resumeVersionId, userId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"resume_" + resumeVersionId + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/docx/{resumeVersionId}")
    public ResponseEntity<byte[]> exportDocx(
            Authentication authentication,
            @PathVariable Long resumeVersionId) throws Exception {

        Long userId = (Long) authentication.getCredentials();
        byte[] docxBytes = resumeExportService.exportToDocx(resumeVersionId, userId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"resume_" + resumeVersionId + ".docx\"")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                .body(docxBytes);
    }
}