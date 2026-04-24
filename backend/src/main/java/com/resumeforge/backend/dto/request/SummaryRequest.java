package com.resumeforge.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SummaryRequest {

    @Size(max = 100, message = "Domain tag must not exceed 100 characters")
    private String domainTag;

    @NotBlank(message = "Content must not be blank")
    private String content;

    public String getDomainTag() { return domainTag; }
    public void setDomainTag(String domainTag) { this.domainTag = domainTag; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}