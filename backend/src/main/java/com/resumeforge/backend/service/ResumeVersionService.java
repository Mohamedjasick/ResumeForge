package com.resumeforge.backend.service;

import com.resumeforge.backend.dto.request.ResumeVersionRequest;
import com.resumeforge.backend.dto.response.ResumeVersionResponse;
import com.resumeforge.backend.entity.ResumeVersion;
import com.resumeforge.backend.repository.ResumeVersionRepository;
import com.resumeforge.backend.util.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResumeVersionService {

    private final ResumeVersionRepository resumeVersionRepository;

    public List<ResumeVersionResponse> getAll(Long userId) {
        return resumeVersionRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ResumeVersionResponse getById(Long userId, Long id) {
        ResumeVersion version = resumeVersionRepository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Resume version not found with id: " + id));
        return toResponse(version);
    }

    public ResumeVersionResponse update(Long userId, Long id,
            ResumeVersionRequest request) {
        ResumeVersion version = resumeVersionRepository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Resume version not found with id: " + id));

        version.setJobTitle(request.getJobTitle());
        version.setCompanyName(request.getCompanyName());
        version.setJdText(request.getJdText());
        version.setGeneratedResume(request.getGeneratedResume());
        version.setAtsScore(request.getAtsScore());

        return toResponse(resumeVersionRepository.save(version));
    }

    public void delete(Long userId, Long id) {
        ResumeVersion version = resumeVersionRepository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Resume version not found with id: " + id));
        resumeVersionRepository.delete(version);
    }

    private ResumeVersionResponse toResponse(ResumeVersion v) {
        ResumeVersionResponse res = new ResumeVersionResponse();
        res.setId(v.getId());
        res.setJobTitle(v.getJobTitle());
        res.setCompanyName(v.getCompanyName());
        res.setJdText(v.getJdText());
        res.setGeneratedResume(v.getGeneratedResume());
        res.setAtsScore(v.getAtsScore());
        res.setCreatedAt(v.getCreatedAt());
        return res;
    }
}