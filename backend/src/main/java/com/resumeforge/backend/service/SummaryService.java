package com.resumeforge.backend.service;

import com.resumeforge.backend.dto.request.SummaryRequest;
import com.resumeforge.backend.dto.response.SummaryResponse;
import com.resumeforge.backend.entity.Summary;
import com.resumeforge.backend.entity.User;
import com.resumeforge.backend.repository.SummaryRepository;
import com.resumeforge.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SummaryService {

    private final SummaryRepository summaryRepository;
    private final UserRepository userRepository;

    public SummaryService(SummaryRepository summaryRepository,
                          UserRepository userRepository) {
        this.summaryRepository = summaryRepository;
        this.userRepository = userRepository;
    }

    public SummaryResponse createSummary(Long userId, SummaryRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Summary summary = new Summary();
        summary.setUser(user);
        summary.setDomainTag(request.getDomainTag());
        summary.setContent(request.getContent());

        Summary saved = summaryRepository.save(summary);
        return toResponse(saved);
    }

    public List<SummaryResponse> getAllSummaries(Long userId) {
        return summaryRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public SummaryResponse updateSummary(Long userId, Long summaryId, SummaryRequest request) {
        Summary summary = summaryRepository.findByIdAndUserId(summaryId, userId)
                .orElseThrow(() -> new RuntimeException("Summary not found with id: " + summaryId));

        summary.setDomainTag(request.getDomainTag());
        summary.setContent(request.getContent());

        Summary updated = summaryRepository.save(summary);
        return toResponse(updated);
    }

    public void deleteSummary(Long userId, Long summaryId) {
        Summary summary = summaryRepository.findByIdAndUserId(summaryId, userId)
                .orElseThrow(() -> new RuntimeException("Summary not found with id: " + summaryId));

        summaryRepository.delete(summary);
    }

    private SummaryResponse toResponse(Summary summary) {
        return new SummaryResponse(
                summary.getId(),
                summary.getDomainTag(),
                summary.getContent(),
                summary.getCreatedAt()
        );
    }
}