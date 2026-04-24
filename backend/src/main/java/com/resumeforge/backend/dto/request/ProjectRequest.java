package com.resumeforge.backend.dto.request;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class ProjectRequest {
    private String title;
    private String description;
    private String domainTag;
    private LocalDate completionDate;
    private String githubUrl;
    private String liveUrl;
    private List<ProjectBulletRequest> bullets;
    private List<Long> skillIds;
}