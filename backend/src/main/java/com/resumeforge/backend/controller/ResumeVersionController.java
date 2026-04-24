package com.resumeforge.backend.controller;

import com.resumeforge.backend.dto.request.ResumeVersionRequest;
import com.resumeforge.backend.dto.response.ResumeVersionResponse;
import com.resumeforge.backend.service.ResumeVersionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resume-versions")
@RequiredArgsConstructor
public class ResumeVersionController {

    private final ResumeVersionService resumeVersionService;

    @GetMapping
    public ResponseEntity<List<ResumeVersionResponse>> getAll(
            Authentication authentication) {
        Long userId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(resumeVersionService.getAll(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResumeVersionResponse> getById(
            Authentication authentication,
            @PathVariable Long id) {
        Long userId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(resumeVersionService.getById(userId, id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResumeVersionResponse> update(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody ResumeVersionRequest request) {
        Long userId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(resumeVersionService.update(userId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            Authentication authentication,
            @PathVariable Long id) {
        Long userId = (Long) authentication.getCredentials();
        resumeVersionService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}