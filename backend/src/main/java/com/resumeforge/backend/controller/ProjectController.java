package com.resumeforge.backend.controller;

import com.resumeforge.backend.dto.request.ProjectRequest;
import com.resumeforge.backend.dto.response.ProjectResponse;
import com.resumeforge.backend.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
            Authentication authentication,
            @RequestBody ProjectRequest request) {
        Long userId = (Long) authentication.getCredentials();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectService.createProject(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getProjects(Authentication authentication) {
        Long userId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(projectService.getProjects(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProject(
            Authentication authentication,
            @PathVariable Long id) {
        Long userId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(projectService.getProject(userId, id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody ProjectRequest request) {
        Long userId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(projectService.updateProject(userId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            Authentication authentication,
            @PathVariable Long id) {
        Long userId = (Long) authentication.getCredentials();
        projectService.deleteProject(userId, id);
        return ResponseEntity.noContent().build();
    }
}