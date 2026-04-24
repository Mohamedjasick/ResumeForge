package com.resumeforge.backend.dto.response;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ExperienceResponse {
    private Long id;
    private String jobTitle;
    private String companyName;
    private String location;
    private String employmentType;
    private String domainTag;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean currentlyWorking;
    private String description;
    private LocalDateTime createdAt;
}