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

    // ── Fuzzy skill match ─────────────────────────────────────────────────────
    /**
     * Returns true if a user skill matches any JD keyword using:
     *   1. Exact normalized match          ("react" == "react")
     *   2. Skill contains JD keyword       ("spring boot" contains "spring")
     *   3. JD keyword contains skill       ("reactjs" contains "react")
     *   4. Alias / synonym map             ("k8s" → "kubernetes")
     */
    private static final Map<String, String> ALIASES = Map.ofEntries(
        Map.entry("k8s",               "kubernetes"),
        Map.entry("js",                "javascript"),
        Map.entry("ts",                "typescript"),
        Map.entry("postgres",          "postgresql"),
        Map.entry("mongo",             "mongodb"),
        Map.entry("node",              "node.js"),
        Map.entry("nodejs",            "node.js"),
        Map.entry("reactjs",           "react"),
        Map.entry("react.js",          "react"),
        Map.entry("next.js",           "next"),
        Map.entry("nextjs",            "next"),
        Map.entry("spring",            "spring boot"),
        Map.entry("ci cd",             "ci/cd"),
        Map.entry("cicd",              "ci/cd"),
        Map.entry("system design",     "distributed systems"),
        Map.entry("distributed systems","system design"),
        Map.entry("rest",              "rest api"),
        Map.entry("restful",           "rest api"),
        Map.entry("rest api",          "rest"),
        Map.entry("amazon web services","aws"),
        Map.entry("aws",               "amazon web services"),
        Map.entry("gcp",               "google cloud"),
        Map.entry("google cloud",      "gcp"),
        Map.entry("tailwind",          "tailwind css"),
        Map.entry("tailwind css",      "tailwind"),
        Map.entry("junit",             "unit testing"),
        Map.entry("unit testing",      "junit"),
        Map.entry("jest",              "unit testing"),
        Map.entry("agile",             "agile scrum"),
        Map.entry("scrum",             "agile scrum")
    );

    private boolean skillMatchesJd(String normalizedSkill, Set<String> jdKeywords) {
        // 1. Exact match
        if (jdKeywords.contains(normalizedSkill)) return true;

        // 2. Alias match
        String alias = ALIASES.get(normalizedSkill);
        if (alias != null && jdKeywords.contains(alias)) return true;

        // 3. Partial: skill name is contained within a JD keyword
        //    e.g. skill="react" matches jd keyword="react.js" or "reactjs"
        for (String kw : jdKeywords) {
            if (kw.contains(normalizedSkill) || normalizedSkill.contains(kw)) return true;
        }

        return false;
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
                    String normA = keywordNormalizer.normalize(a.getName());
                    String normB = keywordNormalizer.normalize(b.getName());
                    boolean aMatched = skillMatchesJd(normA, jdKeywords);
                    boolean bMatched = skillMatchesJd(normB, jdKeywords);
                    return Boolean.compare(!aMatched, !bMatched);
                })
                .collect(Collectors.toList());
    }

    /**
     * detectMissingSkills
     *
     * A JD keyword is only flagged missing if it does NOT appear in ANY of:
     *   1. User's formal Skills list (with fuzzy matching)
     *   2. Any Experience description
     *   3. Any Project description / tech stack
     *   4. The selected Summary content
     */
    public List<String> detectMissingSkills(
            List<Skill> userSkills,
            List<Experience> experiences,
            List<Project> projects,
            Summary selectedSummary,
            Set<String> jdKeywords) {

        // Normalized user skill names (for fuzzy checking)
        List<String> normalizedUserSkills = userSkills.stream()
                .map(s -> keywordNormalizer.normalize(s.getName()))
                .collect(Collectors.toList());

        // Keywords covered by experience, projects, summary text
        Set<String> textCoveredKeywords = new HashSet<>();
        for (Experience e : experiences) {
            textCoveredKeywords.addAll(jdParser.extractKeywords(buildExperienceText(e)));
        }
        for (Project p : projects) {
            textCoveredKeywords.addAll(jdParser.extractKeywords(buildProjectText(p)));
        }
        if (selectedSummary != null && selectedSummary.getContent() != null) {
            textCoveredKeywords.addAll(jdParser.extractKeywords(selectedSummary.getContent()));
        }

        return jdKeywords.stream()
                .filter(kw -> {
                    // Not covered by skills (fuzzy)
                    boolean coveredBySkills = normalizedUserSkills.stream()
                            .anyMatch(skill -> skillMatchesJd(skill, Set.of(kw)));
                    // Not covered by text content
                    boolean coveredByText = textCoveredKeywords.contains(kw);
                    return !coveredBySkills && !coveredByText;
                })
                .filter(kw -> kw.length() > 2)
                .sorted()
                .collect(Collectors.toList());
    }

    // ── ATS breakdown ─────────────────────────────────────────────────────────
    // Weights: Skills 40 | Projects 30 | Experience 25 | Summary 5
    public AtsBreakdown calculateAtsBreakdown(
            List<Skill> skills,
            List<Project> projects,
            List<Experience> experiences,
            Summary selectedSummary,
            Set<String> jdKeywords) {

        if (jdKeywords.isEmpty()) return new AtsBreakdown(0, 0, 0, 0);

        // ── Skills (40) ───────────────────────────────────────────────────────
        // FIX: denominator = jdKeywords size, not user skills size.
        // We count how many JD keywords are covered by the user's skill list.
        // This way 15/15 JD keywords matched = 40/40, regardless of having 31 skills.
        long matchedJdKeywords = jdKeywords.stream()
                .filter(kw -> {
                    // Is this JD keyword matched by any user skill (fuzzy)?
                    return skills.stream()
                            .map(s -> keywordNormalizer.normalize(s.getName()))
                            .anyMatch(norm -> skillMatchesJd(norm, Set.of(kw)));
                })
                .count();

        int skillScore = (int) Math.min(40,
                Math.round((double) matchedJdKeywords / Math.max(jdKeywords.size(), 1) * 40));

        // ── Projects (30) ─────────────────────────────────────────────────────
        int projectScore = 0;
        if (!projects.isEmpty()) {
            int top = projects.stream()
                    .mapToInt(p -> scoreText(buildProjectText(p), jdKeywords))
                    .max().orElse(0);
            projectScore = (int) Math.min(30, Math.round(top * 0.30));
        }

        // ── Experience (25) ───────────────────────────────────────────────────
        int expScore = 0;
        if (!experiences.isEmpty()) {
            int top = experiences.stream()
                    .mapToInt(e -> scoreText(buildExperienceText(e), jdKeywords))
                    .max().orElse(0);
            expScore = (int) Math.min(25, Math.round(top * 0.25));
        }

        // ── Summary (5) ───────────────────────────────────────────────────────
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