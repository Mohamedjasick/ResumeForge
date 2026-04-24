package com.resumeforge.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "full_name", length = 255)
    private String fullName;

    /**
     * Issue #4 fix: contact email shown on the generated resume.
     * This is separate from the auth/login email stored on the User entity.
     * If left blank, ResumeGenerationService falls back to user.getEmail().
     * ddl-auto=update will add the contact_email column automatically on restart.
     */
    @Column(name = "contact_email", length = 255)
    private String contactEmail;

    @Column(length = 20)
    private String phone;

    @Column(length = 255)
    private String location;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "portfolio_url")
    private String portfolioUrl;

    @Column(length = 255)
    private String degree;

    @Column(length = 255)
    private String university;

    @Column(name = "graduation_year")
    private Integer graduationYear;

    @Column(name = "completeness_score")
    private Integer completenessScore;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}