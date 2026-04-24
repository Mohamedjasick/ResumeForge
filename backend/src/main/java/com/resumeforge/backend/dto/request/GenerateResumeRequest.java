package com.resumeforge.backend.dto.request;

import lombok.Data;

@Data
public class GenerateResumeRequest {
    private String jdText;
    private String jobTitle;     // optional hint from user
    private String companyName;  // optional hint from user
}