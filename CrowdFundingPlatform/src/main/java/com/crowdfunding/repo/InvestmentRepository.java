package com.crowdfunding.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import com.crowdfunding.entity.Investment;
import java.util.List;

public interface InvestmentRepository extends JpaRepository<Investment, Long> {
    List<Investment> findByProjectId(Long projectId);

    List<Investment> findByInvestorName(String investorName);
}
