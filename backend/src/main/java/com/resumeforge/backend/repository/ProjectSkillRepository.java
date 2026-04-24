package com.resumeforge.backend.repository;

import com.resumeforge.backend.entity.ProjectSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectSkillRepository extends JpaRepository<ProjectSkill, Long> {
    List<ProjectSkill> findByProjectId(Long projectId);
    void deleteByProjectId(Long projectId);
    boolean existsByProjectIdAndSkillId(Long projectId, Long skillId);
}
