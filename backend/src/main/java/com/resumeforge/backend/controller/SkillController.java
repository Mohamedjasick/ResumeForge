package com.resumeforge.backend.controller;

import com.resumeforge.backend.dto.request.SkillRequest;
import com.resumeforge.backend.dto.response.SkillResponse;
import com.resumeforge.backend.entity.Skill.SkillCategory;
import com.resumeforge.backend.service.SkillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;

    @PostMapping
    public ResponseEntity<SkillResponse> addSkill(
            @Valid @RequestBody SkillRequest request,
            Authentication authentication) {
        Long userId = (Long) authentication.getCredentials();
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(skillService.addSkill(userId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SkillResponse> updateSkill(
            @PathVariable Long id,
            @Valid @RequestBody SkillRequest request,
            Authentication authentication) {
        Long userId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(skillService.updateSkill(userId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSkill(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = (Long) authentication.getCredentials();
        skillService.deleteSkill(userId, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<SkillResponse>> getAllSkills(
            Authentication authentication) {
        Long userId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(skillService.getAllSkills(userId));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<SkillResponse>> getByCategory(
            @PathVariable SkillCategory category,
            Authentication authentication) {
        Long userId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(skillService.getSkillsByCategory(userId, category));
    }
}
