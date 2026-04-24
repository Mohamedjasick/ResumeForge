package com.resumeforge.backend.util;

import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class KeywordNormalizer {

    private static final Map<String, String> SYNONYM_MAP = new HashMap<>();

    static {
        // ── JavaScript ecosystem ──────────────────────────────────────────────
        SYNONYM_MAP.put("js",           "javascript");
        SYNONYM_MAP.put("es6",          "javascript");
        SYNONYM_MAP.put("es2015",       "javascript");
        SYNONYM_MAP.put("ecmascript",   "javascript");
        SYNONYM_MAP.put("node",         "node.js");
        SYNONYM_MAP.put("nodejs",       "node.js");
        SYNONYM_MAP.put("node js",      "node.js");
        SYNONYM_MAP.put("react",        "react.js");
        SYNONYM_MAP.put("reactjs",      "react.js");
        SYNONYM_MAP.put("react js",     "react.js");
        SYNONYM_MAP.put("next",         "next.js");
        SYNONYM_MAP.put("nextjs",       "next.js");
        SYNONYM_MAP.put("vue",          "vue.js");
        SYNONYM_MAP.put("vuejs",        "vue.js");

        // ── TypeScript ────────────────────────────────────────────────────────
        SYNONYM_MAP.put("ts",           "typescript");

        // ── Java ecosystem ────────────────────────────────────────────────────
        // "spring" and "springboot" as shorthands both → "spring boot"
        SYNONYM_MAP.put("spring",           "spring boot");
        SYNONYM_MAP.put("springboot",       "spring boot");
        SYNONYM_MAP.put("jpa",              "spring data jpa");
        SYNONYM_MAP.put("hibernate",        "spring data jpa");
        SYNONYM_MAP.put("spring data jpa",  "spring data jpa");
        SYNONYM_MAP.put("spring boot",      "spring boot");

        // ── Python ────────────────────────────────────────────────────────────
        SYNONYM_MAP.put("py",           "python");
        SYNONYM_MAP.put("django rest",  "django");
        SYNONYM_MAP.put("flask api",    "flask");

        // ── Cloud / DevOps ────────────────────────────────────────────────────
        SYNONYM_MAP.put("aws",                  "amazon web services");
        SYNONYM_MAP.put("amazon",               "amazon web services");
        SYNONYM_MAP.put("amazon web services",  "amazon web services");
        SYNONYM_MAP.put("gcp",                  "google cloud");
        SYNONYM_MAP.put("google cloud platform","google cloud");
        SYNONYM_MAP.put("azure",                "microsoft azure");
        SYNONYM_MAP.put("k8s",                  "kubernetes");
        SYNONYM_MAP.put("docker compose",       "docker");
        SYNONYM_MAP.put("ci/cd",                "ci cd");
        SYNONYM_MAP.put("cicd",                 "ci cd");
        SYNONYM_MAP.put("github actions",       "ci cd");
        SYNONYM_MAP.put("jenkins",              "ci cd");
        SYNONYM_MAP.put("actions",              "ci cd");
        SYNONYM_MAP.put("ci cd",                "ci cd");

        // ── Version control ───────────────────────────────────────────────────
        // github/gitlab kept as "git" — they signal version control familiarity
        SYNONYM_MAP.put("git",              "git");
        SYNONYM_MAP.put("github",           "git");
        SYNONYM_MAP.put("gitlab",           "git");
        SYNONYM_MAP.put("bitbucket",        "git");
        SYNONYM_MAP.put("version control",  "git");

        // ── Databases — relational ────────────────────────────────────────────
        SYNONYM_MAP.put("mysql",        "mysql");
        SYNONYM_MAP.put("postgres",     "postgresql");
        SYNONYM_MAP.put("postgresql",   "postgresql");
        SYNONYM_MAP.put("pg",           "postgresql");
        SYNONYM_MAP.put("mssql",        "sql server");
        SYNONYM_MAP.put("sql",          "sql");
        // "databases" alone is too generic — removed the sql mapping for it
        // to avoid false positives when JD mentions "databases" in a generic context

        // ── Databases — NoSQL ─────────────────────────────────────────────────
        // "mongo" and "mongodb" → canonical "mongodb"
        SYNONYM_MAP.put("mongo",        "mongodb");
        SYNONYM_MAP.put("mongodb",      "mongodb");
        // "nosql" / "nosql database" → generic "nosql" — not pinned to mongodb
        // because the JD might mean Cassandra, Redis, DynamoDB etc.
        SYNONYM_MAP.put("nosql",            "nosql");
        SYNONYM_MAP.put("nosql database",   "nosql");
        SYNONYM_MAP.put("redis",        "redis");

        // ── REST / API ────────────────────────────────────────────────────────
        SYNONYM_MAP.put("rest",             "rest");
        SYNONYM_MAP.put("restful",          "rest");
        SYNONYM_MAP.put("rest api",         "rest");
        SYNONYM_MAP.put("restful api",      "rest");
        SYNONYM_MAP.put("rest apis",        "rest");
        SYNONYM_MAP.put("restful apis",     "rest");
        SYNONYM_MAP.put("graphql api",      "graphql");

        // ── Architecture ──────────────────────────────────────────────────────
        SYNONYM_MAP.put("microservice",              "microservices");
        SYNONYM_MAP.put("microservices",             "microservices");
        SYNONYM_MAP.put("microservices architecture","microservices");
        SYNONYM_MAP.put("microservice architecture", "microservices");
        SYNONYM_MAP.put("micro services",            "microservices");
        SYNONYM_MAP.put("oop",                       "object oriented programming");
        SYNONYM_MAP.put("oops",                      "object oriented programming");
        SYNONYM_MAP.put("object oriented",           "object oriented programming");

        // ── Auth ──────────────────────────────────────────────────────────────
        SYNONYM_MAP.put("jwt",                  "jwt");
        SYNONYM_MAP.put("jwt authentication",   "jwt");
        SYNONYM_MAP.put("jwt auth",             "jwt");
        SYNONYM_MAP.put("json web token",       "jwt");
        SYNONYM_MAP.put("json web tokens",      "jwt");
        SYNONYM_MAP.put("bearer",               "jwt");

        // ── ML / AI ───────────────────────────────────────────────────────────
        SYNONYM_MAP.put("ml",               "machine learning");
        SYNONYM_MAP.put("dl",               "deep learning");
        SYNONYM_MAP.put("nlp",              "natural language processing");
        SYNONYM_MAP.put("llm",              "large language model");
        SYNONYM_MAP.put("gen ai",           "generative ai");
        SYNONYM_MAP.put("genai",            "generative ai");

        // ── Data structures ───────────────────────────────────────────────────
        SYNONYM_MAP.put("dsa",              "data structures");
        SYNONYM_MAP.put("data structures",  "data structures");

        // ── Unit testing ──────────────────────────────────────────────────────
        SYNONYM_MAP.put("unit test",        "unit testing");
        SYNONYM_MAP.put("unit tests",       "unit testing");
        SYNONYM_MAP.put("unit testing",     "unit testing");

        // ── Process / methodology ─────────────────────────────────────────────
        SYNONYM_MAP.put("agile scrum",              "agile scrum");
        SYNONYM_MAP.put("agile methodology",        "agile scrum");
        SYNONYM_MAP.put("scrum",                    "agile scrum");
        SYNONYM_MAP.put("test driven development",  "test driven development");
        SYNONYM_MAP.put("solid principles",         "solid principles");
        SYNONYM_MAP.put("code review",              "code review");
        SYNONYM_MAP.put("problem solving",          "problem solving");
        SYNONYM_MAP.put("open source",              "open source");
        SYNONYM_MAP.put("database design",          "database design");
        SYNONYM_MAP.put("query optimization",       "query optimization");
        SYNONYM_MAP.put("relational database",      "relational database");
        SYNONYM_MAP.put("object oriented programming", "object oriented programming");
    }

    public String normalize(String keyword) {
        if (keyword == null) return "";
        String lower = keyword.toLowerCase().trim();
        return SYNONYM_MAP.getOrDefault(lower, lower);
    }

    public Set<String> normalizeAll(Set<String> keywords) {
        Set<String> normalized = new HashSet<>();
        for (String kw : keywords) {
            normalized.add(normalize(kw));
        }
        return normalized;
    }
}