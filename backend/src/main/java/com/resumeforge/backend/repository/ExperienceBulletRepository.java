package com.resumeforge.backend.repository;

import com.resumeforge.backend.entity.ExperienceBullet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExperienceBulletRepository extends JpaRepository<ExperienceBullet, Long> {
    List<ExperienceBullet> findByExperienceIdOrderByDisplayOrder(Long experienceId);
    void deleteByExperienceId(Long experienceId);
}