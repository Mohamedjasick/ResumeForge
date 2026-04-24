package com.resumeforge.backend.dto.request;

import lombok.Data;

@Data
public class ProjectBulletRequest {
    private String content;
    private Integer displayOrder;
}