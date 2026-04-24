package com.resumeforge.backend.service;

import com.resumeforge.backend.dto.request.ExperienceRequest;
import com.resumeforge.backend.dto.response.ExperienceResponse;
import com.resumeforge.backend.entity.Experience;
import com.resumeforge.backend.entity.User;
import com.resumeforge.backend.repository.ExperienceRepository;
import com.resumeforge.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExperienceService {

    private final ExperienceRepository experienceRepository;
    private final UserRepository userRepository;

    @Transactional
    public ExperienceResponse createExperience(Long userId, ExperienceRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Experience experience = new Experience();
        experience.setUser(user);
        experience.setJobTitle(request.getJobTitle());
        experience.setCompanyName(request.getCompanyName());
        experience.setLocation(request.getLocation());
        experience.setEmploymentType(request.getEmploymentType() != null ? request.getEmploymentType() : "FULL_TIME");
        experience.setDomainTag(request.getDomainTag());
        experience.setStartDate(request.getStartDate());
        experience.setEndDate(request.getEndDate());
        experience.setCurrentlyWorking(request.getCurrentlyWorking());
        experience.setDescription(request.getDescription());
        experience.setCreatedAt(LocalDateTime.now());

        Experience saved = experienceRepository.save(experience);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ExperienceResponse> getExperiences(Long userId) {
        return experienceRepository.findByUserIdOrderByStartDateDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ExperienceResponse getExperience(Long userId, Long experienceId) {
        Experience experience = experienceRepository.findByIdAndUserId(experienceId, userId)
                .orElseThrow(() -> new RuntimeException("Experience not found"));
        return mapToResponse(experience);
    }

    @Transactional
    public ExperienceResponse updateExperience(Long userId, Long experienceId, ExperienceRequest request) {
        Experience experience = experienceRepository.findByIdAndUserId(experienceId, userId)
                .orElseThrow(() -> new RuntimeException("Experience not found"));

        experience.setJobTitle(request.getJobTitle());
        experience.setCompanyName(request.getCompanyName());
        experience.setLocation(request.getLocation());
        experience.setEmploymentType(request.getEmploymentType() != null ? request.getEmploymentType() : "FULL_TIME");
        experience.setDomainTag(request.getDomainTag());
        experience.setStartDate(request.getStartDate());
        experience.setEndDate(request.getEndDate());
        experience.setCurrentlyWorking(request.getCurrentlyWorking());
        experience.setDescription(request.getDescription());

        return mapToResponse(experienceRepository.save(experience));
    }

    @Transactional
    public void deleteExperience(Long userId, Long experienceId) {
        Experience experience = experienceRepository.findByIdAndUserId(experienceId, userId)
                .orElseThrow(() -> new RuntimeException("Experience not found"));
        experienceRepository.delete(experience);
    }

    private ExperienceResponse mapToResponse(Experience experience) {
        ExperienceResponse response = new ExperienceResponse();
        response.setId(experience.getId());
        response.setJobTitle(experience.getJobTitle());
        response.setCompanyName(experience.getCompanyName());
        response.setLocation(experience.getLocation());
        response.setEmploymentType(experience.getEmploymentType());
        response.setDomainTag(experience.getDomainTag());
        response.setStartDate(experience.getStartDate());
        response.setEndDate(experience.getEndDate());
        response.setCurrentlyWorking(experience.getCurrentlyWorking());
        response.setDescription(experience.getDescription());
        response.setCreatedAt(experience.getCreatedAt());
        return response;
    }
}