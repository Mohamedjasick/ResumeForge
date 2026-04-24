package com.resumeforge.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "education")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Education {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // ── Degree / University ───────────────────────────────────────────────────
    @Column(nullable = false, length = 150)
    private String degree;

    @Column(name = "field_of_study", length = 150)
    private String fieldOfStudy;

    @Column(nullable = false, length = 200)
    private String university;

    @Column(name = "graduation_year")
    private Integer graduationYear;

    @Column(length = 50)
    private String grade;

    // ── Problem 5: 10th school details ───────────────────────────────────────
    @Column(name = "school_tenth_name", length = 200)
    private String schoolTenthName;

    @Column(name = "tenth_board", length = 100)
    private String tenthBoard;          // e.g. "CBSE", "ICSE", "State Board"

    @Column(name = "tenth_percentage", length = 20)
    private String tenthPercentage;     // stored as string e.g. "92.4%"

    @Column(name = "tenth_year")
    private Integer tenthYear;

    // ── Problem 5: 12th school details ───────────────────────────────────────
    @Column(name = "school_twelfth_name", length = 200)
    private String schoolTwelfthName;

    @Column(name = "twelfth_board", length = 100)
    private String twelfthBoard;

    @Column(name = "twelfth_percentage", length = 20)
    private String twelfthPercentage;

    @Column(name = "twelfth_year")
    private Integer twelfthYear;

    // ─────────────────────────────────────────────────────────────────────────
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}