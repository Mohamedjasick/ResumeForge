package com.resumeforge.backend.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ResumeVersionResponse {
    private Long id;
    private String jobTitle;
    private String companyName;
    private String jdText;
    private String generatedResume;
    private Integer atsScore;
    private LocalDateTime createdAt;
}