package com.siar.risk.repository;

import com.siar.risk.model.RiskConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RiskConfigurationRepository extends JpaRepository<RiskConfiguration, String> {
    
    Optional<RiskConfiguration> findByIsActiveTrue();
    
    List<RiskConfiguration> findAllByOrderByVersionDesc();
}
