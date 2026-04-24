package com.resumeforge.backend.repository;

import com.resumeforge.backend.entity.ExperienceSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExperienceSkillRepository extends JpaRepository<ExperienceSkill, Long> {
    List<ExperienceSkill> findByExperienceId(Long experienceId);
    void deleteByExperienceId(Long experienceId);
    boolean existsByExperienceIdAndSkillId(Long experienceId, Long skillId);
}