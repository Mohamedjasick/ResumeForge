package com.resumeforge.backend.dto.request;

import lombok.Data;

@Data
public class ResumeVersionRequest {
    private String jobTitle;
    private String companyName;
    private String jdText;
    private String generatedResume;
    private Integer atsScore;
}