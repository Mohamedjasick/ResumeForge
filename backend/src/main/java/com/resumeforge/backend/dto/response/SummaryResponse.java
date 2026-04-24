package com.resumeforge.backend.dto.response;

import java.time.LocalDateTime;

public class SummaryResponse {

    private Long id;
    private String domainTag;
    private String content;
    private LocalDateTime createdAt;

    public SummaryResponse(Long id, String domainTag, String content, LocalDateTime createdAt) {
        this.id = id;
        this.domainTag = domainTag;
        this.content = content;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public String getDomainTag() { return domainTag; }
    public String getContent() { return content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}