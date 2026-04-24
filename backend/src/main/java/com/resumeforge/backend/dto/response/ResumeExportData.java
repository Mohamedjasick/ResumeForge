package com.resumeforge.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ResumeExportData {

    private ProfileSection          profile;
    private String                  summary;
    private List<SkillSection>      skills;
    private List<ExperienceSection> experiences;
    private List<ProjectSection>    projects;

    // ── Fix 1: educations list so the stored JSON deserializes correctly ──────
    private List<EducationSection>  educations;

    // sectionHeadingColor is in the JSON but we don't need it here — ignored
    // automatically because of @JsonIgnoreProperties(ignoreUnknown = true)

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ProfileSection {
        private String  fullName;
        private String  email;
        private String  phone;
        private String  location;
        private String  linkedinUrl;
        private String  githubUrl;
        private String  portfolioUrl;
        private String  degree;
        private String  university;
        private Integer graduationYear;
    }

    // ── Fix 1: new inner class matching the JSON keys exactly ─────────────────
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class EducationSection {
        private Long    id;
        private String  degree;
        private String  fieldOfStudy;
        private String  university;
        private Integer graduationYear;
        private String  grade;

        // Problem 5 — school fields
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
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SkillSection {
        private String  skillName;
        private String  proficiency;
        private boolean matchedWithJd;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ExperienceSection {
        private String jobTitle;
        private String companyName;
        private String startDate;
        private String endDate;
        private String location;
        private String description;
        private double relevanceScore;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ProjectSection {
        private String title;
        private String description;
        private String techStack;
        private String projectUrl;
        private double relevanceScore;
    }
}