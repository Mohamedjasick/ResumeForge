package com.resumeforge.backend.dto.request;

import lombok.Data;

@Data
public class ExperienceBulletRequest {
    private String content;
    private Integer displayOrder;
}
