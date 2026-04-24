package com.resumeforge.backend.service;

import com.resumeforge.backend.dto.request.ProfileRequest;
import com.resumeforge.backend.dto.response.ProfileResponse;
import com.resumeforge.backend.entity.Profile;
import com.resumeforge.backend.entity.User;
import com.resumeforge.backend.repository.ProfileRepository;
import com.resumeforge.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    @Transactional
    public ProfileResponse createOrUpdateProfile(Long userId, ProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Profile profile = profileRepository.findByUserId(userId)
                .orElse(Profile.builder().user(user).build());

        profile.setFullName(request.getFullName());
        profile.setPhone(request.getPhone());
        profile.setLinkedinUrl(request.getLinkedinUrl());
        profile.setGithubUrl(request.getGithubUrl());
        profile.setPortfolioUrl(request.getPortfolioUrl());
        profile.setLocation(request.getLocation());
        profile.setContactEmail(request.getContactEmail()); // Issue #4
        profile.setDegree(request.getDegree());
        profile.setUniversity(request.getUniversity());
        profile.setGraduationYear(request.getGraduationYear());
        profile.setCompletenessScore(calculateScore(profile));

        Profile saved = profileRepository.save(profile);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(Long userId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        return mapToResponse(profile);
    }

    private int calculateScore(Profile p) {
        int score = 0;
        if (p.getFullName()     != null && !p.getFullName().isBlank())     score += 20;
        if (p.getPhone()        != null && !p.getPhone().isBlank())        score += 10;
        if (p.getLocation()     != null && !p.getLocation().isBlank())     score += 10;
        if (p.getLinkedinUrl()  != null && !p.getLinkedinUrl().isBlank())  score += 20;
        if (p.getGithubUrl()    != null && !p.getGithubUrl().isBlank())    score += 20;
        if (p.getContactEmail() != null && !p.getContactEmail().isBlank()) score +=  5; // Issue #4
        if (p.getDegree()       != null && !p.getDegree().isBlank())       score += 10;
        if (p.getUniversity()   != null && !p.getUniversity().isBlank())   score += 10;
        // Note: total is now 105 max — cap at 100 in case all fields are filled
        return Math.min(score, 100);
    }

    private ProfileResponse mapToResponse(Profile profile) {
        return ProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .fullName(profile.getFullName())
                .phone(profile.getPhone())
                .linkedinUrl(profile.getLinkedinUrl())
                .githubUrl(profile.getGithubUrl())
                .portfolioUrl(profile.getPortfolioUrl())
                .location(profile.getLocation())
                .contactEmail(profile.getContactEmail()) // Issue #4
                .degree(profile.getDegree())
                .university(profile.getUniversity())
                .graduationYear(profile.getGraduationYear())
                .completenessScore(profile.getCompletenessScore())
                .build();
    }
}