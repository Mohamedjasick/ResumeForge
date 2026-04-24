package com.resumeforge.backend.dto.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ExperienceRequest {
    private String jobTitle;
    private String companyName;
    private String location;
    private String employmentType;
    private String domainTag;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean currentlyWorking;
    private String description;
}