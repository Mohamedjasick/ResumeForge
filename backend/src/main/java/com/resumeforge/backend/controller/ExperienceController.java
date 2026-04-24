package com.resumeforge.backend.controller;

import com.resumeforge.backend.dto.request.ExperienceRequest;
import com.resumeforge.backend.dto.response.ExperienceResponse;
import com.resumeforge.backend.service.ExperienceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/experiences")
@RequiredArgsConstructor
public class ExperienceController {

    private final ExperienceService experienceService;

    @PostMapping
    public ResponseEntity<ExperienceResponse> createExperience(
            Authentication authentication,
            @RequestBody ExperienceRequest request) {
        Long userId = (Long) authentication.getCredentials();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(experienceService.createExperience(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<ExperienceResponse>> getExperiences(
            Authentication authentication) {
        Long userId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(experienceService.getExperiences(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExperienceResponse> getExperience(
            Authentication authentication,
            @PathVariable Long id) {
        Long userId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(experienceService.getExperience(userId, id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExperienceResponse> updateExperience(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody ExperienceRequest request) {
        Long userId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(experienceService.updateExperience(userId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExperience(
            Authentication authentication,
            @PathVariable Long id) {
        Long userId = (Long) authentication.getCredentials();
        experienceService.deleteExperience(userId, id);
        return ResponseEntity.noContent().build();
    }
}