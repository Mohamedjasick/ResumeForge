package com.resumeforge.backend.controller;

import com.resumeforge.backend.dto.request.GenerateResumeRequest;
import com.resumeforge.backend.dto.response.GeneratedResumeResponse;
import com.resumeforge.backend.service.ResumeGenerationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resume")
@RequiredArgsConstructor
public class ResumeGenerationController {

    private final ResumeGenerationService resumeGenerationService;

    @PostMapping("/generate")
    public ResponseEntity<GeneratedResumeResponse> generate(
            Authentication authentication,
            @RequestBody GenerateResumeRequest request) {
        Long userId = (Long) authentication.getCredentials();
        GeneratedResumeResponse response = resumeGenerationService.generate(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}