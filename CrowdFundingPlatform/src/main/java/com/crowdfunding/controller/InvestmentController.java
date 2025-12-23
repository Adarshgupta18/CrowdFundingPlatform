package com.crowdfunding.controller;

import com.crowdfunding.dto.InvestmentDTO;
import com.crowdfunding.service.InvestmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/investments")
public class InvestmentController {

    @Autowired
    private InvestmentService investmentService;

    @PostMapping
    public ResponseEntity<InvestmentDTO> makeInvestment(@RequestBody @Valid InvestmentDTO investmentDTO) {
        InvestmentDTO createdInvestment = investmentService.makeInvestment(investmentDTO);
        return new ResponseEntity<>(createdInvestment, HttpStatus.CREATED);
    }

    @PutMapping("/{investmentId}")
    public ResponseEntity<InvestmentDTO> updateInvestment(@PathVariable Long investmentId,
            @RequestBody @Valid InvestmentDTO investmentDTO) {
        InvestmentDTO updatedInvestment = investmentService.updateInvestment(investmentId, investmentDTO);
        return ResponseEntity.ok(updatedInvestment);
    }

    @DeleteMapping("/{investmentId}")
    public ResponseEntity<Void> deleteInvestment(@PathVariable Long investmentId) {
        investmentService.deleteInvestment(investmentId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{investmentId}")
    public ResponseEntity<InvestmentDTO> getInvestmentById(@PathVariable Long investmentId) {
        InvestmentDTO investment = investmentService.getInvestmentById(investmentId);
        return ResponseEntity.ok(investment);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<InvestmentDTO>> getInvestmentsByProjectId(@PathVariable Long projectId) {
        List<InvestmentDTO> investments = investmentService.getInvestmentsByProjectId(projectId);
        return ResponseEntity.ok(investments);
    }

    @GetMapping("/investor/{investorName}")
    public ResponseEntity<List<InvestmentDTO>> getInvestmentsByInvestorName(@PathVariable String investorName) {
        List<InvestmentDTO> investments = investmentService.getInvestmentsByInvestorName(investorName);
        return ResponseEntity.ok(investments);
    }
}
