package com.resumeforge.backend.dto.request;

import com.resumeforge.backend.entity.Skill.SkillCategory;
import com.resumeforge.backend.entity.Skill.SkillProficiency;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SkillRequest {

    @NotBlank(message = "Skill name is required")
    private String name;

    @NotNull(message = "Category is required")
    private SkillCategory category;

    @NotNull(message = "Proficiency is required")
    private SkillProficiency proficiency;
}