package com.resumeforge.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EducationResponse {

    private Long    id;
    private Long    userId;
    private String  degree;
    private String  fieldOfStudy;
    private String  university;
    private Integer graduationYear;
    private String  grade;

    // ── Problem 5: 10th ───────────────────────────────────────────────────────
    private String  schoolTenthName;
    private String  tenthBoard;
    private String  tenthPercentage;
    private Integer tenthYear;

    // ── Problem 5: 12th ───────────────────────────────────────────────────────
    private String  schoolTwelfthName;
    private String  twelfthBoard;
    private String  twelfthPercentage;
    private Integer twelfthYear;
}