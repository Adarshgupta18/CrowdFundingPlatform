package com.crowdfunding.service.impl;

import com.crowdfunding.dto.InvestmentDTO;
import com.crowdfunding.entity.Investment;
import com.crowdfunding.entity.Project;
import com.crowdfunding.exception.ResourceNotFoundException;
import com.crowdfunding.repo.InvestmentRepository;
import com.crowdfunding.repo.ProjectRepository;
import com.crowdfunding.service.InvestmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InvestmentServiceImpl implements InvestmentService {

    @Autowired
    private InvestmentRepository investmentRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Override
    public InvestmentDTO makeInvestment(InvestmentDTO investmentDTO) {
        Project project = projectRepository.findById(investmentDTO.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Project not found with id: " + investmentDTO.getProjectId()));

        Investment investment = convertToEntity(investmentDTO);
        investment.setProject(project);

        Investment savedInvestment = investmentRepository.save(investment);

        // Update project raised amount
        double newRaisedAmount = project.getRaisedAmount() + investment.getAmount();
        project.setRaisedAmount(newRaisedAmount);
        projectRepository.save(project);

        return convertToDto(savedInvestment);
    }

    @Override
    public InvestmentDTO updateInvestment(Long investmentId, InvestmentDTO investmentDTO) {
        Investment investment = investmentRepository.findById(investmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Investment not found"));

        Double oldAmount = investment.getAmount();
        Double newAmount = investmentDTO.getAmount();

        investment.setInvestorName(investmentDTO.getInvestorName());
        investment.setAmount(newAmount);

        Project project = investment.getProject();
        if (!oldAmount.equals(newAmount)) {
            double diff = newAmount - oldAmount;
            project.setRaisedAmount(project.getRaisedAmount() + diff);
            projectRepository.save(project);
        }

        Investment updated = investmentRepository.save(investment);
        return convertToDto(updated);
    }

    @Override
    public void deleteInvestment(Long investmentId) {
        Investment investment = investmentRepository.findById(investmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Investment not found"));

        Project project = investment.getProject();
        project.setRaisedAmount(project.getRaisedAmount() - investment.getAmount());
        projectRepository.save(project);

        investmentRepository.delete(investment);
    }

    @Override
    public InvestmentDTO getInvestmentById(Long investmentId) {
        Investment investment = investmentRepository.findById(investmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Investment not found"));
        return convertToDto(investment);
    }

    @Override
    public List<InvestmentDTO> getInvestmentsByProjectId(Long projectId) {
        return investmentRepository.findByProjectId(projectId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<InvestmentDTO> getInvestmentsByInvestorName(String investorName) {
        return investmentRepository.findByInvestorName(investorName).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private InvestmentDTO convertToDto(Investment investment) {
        InvestmentDTO dto = new InvestmentDTO();
        dto.setId(investment.getId());
        dto.setProjectId(investment.getProject().getId());
        dto.setInvestorName(investment.getInvestorName());
        dto.setAmount(investment.getAmount());
        return dto;
    }

    private Investment convertToEntity(InvestmentDTO dto) {
        Investment investment = new Investment();
        investment.setInvestorName(dto.getInvestorName());
        investment.setAmount(dto.getAmount());
        return investment;
    }
}
