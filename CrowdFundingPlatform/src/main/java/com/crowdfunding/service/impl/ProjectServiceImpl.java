package com.crowdfunding.service.impl;

import com.crowdfunding.dto.ProjectDTO;
import com.crowdfunding.entity.Project;
import com.crowdfunding.exception.ResourceNotFoundException;
import com.crowdfunding.repo.ProjectRepository;
import com.crowdfunding.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectServiceImpl implements ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Override
    public ProjectDTO createProject(ProjectDTO projectDTO) {
        Project project = convertToEntity(projectDTO);
        Project savedProject = projectRepository.save(project);
        return convertToDto(savedProject);
    }

    @Override
    public ProjectDTO updateProject(Long projectId, ProjectDTO projectDTO) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        project.setName(projectDTO.getName());
        project.setDescription(projectDTO.getDescription());
        project.setTargetAmount(projectDTO.getTargetAmount());
        // raisedAmount usually updated by specific logic, but for simple update:
        if (projectDTO.getRaisedAmount() != null) {
            project.setRaisedAmount(projectDTO.getRaisedAmount());
        }

        Project updatedProject = projectRepository.save(project);
        return convertToDto(updatedProject);
    }

    @Override
    public void deleteProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
        projectRepository.delete(project);
    }

    @Override
    public ProjectDTO getProjectById(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
        return convertToDto(project);
    }

    @Override
    public List<ProjectDTO> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Helper methods
    private ProjectDTO convertToDto(Project project) {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setTargetAmount(project.getTargetAmount());
        dto.setRaisedAmount(project.getRaisedAmount());
        return dto;
    }

    private Project convertToEntity(ProjectDTO dto) {
        Project project = new Project();
        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        project.setTargetAmount(dto.getTargetAmount());
        project.setRaisedAmount(dto.getRaisedAmount() != null ? dto.getRaisedAmount() : 0.0);
        return project;
    }
}
