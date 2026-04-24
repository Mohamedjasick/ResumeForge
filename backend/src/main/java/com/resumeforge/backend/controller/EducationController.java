package com.resumeforge.backend.controller;

import com.resumeforge.backend.dto.request.EducationRequest;
import com.resumeforge.backend.dto.response.EducationResponse;
import com.resumeforge.backend.service.EducationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/education")
@RequiredArgsConstructor
public class EducationController {

    private final EducationService educationService;

    @PostMapping
    public ResponseEntity<EducationResponse> addEducation(
            @Valid @RequestBody EducationRequest request,
            Authentication authentication) {
        Long userId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(educationService.addEducation(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<EducationResponse>> getEducations(
            Authentication authentication) {
        Long userId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(educationService.getEducations(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EducationResponse> updateEducation(
            @PathVariable Long id,
            @Valid @RequestBody EducationRequest request,
            Authentication authentication) {
        Long userId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(educationService.updateEducation(userId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEducation(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = (Long) authentication.getCredentials();
        educationService.deleteEducation(userId, id);
        return ResponseEntity.noContent().build();
    }
}