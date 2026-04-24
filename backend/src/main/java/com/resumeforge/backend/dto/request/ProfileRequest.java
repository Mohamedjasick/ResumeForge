package com.resumeforge.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProfileRequest {

    @Size(max = 100)
    private String fullName;

    @Size(max = 20)
    private String phone;

    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;

    @Size(max = 100)
    private String location;

    // Issue #4: separate contact email shown on resume (optional)
    @Email
    @Size(max = 255)
    private String contactEmail;

    private String degree;
    private String university;
    private Integer graduationYear;
}