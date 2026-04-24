package com.resumeforge.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "project_bullets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectBullet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "display_order")
    private Integer displayOrder;
}