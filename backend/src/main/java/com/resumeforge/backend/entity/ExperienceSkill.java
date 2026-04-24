package com.resumeforge.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "experience_skills")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExperienceSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "experience_id", nullable = false)
    private Experience experience;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;
}