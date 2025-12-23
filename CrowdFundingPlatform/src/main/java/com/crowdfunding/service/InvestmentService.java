package com.crowdfunding.service;

import com.crowdfunding.dto.InvestmentDTO;
import java.util.List;

public interface InvestmentService {
    InvestmentDTO makeInvestment(InvestmentDTO investmentDTO);

    InvestmentDTO updateInvestment(Long investmentId, InvestmentDTO investmentDTO);

    void deleteInvestment(Long investmentId);

    InvestmentDTO getInvestmentById(Long investmentId);

    List<InvestmentDTO> getInvestmentsByProjectId(Long projectId);

    List<InvestmentDTO> getInvestmentsByInvestorName(String investorName);
}
