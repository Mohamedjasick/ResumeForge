package com.resumeforge.backend.service;

import com.resumeforge.backend.entity.*;
import com.resumeforge.backend.util.JdParser;
import com.resumeforge.backend.util.KeywordNormalizer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScoringService {

    private final JdParser jdParser;
    private final KeywordNormalizer keywordNormalizer;

    // ── Score breakdown ───────────────────────────────────────────────────────
    public static class AtsBreakdown {
        public final int skillScore;      // out of 40
        public final int projectScore;    // out of 30
        public final int experienceScore; // out of 25
        public final int summaryScore;    // out of 5
        public final int total;           // out of 100

        public AtsBreakdown(int skillScore, int projectScore,
                            int experienceScore, int summaryScore) {
            this.skillScore      = skillScore;
            this.projectScore    = projectScore;
            this.experienceScore = experienceScore;
            this.summaryScore    = summaryScore;
            this.total = Math.min(100, skillScore + projectScore + experienceScore + summaryScore);
        }
    }

    // ── Text scoring ──────────────────────────────────────────────────────────
    public int scoreText(String text, Set<String> jdKeywords) {
        if (text == null || text.isBlank() || jdKeywords.isEmpty()) return 0;
        Set<String> textKeywords = jdParser.extractKeywords(text);
        if (textKeywords.isEmpty()) return 0;
        long matched = textKeywords.stream().filter(jdKeywords::contains).count();
        double ratio = (double) matched / textKeywords.size();
        return (int) Math.min(100, Math.round(ratio * 100));
    }

    // ── Text builders ─────────────────────────────────────────────────────────
    private String buildProjectText(Project p) {
        String desc = p.getDescription() != null ? p.getDescription() : "";
        String skillNames = p.getSkills() != null
                ? p.getSkills().stream().map(Skill::getName).collect(Collectors.joining(" "))
                : "";
        return desc + " " + skillNames;
    }

    private String buildExperienceText(Experience e) {
        String jobTitle    = e.getJobTitle()    != null ? e.getJobTitle()    : "";
        String companyName = e.getCompanyName() != null ? e.getCompanyName() : "";
        String description = e.getDescription() != null ? e.getDescription() : "";
        return jobTitle + " " + companyName + " " + description;
    }

    // ── Ranking helpers ───────────────────────────────────────────────────────
    public List<Project> rankProjects(List<Project> projects, Set<String> jdKeywords) {
        return projects.stream()
                .sorted(Comparator.comparingInt((Project p) ->
                        scoreText(buildProjectText(p), jdKeywords)).reversed())
                .collect(Collectors.toList());
    }

    public List<Experience> rankExperience(List<Experience> experiences, Set<String> jdKeywords) {
        return experiences.stream()
                .sorted(Comparator.comparingInt((Experience e) ->
                        scoreText(buildExperienceText(e), jdKeywords)).reversed())
                .collect(Collectors.toList());
    }

    public List<Skill> reorderSkills(List<Skill> skills, Set<String> jdKeywords) {
        return skills.stream()
                .sorted((a, b) -> {
                    boolean aMatched = jdKeywords.contains(keywordNormalizer.normalize(a.getName()));
                    boolean bMatched = jdKeywords.contains(keywordNormalizer.normalize(b.getName()));
                    return Boolean.compare(!aMatched, !bMatched);
                })
                .collect(Collectors.toList());
    }

    /**
     * detectMissingSkills — fixed version
     *
     * A keyword is only flagged as "missing" if it does NOT appear in ANY of:
     *   1. The user's formal Skills list
     *   2. Any Experience description
     *   3. Any Project description / tech stack
     *   4. The selected Summary content
     *
     * This prevents flagging skills that the user clearly knows
     * but hasn't added as a formal skill card.
     */
    public List<String> detectMissingSkills(
            List<Skill> userSkills,
            List<Experience> experiences,
            List<Project> projects,
            Summary selectedSummary,
            Set<String> jdKeywords) {

        // 1 — keywords from formal Skills page
        Set<String> coveredKeywords = userSkills.stream()
                .map(s -> keywordNormalizer.normalize(s.getName()))
                .collect(Collectors.toSet());

        // 2 — keywords found in experience descriptions
        for (Experience e : experiences) {
            coveredKeywords.addAll(jdParser.extractKeywords(buildExperienceText(e)));
        }

        // 3 — keywords found in project descriptions + tech stack
        for (Project p : projects) {
            coveredKeywords.addAll(jdParser.extractKeywords(buildProjectText(p)));
        }

        // 4 — keywords found in the selected summary
        if (selectedSummary != null && selectedSummary.getContent() != null) {
            coveredKeywords.addAll(jdParser.extractKeywords(selectedSummary.getContent()));
        }

        // A JD keyword is truly missing only if it appears nowhere in the resume
        return jdKeywords.stream()
                .filter(kw -> !coveredKeywords.contains(kw))
                .filter(kw -> kw.length() > 2)
                .sorted()
                .collect(Collectors.toList());
    }

    // ── ATS breakdown — main method ───────────────────────────────────────────
    // Weights: Skills 40% | Projects 30% | Experience 25% | Summary 5%
    public AtsBreakdown calculateAtsBreakdown(
            List<Skill> skills,
            List<Project> projects,
            List<Experience> experiences,
            Summary selectedSummary,
            Set<String> jdKeywords) {

        if (jdKeywords.isEmpty()) return new AtsBreakdown(0, 0, 0, 0);

        // Skills (40) — % of user's own skills that appear in JD
        long matchedSkills = skills.stream()
                .map(s -> keywordNormalizer.normalize(s.getName()))
                .filter(jdKeywords::contains)
                .count();
        int skillScore = (int) Math.min(40,
                Math.round((double) matchedSkills / Math.max(skills.size(), 1) * 40));

        // Projects (30) — best project's relevance to JD
        int projectScore = 0;
        if (!projects.isEmpty()) {
            int top = projects.stream()
                    .mapToInt(p -> scoreText(buildProjectText(p), jdKeywords))
                    .max().orElse(0);
            projectScore = (int) Math.min(30, Math.round(top * 0.30));
        }

        // Experience (25) — best experience entry's relevance to JD
        int expScore = 0;
        if (!experiences.isEmpty()) {
            int top = experiences.stream()
                    .mapToInt(e -> scoreText(buildExperienceText(e), jdKeywords))
                    .max().orElse(0);
            expScore = (int) Math.min(25, Math.round(top * 0.25));
        }

        // Summary (5)
        int summaryScore = 0;
        if (selectedSummary != null) {
            summaryScore = (int) Math.min(5,
                    Math.round(scoreText(selectedSummary.getContent(), jdKeywords) * 0.05));
        }

        return new AtsBreakdown(skillScore, projectScore, expScore, summaryScore);
    }

    // Convenience wrapper — returns total only
    public int calculateAtsScore(
            List<Skill> skills,
            List<Project> projects,
            List<Experience> experiences,
            Summary selectedSummary,
            Set<String> jdKeywords) {
        return calculateAtsBreakdown(
                skills, projects, experiences, selectedSummary, jdKeywords).total;
    }

    // ── Summary selection ─────────────────────────────────────────────────────
    public Summary selectBestSummary(List<Summary> summaries, Set<String> jdKeywords) {
        if (summaries == null || summaries.isEmpty()) return null;
        return summaries.stream()
                .max((a, b) -> {
                    String tagA = keywordNormalizer.normalize(
                            a.getDomainTag() != null ? a.getDomainTag() : "");
                    String tagB = keywordNormalizer.normalize(
                            b.getDomainTag() != null ? b.getDomainTag() : "");
                    int scoreA = (jdKeywords.contains(tagA) ? 50 : 0)
                            + scoreText(a.getContent(), jdKeywords);
                    int scoreB = (jdKeywords.contains(tagB) ? 50 : 0)
                            + scoreText(b.getContent(), jdKeywords);
                    return Integer.compare(scoreA, scoreB);
                })
                .orElse(summaries.get(0));
    }

    // ── Exposed for ResumeGenerationService ──────────────────────────────────
    public String getProjectText(Project p)       { return buildProjectText(p); }
    public String getExperienceText(Experience e) { return buildExperienceText(e); }
}