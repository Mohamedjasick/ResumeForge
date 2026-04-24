package com.resumeforge.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class EducationRequest {

    @NotBlank(message = "Degree is required")
    @Size(max = 150)
    private String degree;

    @Size(max = 150)
    private String fieldOfStudy;

    @NotBlank(message = "University is required")
    @Size(max = 200)
    private String university;

    private Integer graduationYear;

    @Size(max = 50)
    private String grade;

    // ── Problem 5: 10th ───────────────────────────────────────────────────────
    @Size(max = 200)
    private String schoolTenthName;

    @Size(max = 100)
    private String tenthBoard;

    @Size(max = 20)
    private String tenthPercentage;

    private Integer tenthYear;

    // ── Problem 5: 12th ───────────────────────────────────────────────────────
    @Size(max = 200)
    private String schoolTwelfthName;

    @Size(max = 100)
    private String twelfthBoard;

    @Size(max = 20)
    private String twelfthPercentage;

    private Integer twelfthYear;
}