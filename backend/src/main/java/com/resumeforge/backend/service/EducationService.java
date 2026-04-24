package com.resumeforge.backend.service;

import com.resumeforge.backend.dto.request.EducationRequest;
import com.resumeforge.backend.dto.response.EducationResponse;
import com.resumeforge.backend.entity.Education;
import com.resumeforge.backend.entity.User;
import com.resumeforge.backend.repository.EducationRepository;
import com.resumeforge.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EducationService {

    private final EducationRepository educationRepository;
    private final UserRepository userRepository;

    @Transactional
    public EducationResponse addEducation(Long userId, EducationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Education education = Education.builder()
                .user(user)
                .degree(request.getDegree())
                .fieldOfStudy(request.getFieldOfStudy())
                .university(request.getUniversity())
                .graduationYear(request.getGraduationYear())
                .grade(request.getGrade())
                // Problem 5 — 10th fields
                .schoolTenthName(request.getSchoolTenthName())
                .tenthBoard(request.getTenthBoard())
                .tenthPercentage(request.getTenthPercentage())
                .tenthYear(request.getTenthYear())
                // Problem 5 — 12th fields
                .schoolTwelfthName(request.getSchoolTwelfthName())
                .twelfthBoard(request.getTwelfthBoard())
                .twelfthPercentage(request.getTwelfthPercentage())
                .twelfthYear(request.getTwelfthYear())
                .build();

        Education saved = educationRepository.save(education);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<EducationResponse> getEducations(Long userId) {
        return educationRepository.findByUserIdOrderByGraduationYearDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public EducationResponse updateEducation(Long userId, Long educationId, EducationRequest request) {
        Education education = educationRepository.findById(educationId)
                .orElseThrow(() -> new RuntimeException("Education not found"));

        if (!education.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        // Core fields
        education.setDegree(request.getDegree());
        education.setFieldOfStudy(request.getFieldOfStudy());
        education.setUniversity(request.getUniversity());
        education.setGraduationYear(request.getGraduationYear());
        education.setGrade(request.getGrade());

        // Problem 5 — 10th fields
        education.setSchoolTenthName(request.getSchoolTenthName());
        education.setTenthBoard(request.getTenthBoard());
        education.setTenthPercentage(request.getTenthPercentage());
        education.setTenthYear(request.getTenthYear());

        // Problem 5 — 12th fields
        education.setSchoolTwelfthName(request.getSchoolTwelfthName());
        education.setTwelfthBoard(request.getTwelfthBoard());
        education.setTwelfthPercentage(request.getTwelfthPercentage());
        education.setTwelfthYear(request.getTwelfthYear());

        Education saved = educationRepository.save(education);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteEducation(Long userId, Long educationId) {
        Education education = educationRepository.findById(educationId)
                .orElseThrow(() -> new RuntimeException("Education not found"));

        if (!education.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        educationRepository.deleteById(educationId);
    }

    private EducationResponse mapToResponse(Education education) {
        return EducationResponse.builder()
                .id(education.getId())
                .userId(education.getUser().getId())
                .degree(education.getDegree())
                .fieldOfStudy(education.getFieldOfStudy())
                .university(education.getUniversity())
                .graduationYear(education.getGraduationYear())
                .grade(education.getGrade())
                // Problem 5 — 10th fields
                .schoolTenthName(education.getSchoolTenthName())
                .tenthBoard(education.getTenthBoard())
                .tenthPercentage(education.getTenthPercentage())
                .tenthYear(education.getTenthYear())
                // Problem 5 — 12th fields
                .schoolTwelfthName(education.getSchoolTwelfthName())
                .twelfthBoard(education.getTwelfthBoard())
                .twelfthPercentage(education.getTwelfthPercentage())
                .twelfthYear(education.getTwelfthYear())
                .build();
    }
}