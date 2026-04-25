package com.resumeforge.backend.service;

import com.resumeforge.backend.dto.request.SkillRequest;
import com.resumeforge.backend.dto.response.SkillResponse;
import com.resumeforge.backend.entity.Skill;
import com.resumeforge.backend.entity.Skill.SkillCategory;
import com.resumeforge.backend.entity.User;
import com.resumeforge.backend.repository.SkillRepository;
import com.resumeforge.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SkillService {

    private final SkillRepository skillRepository;
    private final UserRepository userRepository;

    @Transactional
    public SkillResponse addSkill(Long userId, SkillRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ── Duplicate check ───────────────────────────────────────────────────
        // Normalize: trim + lowercase before comparing so "Java" and "java"
        // and "  Java  " are all treated as the same skill.
        String normalizedName = request.getName().trim().toLowerCase();

        boolean alreadyExists = skillRepository.findByUserId(userId)
                .stream()
                .anyMatch(s -> s.getName().trim().toLowerCase().equals(normalizedName));

        if (alreadyExists) {
            throw new RuntimeException(
                "Skill '" + request.getName().trim() + "' already exists in your profile.");
        }
        // ─────────────────────────────────────────────────────────────────────

        Skill skill = Skill.builder()
                .user(user)
                .name(request.getName().trim())   // always store trimmed
                .category(request.getCategory())
                .proficiency(request.getProficiency())
                .build();

        return mapToResponse(skillRepository.save(skill));
    }

    @Transactional
    public SkillResponse updateSkill(Long userId, Long skillId, SkillRequest request) {
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Skill not found"));

        if (!skill.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        // ── Duplicate check on update ─────────────────────────────────────────
        // Make sure the new name doesn't clash with another skill (excluding itself)
        String normalizedName = request.getName().trim().toLowerCase();

        boolean clashExists = skillRepository.findByUserId(userId)
                .stream()
                .filter(s -> !s.getId().equals(skillId))   // exclude current skill
                .anyMatch(s -> s.getName().trim().toLowerCase().equals(normalizedName));

        if (clashExists) {
            throw new RuntimeException(
                "Skill '" + request.getName().trim() + "' already exists in your profile.");
        }
        // ─────────────────────────────────────────────────────────────────────

        skill.setName(request.getName().trim());
        skill.setCategory(request.getCategory());
        skill.setProficiency(request.getProficiency());

        return mapToResponse(skillRepository.save(skill));
    }

    @Transactional
    public void deleteSkill(Long userId, Long skillId) {
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Skill not found"));

        if (!skill.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        skillRepository.delete(skill);
    }

    @Transactional(readOnly = true)
    public List<SkillResponse> getAllSkills(Long userId) {
        return skillRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SkillResponse> getSkillsByCategory(Long userId, SkillCategory category) {
        return skillRepository.findByUserIdAndCategory(userId, category)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private SkillResponse mapToResponse(Skill skill) {
        return SkillResponse.builder()
                .id(skill.getId())
                .name(skill.getName())
                .category(skill.getCategory())
                .proficiency(skill.getProficiency())
                .createdAt(skill.getCreatedAt())
                .build();
    }
}