package com.resumeforge.backend.controller;

import com.resumeforge.backend.dto.request.SummaryRequest;
import com.resumeforge.backend.dto.response.SummaryResponse;
import com.resumeforge.backend.service.SummaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/summaries")
@RequiredArgsConstructor
public class SummaryController {

    private final SummaryService summaryService;

    @PostMapping
    public ResponseEntity<SummaryResponse> createSummary(
            Authentication authentication,
            @Valid @RequestBody SummaryRequest request) {
        Long userId = (Long) authentication.getCredentials();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(summaryService.createSummary(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<SummaryResponse>> getAllSummaries(
            Authentication authentication) {
        Long userId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(summaryService.getAllSummaries(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SummaryResponse> updateSummary(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody SummaryRequest request) {
        Long userId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(summaryService.updateSummary(userId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSummary(
            Authentication authentication,
            @PathVariable Long id) {
        Long userId = (Long) authentication.getCredentials();
        summaryService.deleteSummary(userId, id);
        return ResponseEntity.noContent().build();
    }
}