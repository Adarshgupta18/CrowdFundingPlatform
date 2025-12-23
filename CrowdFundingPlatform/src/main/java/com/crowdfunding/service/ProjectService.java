package com.crowdfunding.service;

import com.crowdfunding.dto.ProjectDTO;
import java.util.List;

public interface ProjectService {
    ProjectDTO createProject(ProjectDTO projectDTO);

    ProjectDTO updateProject(Long projectId, ProjectDTO projectDTO);

    void deleteProject(Long projectId);

    ProjectDTO getProjectById(Long projectId);

    List<ProjectDTO> getAllProjects();
}
