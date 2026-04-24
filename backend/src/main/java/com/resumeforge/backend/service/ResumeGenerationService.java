package com.resumeforge.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeforge.backend.dto.request.GenerateResumeRequest;
import com.resumeforge.backend.dto.response.GeneratedResumeResponse;
import com.resumeforge.backend.entity.*;
import com.resumeforge.backend.repository.*;
import com.resumeforge.backend.util.JdParser;
import com.resumeforge.backend.util.KeywordNormalizer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResumeGenerationService {

    private final JdParser            jdParser;
    private final ScoringService      scoringService;
    private final KeywordNormalizer   keywordNormalizer;
    private final ObjectMapper        objectMapper;

    private final ProfileRepository       profileRepository;
    private final SkillRepository         skillRepository;
    private final ProjectRepository       projectRepository;
    private final ExperienceRepository    experienceRepository;
    private final SummaryRepository       summaryRepository;
    private final ResumeVersionRepository resumeVersionRepository;
    private final UserRepository          userRepository;
    private final EducationRepository     educationRepository;

    private static final int MAX_PROJECTS    = 4;
    private static final int MAX_EXPERIENCES = 3;

    private static final String SECTION_HEADING_COLOR = "#1a1a1a";

    @Transactional
    public GeneratedResumeResponse generate(Long userId, GenerateResumeRequest request) {

        Set<String> jdKeywords = jdParser.extractKeywords(request.getJdText());

        User             user        = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Profile          profile     = profileRepository.findByUserId(userId).orElse(null);
        List<Skill>      skills      = skillRepository.findByUserId(userId);
        List<Project>    projects    = projectRepository.findByUserId(userId);
        List<Experience> experiences = experienceRepository.findByUserId(userId);
        List<Summary>    summaries   = summaryRepository.findByUserId(userId);
        List<Education>  educations  = educationRepository.findByUserIdOrderByGraduationYearDesc(userId);

        List<Skill>      reorderedSkills   = scoringService.reorderSkills(skills, jdKeywords);
        List<Project>    rankedProjects    = scoringService.rankProjects(projects, jdKeywords);
        List<Experience> rankedExperiences = scoringService.rankExperience(experiences, jdKeywords);
        Summary          bestSummary       = scoringService.selectBestSummary(summaries, jdKeywords);
        // ── Missing skills: now checks experience, projects and summary too ──
        List<String> missingSkills = scoringService.detectMissingSkills(
                skills, experiences, projects, bestSummary, jdKeywords);

        List<Project>    topProjects    = rankedProjects.stream()
                .limit(MAX_PROJECTS).collect(Collectors.toList());
        List<Experience> topExperiences = rankedExperiences.stream()
                .limit(MAX_EXPERIENCES).collect(Collectors.toList());

        // ── Replace calculateAtsScore with calculateAtsBreakdown ────────────
        ScoringService.AtsBreakdown breakdown = scoringService.calculateAtsBreakdown(
                reorderedSkills, topProjects, topExperiences, bestSummary, jdKeywords);

        // Build every section
        GeneratedResumeResponse.ProfileSection                    profileSection  = buildProfileSection(profile, user);
        List<GeneratedResumeResponse.SkillSection>                skillSections   = buildSkillSections(reorderedSkills, jdKeywords);
        List<GeneratedResumeResponse.ProjectSection>              projectSections = buildProjectSections(topProjects, jdKeywords);
        List<GeneratedResumeResponse.ExperienceSection>           expSections     = buildExperienceSections(topExperiences, jdKeywords);
        List<GeneratedResumeResponse.EducationSection>            eduSections     = buildEducationSections(educations);

        GeneratedResumeResponse.ResumeContent resumeContent = GeneratedResumeResponse.ResumeContent.builder()
                .profile(profileSection)
                .summary(bestSummary != null ? bestSummary.getContent() : "")
                .skills(skillSections)
                .experiences(expSections)
                .projects(projectSections)
                .educations(eduSections)
                .sectionHeadingColor(SECTION_HEADING_COLOR)
                .build();

        String generatedResumeJson;
        try {
            generatedResumeJson = objectMapper.writeValueAsString(resumeContent);
        } catch (Exception e) {
            generatedResumeJson = "{}";
        }

        String jobTitle    = resolveJobTitle(request);
        String companyName = request.getCompanyName() != null ? request.getCompanyName() : "";

        ResumeVersion version = new ResumeVersion();
        version.setUserId(userId);
        version.setJobTitle(jobTitle);
        version.setCompanyName(companyName);
        version.setJdText(request.getJdText());
        version.setGeneratedResume(generatedResumeJson);
        version.setAtsScore(breakdown.total);
        version.setCreatedAt(LocalDateTime.now());
        ResumeVersion saved = resumeVersionRepository.save(version);

        return GeneratedResumeResponse.builder()
                .resumeVersionId(saved.getId())
                .jobTitle(jobTitle)
                .companyName(companyName)
                .atsScore(breakdown.total)
                .skillScore(breakdown.skillScore)
                .projectScore(breakdown.projectScore)
                .experienceScore(breakdown.experienceScore)
                .summaryScore(breakdown.summaryScore)
                .missingSkills(missingSkills)
                .generatedResume(generatedResumeJson)
                .createdAt(saved.getCreatedAt())
                .resumeContent(resumeContent)
                .build();
    }

    // ─── Section builders ─────────────────────────────────────────────────────

    private GeneratedResumeResponse.ProfileSection buildProfileSection(Profile profile, User user) {

        String resumeEmail = user.getEmail();
        if (profile != null
                && profile.getContactEmail() != null
                && !profile.getContactEmail().isBlank()) {
            resumeEmail = profile.getContactEmail();
        }

        GeneratedResumeResponse.ProfileSection.ProfileSectionBuilder builder =
                GeneratedResumeResponse.ProfileSection.builder()
                        .email(resumeEmail);

        if (profile != null) {
            builder.fullName(profile.getFullName())
                   .phone(profile.getPhone())
                   .location(profile.getLocation())
                   .linkedinUrl(profile.getLinkedinUrl())
                   .githubUrl(profile.getGithubUrl())
                   .portfolioUrl(profile.getPortfolioUrl())
                   .degree(profile.getDegree())
                   .university(profile.getUniversity())
                   .graduationYear(profile.getGraduationYear());
        }
        return builder.build();
    }

    private List<GeneratedResumeResponse.EducationSection> buildEducationSections(
            List<Education> educations) {
        return educations.stream()
                .map(e -> GeneratedResumeResponse.EducationSection.builder()
                        .id(e.getId())
                        .degree(e.getDegree())
                        .fieldOfStudy(e.getFieldOfStudy())
                        .university(e.getUniversity())
                        .graduationYear(e.getGraduationYear())
                        .grade(e.getGrade())
                        .schoolTenthName(e.getSchoolTenthName())
                        .tenthBoard(e.getTenthBoard())
                        .tenthPercentage(e.getTenthPercentage())
                        .tenthYear(e.getTenthYear())
                        .schoolTwelfthName(e.getSchoolTwelfthName())
                        .twelfthBoard(e.getTwelfthBoard())
                        .twelfthPercentage(e.getTwelfthPercentage())
                        .twelfthYear(e.getTwelfthYear())
                        .build())
                .collect(Collectors.toList());
    }

    private List<GeneratedResumeResponse.SkillSection> buildSkillSections(
            List<Skill> skills, Set<String> jdKeywords) {
        return skills.stream()
                .map(s -> GeneratedResumeResponse.SkillSection.builder()
                        .skillName(s.getName())
                        .proficiency(s.getProficiency() != null ? s.getProficiency().name() : "")
                        .matchedWithJd(jdKeywords.contains(keywordNormalizer.normalize(s.getName())))
                        .build())
                .collect(Collectors.toList());
    }

    private List<GeneratedResumeResponse.ProjectSection> buildProjectSections(
            List<Project> projects, Set<String> jdKeywords) {
        return projects.stream()
                .map(p -> {
                    String techStack = p.getSkills() != null
                            ? p.getSkills().stream()
                                .map(Skill::getName)
                                .collect(Collectors.joining(", "))
                            : "";
                    String projectText = scoringService.getProjectText(p);
                    return GeneratedResumeResponse.ProjectSection.builder()
                            .id(p.getId())
                            .title(p.getTitle())
                            .description(p.getDescription())
                            .techStack(techStack)
                            .projectUrl(p.getLiveUrl())
                            .relevanceScore(scoringService.scoreText(projectText, jdKeywords))
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<GeneratedResumeResponse.ExperienceSection> buildExperienceSections(
            List<Experience> experiences, Set<String> jdKeywords) {
        return experiences.stream()
                .map(e -> {
                    String endDateDisplay;
                    if (Boolean.TRUE.equals(e.getCurrentlyWorking())) {
                        endDateDisplay = "Present";
                    } else if (e.getEndDate() != null) {
                        endDateDisplay = e.getEndDate().toString();
                    } else {
                        endDateDisplay = "—";
                    }

                    String expText = scoringService.getExperienceText(e);
                    return GeneratedResumeResponse.ExperienceSection.builder()
                            .id(e.getId())
                            .jobTitle(e.getJobTitle())
                            .companyName(e.getCompanyName())
                            .startDate(e.getStartDate() != null ? e.getStartDate().toString() : "")
                            .endDate(endDateDisplay)
                            .description(e.getDescription())
                            .relevanceScore(scoringService.scoreText(expText, jdKeywords))
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ─── Utilities ────────────────────────────────────────────────────────────

    private String resolveJobTitle(GenerateResumeRequest request) {
        if (request.getJobTitle() != null && !request.getJobTitle().isBlank()) {
            return request.getJobTitle();
        }
        List<String> titleKeywords = Arrays.asList(
                "software engineer", "backend developer", "frontend developer",
                "full stack developer", "data engineer", "data scientist",
                "ml engineer", "devops engineer", "java developer",
                "python developer", "react developer"
        );
        String jdLower = request.getJdText() != null ? request.getJdText().toLowerCase() : "";
        return titleKeywords.stream()
                .filter(jdLower::contains)
                .findFirst()
                .orElse("Software Engineer");
    }
}