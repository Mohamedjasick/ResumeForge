package com.resumeforge.backend.repository;

import com.resumeforge.backend.entity.Experience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExperienceRepository extends JpaRepository<Experience, Long> {
    List<Experience> findByUserId(Long userId);
    List<Experience> findByUserIdOrderByStartDateDesc(Long userId);
    Optional<Experience> findByIdAndUserId(Long id, Long userId);
}