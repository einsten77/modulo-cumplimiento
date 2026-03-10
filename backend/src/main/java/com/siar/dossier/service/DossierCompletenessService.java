package com.siar.dossier.service;

import com.siar.dossier.model.Dossier;
import com.siar.dossier.model.DossierType;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DossierCompletenessService {

    private final ObjectMapper objectMapper;

    public double calculateCompleteness(Dossier dossier) {
        List<String> requiredFields = getRequiredFields(dossier.getDossierType());
        int totalRequired = requiredFields.size();
        int completed = 0;

        for (String fieldPath : requiredFields) {
            if (isFieldCompleted(dossier, fieldPath)) {
                completed++;
            }
        }

        return (double) completed / totalRequired * 100.0;
    }

    private List<String> getRequiredFields(DossierType dossierType) {
        switch (dossierType) {
            case CLIENT:
                return List.of(
                    "generalData.personType",
                    "generalData.firstName",
                    "generalData.lastName",
                    "identificationData.documentType",
                    "identificationData.documentNumber",
                    "contactData.email",
                    "contactData.phoneNumber",
                    "contactData.address.city",
                    "contactData.address.state",
                    "contactData.address.country"
                );
            case INTERMEDIARY:
                return List.of(
                    "generalData.personType",
                    "generalData.businessName",
                    "generalData.intermediaryType",
                    "generalData.licenseNumber",
                    "identificationData.documentType",
                    "identificationData.documentNumber",
                    "identificationData.taxId",
                    "contactData.email",
                    "contactData.phoneNumber"
                );
            case EMPLOYEE:
                return List.of(
                    "generalData.firstName",
                    "generalData.lastName",
                    "generalData.dateOfBirth",
                    "generalData.department",
                    "generalData.position",
                    "generalData.employeeId",
                    "generalData.hireDate",
                    "identificationData.documentType",
                    "identificationData.documentNumber",
                    "contactData.email",
                    "contactData.phoneNumber"
                );
            case SUPPLIER:
                return List.of(
                    "generalData.businessName",
                    "generalData.supplierType",
                    "identificationData.documentType",
                    "identificationData.documentNumber",
                    "identificationData.taxId",
                    "contactData.email",
                    "contactData.phoneNumber",
                    "contactData.address.city"
                );
            case REINSURER:
            case RETROCESSIONAIRE:
                return List.of(
                    "generalData.businessName",
                    "generalData.country",
                    "identificationData.documentType",
                    "identificationData.documentNumber",
                    "contactData.email",
                    "economicData.rating.agency",
                    "economicData.rating.rating"
                );
            default:
                return List.of();
        }
    }

    private boolean isFieldCompleted(Dossier dossier, String fieldPath) {
        // Navegar el path y verificar si el campo tiene valor
        // Ejemplo: "generalData.firstName" -> verificar que generalData.firstName != null
        
        String[] parts = fieldPath.split("\\.");
        Object current = null;

        if (parts[0].equals("generalData")) {
            current = dossier.getGeneralData();
        } else if (parts[0].equals("contactData")) {
            current = dossier.getContactData();
        } else if (parts[0].equals("identificationData")) {
            current = dossier.getIdentificationData();
        } else if (parts[0].equals("economicData")) {
            current = dossier.getEconomicData();
        } else if (parts[0].equals("documentsData")) {
            current = dossier.getDocumentsData();
        }

        if (current == null) {
            return false;
        }

        // Navegar el resto del path
        for (int i = 1; i < parts.length; i++) {
            if (current instanceof Map) {
                current = ((Map<?, ?>) current).get(parts[i]);
            } else {
                // Convertir a Map si es necesario
                Map<String, Object> map = objectMapper.convertValue(current, Map.class);
                current = map.get(parts[i]);
            }

            if (current == null) {
                return false;
            }
        }

        // Verificar que el valor no esté vacío
        if (current instanceof String) {
            return !((String) current).trim().isEmpty();
        }

        return true;
    }
}
