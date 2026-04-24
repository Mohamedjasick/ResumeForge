package com.resumeforge.backend.dto.response;

import com.resumeforge.backend.entity.Skill.SkillCategory;
import com.resumeforge.backend.entity.Skill.SkillProficiency;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class SkillResponse {
    private Long id;
    private String name;
    private SkillCategory category;
    private SkillProficiency proficiency;
    private LocalDateTime createdAt;
}