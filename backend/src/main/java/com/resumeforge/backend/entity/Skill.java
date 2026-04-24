package com.resumeforge.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "skills")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private SkillCategory category;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private SkillProficiency proficiency;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public enum SkillCategory {
        TECHNICAL, TOOL, SOFT
    }

    public enum SkillProficiency {
        BEGINNER, INTERMEDIATE, EXPERT
    }
}