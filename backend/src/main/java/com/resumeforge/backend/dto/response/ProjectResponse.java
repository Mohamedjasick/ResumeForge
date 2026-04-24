package com.resumeforge.backend.dto.response;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProjectResponse {
    private Long id;
    private String title;
    private String description;
    private String domainTag;
    private LocalDate completionDate;
    private String githubUrl;
    private String liveUrl;
    private LocalDateTime createdAt;
    private List<ProjectBulletResponse> bullets;
    private List<SkillResponse> skills;
}