package com.resumeforge.backend.dto.response;

import lombok.Data;

@Data
public class ExperienceBulletResponse {
    private Long id;
    private String content;
    private Integer displayOrder;
}