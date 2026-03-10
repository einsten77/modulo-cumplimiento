package com.siar.dossier.service;

import com.siar.dossier.model.DossierType;
import com.siar.dossier.repository.DossierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DossierNumberGenerator {

    private final DossierRepository dossierRepository;

    public String generate(DossierType dossierType) {
        String prefix = dossierType.getPrefix();
        int year = LocalDate.now().getYear();
        
        // Obtener el siguiente número secuencial para este tipo y año
        String pattern = String.format("%s-%d-%%", prefix, year);
        long count = dossierRepository.count() + 1; // Simplificado
        
        // Formato: CL-2024-00123
        return String.format("%s-%d-%05d", prefix, year, count);
    }
}
