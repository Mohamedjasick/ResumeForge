package com.resumeforge.backend.controller;

import com.resumeforge.backend.entity.*;
import com.resumeforge.backend.repository.*;
import com.resumeforge.backend.service.ScoringService;
import com.resumeforge.backend.util.JdParser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/ats")
@RequiredArgsConstructor
public class AtsController {

    private final ScoringService scoringService;
    private final JdParser jdParser;
    private final SkillRepository skillRepository;
    private final ProjectRepository projectRepository;
    private final ExperienceRepository experienceRepository;
    private final SummaryRepository summaryRepository;

    @PostMapping("/score")
    public ResponseEntity<Map<String, Object>> getAtsScore(
            Authentication authentication,
            @RequestBody Map<String, String> body) {

        Long userId = (Long) authentication.getCredentials();
        String jobDescription = body.get("jobDescription");

        if (jobDescription == null || jobDescription.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "jobDescription is required"));
        }

        // Parse JD keywords
        Set<String> jdKeywords = jdParser.extractKeywords(jobDescription);

        // Load user data
        List<Skill>      skills      = skillRepository.findByUserId(userId);
        List<Project>    projects    = projectRepository.findByUserId(userId);
        List<Experience> experiences = experienceRepository.findByUserId(userId);
        List<Summary>    summaries   = summaryRepository.findByUserId(userId);
        Summary          bestSummary = scoringService.selectBestSummary(summaries, jdKeywords);

        // Calculate score
        int score = scoringService.calculateAtsScore(skills, projects, experiences, bestSummary, jdKeywords);

        // Missing skills — now checks experience, projects and summary too
        List<String> missingSkills = scoringService.detectMissingSkills(
                skills, experiences, projects, bestSummary, jdKeywords);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("atsScore", score);
        response.put("jdKeywordsFound", jdKeywords.size());
        response.put("jdKeywords", new TreeSet<>(jdKeywords));
        response.put("missingSkills", missingSkills);

        return ResponseEntity.ok(response);
    }
}