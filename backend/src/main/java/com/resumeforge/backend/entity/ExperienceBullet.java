package com.resumeforge.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "experience_bullets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExperienceBullet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "experience_id", nullable = false)
    private Experience experience;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "display_order")
    private Integer displayOrder;
}