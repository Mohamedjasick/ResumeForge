package com.resumeforge.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class GeneratedResumeResponse {
    private Long resumeVersionId;
    private String jobTitle;
    private String companyName;
    private int atsScore;

    // ── ATS breakdown fields ────────────────────────────────────────────────
    private int skillScore;       // out of 40
    private int projectScore;     // out of 30
    private int experienceScore;  // out of 25
    private int summaryScore;     // out of 5

    private List<String> missingSkills;
    private String generatedResume;
    private LocalDateTime createdAt;
    private ResumeContent resumeContent;

    @Data
    @Builder
    public static class ResumeContent {
        private ProfileSection profile;
        private List<SkillSection> skills;
        private List<ProjectSection> projects;
        private List<ExperienceSection> experiences;
        private String summary;

        // ── Problem 1 fix ──────────────────────────────────────────
        private List<EducationSection> educations;

        // ── Problem 3 fix ──────────────────────────────────────────
        // Always set to "#1a1a1a" — PDF/HTML renderer reads this
        // for SUMMARY / SKILLS / EXPERIENCE / PROJECTS headings.
        // Previously the template was defaulting to a blue constant.
        private String sectionHeadingColor; // e.g. "#1a1a1a"
    }

    @Data
    @Builder
    public static class ProfileSection {
        private String fullName;
        private String email;           // Problem 2: always profile email
        private String phone;
        private String location;
        private String linkedinUrl;
        private String githubUrl;
        private String portfolioUrl;
        private String degree;
        private String university;
        private Integer graduationYear;
    }

    // ── Problem 1: new section ──────────────────────────────────────────────
    @Data
    @Builder
    public static class EducationSection {
        private Long   id;
        private String degree;
        private String fieldOfStudy;
        private String university;
        private Integer graduationYear;
        private String grade;

        // Problem 5 — school fields (null-safe: older records just omit them)
        private String  schoolTenthName;
        private String  tenthBoard;
        private String  tenthPercentage;
        private Integer tenthYear;
        private String  schoolTwelfthName;
        private String  twelfthBoard;
        private String  twelfthPercentage;
        private Integer twelfthYear;
    }

    @Data
    @Builder
    public static class SkillSection {
        private String  skillName;
        private String  proficiency;
        private boolean matchedWithJd;
    }

    @Data
    @Builder
    public static class ProjectSection {
        private Long   id;
        private String title;
        private String description;
        private String techStack;
        private String projectUrl;
        private int    relevanceScore;
    }

    @Data
    @Builder
    public static class ExperienceSection {
        private Long   id;
        private String jobTitle;
        private String companyName;
        private String startDate;
        private String endDate;         // Problem 4: "Present" / date / "—"
        private String description;
        private int    relevanceScore;
    }
}