package com.resumeforge.backend.util;

import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

import java.util.*;

@Component
@RequiredArgsConstructor
public class JdParser {

    private final KeywordNormalizer keywordNormalizer;

    // ── ALLOWLIST — only these single tokens are ever extracted ───────────────
    // Add new skills here as needed. Never add generic English words.
    private static final Set<String> KNOWN_TECH_TOKENS = new HashSet<>(Arrays.asList(
        // ── Programming languages ─────────────────────────────────────────────
        "java", "python", "kotlin", "scala", "golang", "go", "rust",
        "javascript", "typescript", "ruby", "php", "swift", "matlab",
        "perl", "bash", "shell", "groovy", "dart", "elixir", "haskell",
        "lua", "assembly", "cobol", "fortran", "vhdl", "verilog",
        // C-family
        "c", "c++", "c#",

        // ── Web / Frontend frameworks ─────────────────────────────────────────
        "html", "css", "sass", "scss", "tailwind", "bootstrap",
        "jquery", "svelte", "ember", "backbone", "gatsby", "astro",
        "webpack", "vite", "babel", "parcel",
        // Common shorthand aliases that appear in JDs as single tokens
        "react", "angular", "vue", "next",

        // ── Backend frameworks ────────────────────────────────────────────────
        "django", "flask", "fastapi", "express", "nestjs", "laravel",
        "rails", "sinatra", "gin", "fiber", "actix", "axum",
        "micronaut", "quarkus", "dropwizard", "struts", "jsf",
        // Spring shorthand — appears frequently as just "spring" in JDs
        "spring", "springboot",

        // ── Databases — relational ────────────────────────────────────────────
        "mysql", "postgresql", "sqlite", "oracle", "mssql", "mariadb",
        "db2", "sybase",
        // Common shorthand aliases
        "postgres",

        // ── Databases — NoSQL ─────────────────────────────────────────────────
        "mongodb", "redis", "elasticsearch", "cassandra", "dynamodb",
        "firebase", "supabase", "neo4j", "influxdb", "couchdb",
        "hbase", "couchbase", "memcached", "arangodb", "rethinkdb",
        // Common shorthand aliases
        "mongo",

        // ── Cloud platforms ───────────────────────────────────────────────────
        // Top-level providers only — sub-services like ec2, s3, eks, rds etc.
        // removed to avoid redundant missing skill flags alongside AWS/GCP.
        "aws", "gcp", "azure",
        "lambda", "bigquery",

        // ── DevOps / Infrastructure ───────────────────────────────────────────
        "docker", "kubernetes", "k8s", "terraform", "ansible", "puppet",
        "chef", "vagrant", "packer", "helm", "istio", "consul",
        "jenkins", "gitlab", "github", "bitbucket", "argocd", "spinnaker",
        "nginx", "apache", "haproxy", "traefik",
        "linux", "unix", "ubuntu", "centos", "debian",
        "git", "gradle", "maven", "ant", "bazel", "make",
        "sonarqube", "nexus", "artifactory",
        // Node shorthand — appears as just "node" in JDs
        "node", "nodejs",

        // ── Messaging / Streaming ─────────────────────────────────────────────
        "kafka", "rabbitmq", "activemq", "celery", "nats", "zeromq",
        "kinesis",

        // ── APIs / Protocols ──────────────────────────────────────────────────
        "graphql", "grpc", "websocket", "soap", "oauth", "jwt",
        "openapi", "swagger", "postman",

        // ── Testing ───────────────────────────────────────────────────────────
        "junit", "mockito", "jest", "mocha", "chai", "cypress",
        "selenium", "playwright", "testng", "spock", "pytest",
        "jasmine", "karma",

        // ── Java ecosystem specifics ──────────────────────────────────────────
        "hibernate", "lombok", "log4j", "slf4j", "jackson", "gson",
        "flyway", "liquibase", "actuator",

        // ── AI / ML / Data ────────────────────────────────────────────────────
        "tensorflow", "pytorch", "keras", "sklearn", "scikit",
        "pandas", "numpy", "scipy", "matplotlib", "seaborn",
        "opencv", "huggingface", "langchain", "llama", "openai",
        "spark", "hadoop", "hive", "airflow", "dbt", "mlflow",
        "tableau", "powerbi", "looker",

        // ── Security ─────────────────────────────────────────────────────────
        "ssl", "tls", "https", "oauth2", "saml", "ldap", "keycloak",
        "vault", "okta",

        // ── Monitoring / Observability ────────────────────────────────────────
        "prometheus", "grafana", "datadog", "splunk", "kibana",
        "logstash", "jaeger", "zipkin", "newrelic", "dynatrace",

        // ── Design / Collaboration tools ──────────────────────────────────────
        "jira", "confluence", "figma", "notion", "slack", "trello",
        "asana", "linear",

        // ── Mobile ───────────────────────────────────────────────────────────
        "android", "ios", "flutter", "reactnative", "xamarin",

        // ── Other common standalone tech terms ────────────────────────────────
        "microservices", "serverless", "blockchain", "solidity",
        "cdn", "regex", "xml", "json", "yaml", "toml"
    ));

    // Multi-word tech terms — checked BEFORE single-token extraction.
    // Longer / more specific terms listed first so they shadow substrings.
    private static final List<String> MULTI_WORD_TECH_TERMS = Arrays.asList(
        // AI / ML
        "natural language processing",
        "large language model",
        "generative ai",
        "computer vision",
        "machine learning",
        "deep learning",
        // Data
        "data structures",
        "database design",
        "query optimization",
        // Spring — spring data jpa BEFORE spring boot
        "spring data jpa",
        "spring boot",
        // JS frameworks
        "node.js", "react.js", "vue.js", "next.js",
        "angular.js", "angular",
        // REST — most specific first
        "restful apis", "restful api",
        "rest apis",    "rest api",
        "graphql api",
        // Auth
        "json web tokens", "json web token",
        "jwt authentication", "jwt auth",
        // Architecture
        "microservices architecture", "microservice architecture",
        "object oriented programming",
        "solid principles",
        "system design",
        "low level design",
        "high level design",
        "distributed systems",
        "event driven architecture",
        // DevOps / Cloud — most specific first
        "amazon web services",
        "google cloud platform", "google cloud",
        "microsoft azure",
        "github actions",
        "docker compose",
        "ci/cd", "ci cd",
        // Best practices / process
        "code review",
        "problem solving",
        "open source",
        "test driven development",
        "unit testing", "unit tests", "unit test",
        "agile methodology", "agile scrum",
        "version control",
        // DB patterns
        "relational database",
        "nosql database",
        "sql server",
        "react native"
    );

    // Lines starting with these phrases are recruiter signature / noise
    private static final List<String> SIGNATURE_TRIM_MARKERS = Arrays.asList(
        "regards,", "regards", "best regards", "warm regards",
        "thanks,", "thanks", "thank you,", "thank you",
        "sincerely,", "sincerely", "cheers,", "cheers",
        "looking forward", "feel free to", "please feel free",
        "kindly revert", "for any queries", "apply now",
        "apply at", "apply via", "click here to apply",
        "salary:", "ctc:", "lpa:", "package:", "compensation:",
        "perks:", "benefits:", "notice period:", "joining:"
    );

    public Set<String> extractKeywords(String jdText) {
        if (jdText == null || jdText.isBlank()) return Collections.emptySet();

        String text = trimRecruiterNoise(jdText).toLowerCase();
        Set<String> keywords = new HashSet<>();

        // ── Step 1: multi-word tech terms (allowlisted phrases) ──────────────
        for (String term : MULTI_WORD_TECH_TERMS) {
            if (text.contains(term)) {
                keywords.add(keywordNormalizer.normalize(term));
            }
        }

        // ── Step 2: single-token extraction (allowlist ONLY) ─────────────────
        String cleaned = text
                .replaceAll("[^a-z0-9.#+/\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();

        for (String token : cleaned.split("\\s+")) {
            token = token.replaceAll("^[^a-z0-9]+|[^a-z0-9]+$", "");

            if (token.length() < 2) continue;
            if (token.matches("\\d+")) continue;

            // ALLOWLIST CHECK — only known tech tokens pass
            if (!KNOWN_TECH_TOKENS.contains(token)) continue;

            String normalized = keywordNormalizer.normalize(token);
            keywords.add(normalized);
        }

        return keywords;
    }

    private String trimRecruiterNoise(String text) {
        String[] lines = text.split("\\r?\\n");
        StringBuilder sb = new StringBuilder();
        for (String line : lines) {
            String lower = line.strip().toLowerCase();
            boolean isNoiseLine = SIGNATURE_TRIM_MARKERS.stream()
                    .anyMatch(marker -> lower.startsWith(marker));
            if (isNoiseLine) break;
            sb.append(line).append("\n");
        }
        return sb.length() > 0 ? sb.toString() : text;
    }
}