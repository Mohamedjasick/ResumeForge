package com.resumeforge.backend.service;

import com.resumeforge.backend.dto.request.ProjectRequest;
import com.resumeforge.backend.dto.response.ProjectBulletResponse;
import com.resumeforge.backend.dto.response.ProjectResponse;
import com.resumeforge.backend.dto.response.SkillResponse;
import com.resumeforge.backend.entity.Project;
import com.resumeforge.backend.entity.ProjectBullet;
import com.resumeforge.backend.entity.Skill;
import com.resumeforge.backend.entity.User;
import com.resumeforge.backend.repository.ProjectBulletRepository;
import com.resumeforge.backend.repository.ProjectRepository;
import com.resumeforge.backend.repository.SkillRepository;
import com.resumeforge.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectBulletRepository projectBulletRepository;
    private final SkillRepository skillRepository;
    private final UserRepository userRepository;

    @Transactional
    public ProjectResponse createProject(Long userId, ProjectRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = new Project();
        project.setUser(user);
        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setDomainTag(request.getDomainTag());
        project.setCompletionDate(request.getCompletionDate());
        project.setGithubUrl(request.getGithubUrl());
        project.setLiveUrl(request.getLiveUrl());

        // Map skills
        if (request.getSkillIds() != null && !request.getSkillIds().isEmpty()) {
            List<Skill> skills = skillRepository.findAllById(request.getSkillIds());
            project.setSkills(skills);
        }

        Project saved = projectRepository.save(project);

        // Save bullets
        if (request.getBullets() != null) {
            request.getBullets().forEach(b -> {
                ProjectBullet bullet = new ProjectBullet();
                bullet.setProject(saved);
                bullet.setContent(b.getContent());
                bullet.setDisplayOrder(b.getDisplayOrder());
                projectBulletRepository.save(bullet);
            });
        }

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getProjects(Long userId) {
        return projectRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProject(Long userId, Long projectId) {
        Project project = projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        return mapToResponse(project);
    }

    @Transactional
    public ProjectResponse updateProject(Long userId, Long projectId, ProjectRequest request) {
        Project project = projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setDomainTag(request.getDomainTag());
        project.setCompletionDate(request.getCompletionDate());
        project.setGithubUrl(request.getGithubUrl());
        project.setLiveUrl(request.getLiveUrl());

        // Update skills
        if (request.getSkillIds() != null) {
            List<Skill> skills = skillRepository.findAllById(request.getSkillIds());
            project.setSkills(skills);
        }

        // Replace bullets
        projectBulletRepository.deleteByProjectId(project.getId());
        if (request.getBullets() != null) {
            request.getBullets().forEach(b -> {
                ProjectBullet bullet = new ProjectBullet();
                bullet.setProject(project);
                bullet.setContent(b.getContent());
                bullet.setDisplayOrder(b.getDisplayOrder());
                projectBulletRepository.save(bullet);
            });
        }

        return mapToResponse(projectRepository.save(project));
    }

    @Transactional
    public void deleteProject(Long userId, Long projectId) {
        Project project = projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        projectBulletRepository.deleteByProjectId(project.getId());
        projectRepository.delete(project);
    }

    private ProjectResponse mapToResponse(Project project) {
        ProjectResponse response = new ProjectResponse();
        response.setId(project.getId());
        response.setTitle(project.getTitle());
        response.setDescription(project.getDescription());
        response.setDomainTag(project.getDomainTag());
        response.setCompletionDate(project.getCompletionDate());
        response.setGithubUrl(project.getGithubUrl());
        response.setLiveUrl(project.getLiveUrl());
        response.setCreatedAt(project.getCreatedAt());

        // Map bullets
        List<ProjectBullet> bullets = projectBulletRepository
                .findByProjectIdOrderByDisplayOrder(project.getId());
        response.setBullets(bullets.stream().map(b -> {
            ProjectBulletResponse br = new ProjectBulletResponse();
            br.setId(b.getId());
            br.setContent(b.getContent());
            br.setDisplayOrder(b.getDisplayOrder());
            return br;
        }).collect(Collectors.toList()));

        // Map skills
        if (project.getSkills() != null) {
            response.setSkills(project.getSkills().stream().map(s ->
                SkillResponse.builder()
                    .id(s.getId())
                    .name(s.getName())
                    .category(s.getCategory())
                    .proficiency(s.getProficiency())
                    .createdAt(s.getCreatedAt())
                    .build()
            ).collect(Collectors.toList()));
        }

        return response;
    }
}