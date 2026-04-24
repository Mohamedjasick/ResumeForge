package com.resumeforge.backend.controller;

import com.resumeforge.backend.dto.request.ProfileRequest;
import com.resumeforge.backend.dto.response.ProfileResponse;
import com.resumeforge.backend.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @PutMapping
    public ResponseEntity<ProfileResponse> createOrUpdateProfile(
            @Valid @RequestBody ProfileRequest request,
            Authentication authentication) {
        Long userId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(profileService.createOrUpdateProfile(userId, request));
    }

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(
            Authentication authentication) {
        Long userId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(profileService.getProfile(userId));
    }
}
