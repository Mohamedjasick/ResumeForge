package com.resumeforge.backend.repository;

import com.resumeforge.backend.entity.Education;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EducationRepository extends JpaRepository<Education, Long> {

    List<Education> findByUserIdOrderByGraduationYearDesc(Long userId);

    void deleteByIdAndUserId(Long id, Long userId);
}