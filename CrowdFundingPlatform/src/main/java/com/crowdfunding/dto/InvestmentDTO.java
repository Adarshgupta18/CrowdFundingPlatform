package com.crowdfunding.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class InvestmentDTO {

    private Long id;

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotNull(message = "Investor name is required")
    private String investorName;

    @NotNull(message = "Investment amount is required")
    @Min(value = 1, message = "Investment amount must be at least 1")
    private Double amount;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getInvestorName() {
        return investorName;
    }

    public void setInvestorName(String investorName) {
        this.investorName = investorName;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }
}
