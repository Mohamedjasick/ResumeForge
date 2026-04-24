package com.resumeforge.backend.repository;

import com.resumeforge.backend.entity.ProjectBullet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectBulletRepository extends JpaRepository<ProjectBullet, Long> {
    List<ProjectBullet> findByProjectIdOrderByDisplayOrder(Long projectId);
    void deleteByProjectId(Long projectId);
}