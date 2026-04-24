package com.resumeforge.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "experiences")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Experience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "job_title", nullable = false, length = 255)
    private String jobTitle;

    @Column(name = "company_name", nullable = false, length = 255)
    private String companyName;

    @Column(name = "employment_type", length = 50)
    private String employmentType;

    @Column(length = 255)
    private String location;

    @Column(name = "domain_tag", length = 100)
    private String domainTag;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "currently_working")
    private Boolean currentlyWorking;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}