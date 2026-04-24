package com.resumeforge.backend.dto.response;

import lombok.Data;

@Data
public class ProjectBulletResponse {
    private Long id;
    private String content;
    private Integer displayOrder;
}