# SIAR - Módulo de Screening y Verificación contra Listas

## 1. Estructura Lógica del Módulo

### 1.1 Componentes Principales

```
┌─────────────────────────────────────────────────────────────┐
│                    SCREENING MODULE                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐        ┌──────────────────┐          │
│  │  List Manager    │───────▶│  List Repository │          │
│  │  - OFAC          │        │  - JSON Storage  │          │
│  │  - UN            │        │  - Versioning    │          │
│  │  - EU            │        │  - Updates       │          │
│  │  - UNIF          │        └──────────────────┘          │
│  │  - GAFI          │                                       │
│  └──────────────────┘                                       │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Screening Engine                            │  │
│  │  - Jaro-Winkler Algorithm                            │  │
│  │  - Name Normalization                                 │  │
│  │  - Match Scoring                                      │  │
│  │  - Threshold Configuration                            │  │
│  └──────────────────────────────────────────────────────┘  │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Results Processor                           │  │
│  │  - Match Classification                               │  │
│  │  - Alert Generation                                   │  │
│  │  - Impact on Risk Assessment                          │  │
│  └──────────────────────────────────────────────────────┘  │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Compliance Review Workflow                  │  │
│  │  - CO Review Required                                 │  │
│  │  - Documentation                                      │  │
│  │  - Final Decision                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Flujo de Screening

```
1. TRIGGER
   ├─ Creación de expediente (automático)
   ├─ Re-screening manual (bajo demanda)
   └─ Re-screening periódico (programado)

2. EJECUCIÓN
   ├─ Extracción de datos del sujeto
   ├─ Normalización de nombres
   ├─ Búsqueda en cada lista
   └─ Cálculo de similitud (Jaro-Winkler)

3. CLASIFICACIÓN
   ├─ Sin coincidencias (< umbral)
   ├─ Coincidencias bajas (umbral bajo)
   ├─ Coincidencias medias (umbral medio)
   └─ Coincidencias altas (umbral alto)

4. ALERTAMIENTO
   ├─ No alert (< 70%)
   ├─ Medium alert (70-84%)
   └─ High alert (85-100%)

5. REVISIÓN CO
   ├─ Evaluación de coincidencias
   ├─ Análisis de falsos positivos
   ├─ Documentación de decisión
   └─ Actualización de riesgo

6. TRAZABILIDAD
   ├─ Registro de ejecución
   ├─ Registro de resultados
   └─ Registro de decisión CO
```

---

## 2. Modelo de Datos JSON

### 2.1 Configuración de Listas

```json
{
  "listConfiguration": {
    "listId": "string (UUID)",
    "listCode": "string (OFAC, UN_CONSOLIDATED, EU_SANCTIONS, UNIF, GAFI)",
    "listName": "string",
    "listType": "string (SANCTIONS, PEP, TERRORISM, etc.)",
    "isActive": "boolean",
    "priority": "integer (1-5)",
    "updateFrequency": "string (DAILY, WEEKLY, MONTHLY)",
    "lastUpdate": "timestamp",
    "nextUpdate": "timestamp",
    "source": {
      "url": "string",
      "provider": "string",
      "format": "string (JSON, XML, CSV)"
    },
    "matchingThresholds": {
      "noMatch": 69,
      "lowMatch": 70,
      "mediumMatch": 85,
      "highMatch": 95
    },
    "createdAt": "timestamp",
    "createdBy": "string (userId)",
    "modifiedAt": "timestamp",
    "modifiedBy": "string (userId)"
  }
}
```

### 2.2 Entrada de Lista (List Entry)

```json
{
  "listEntry": {
    "entryId": "string (UUID)",
    "listId": "string (UUID, FK to listConfiguration)",
    "externalId": "string (ID from source)",
    "entityType": "string (INDIVIDUAL, ENTITY, VESSEL, AIRCRAFT)",
    "names": [
      {
        "fullName": "string",
        "firstName": "string",
        "middleName": "string",
        "lastName": "string",
        "nameType": "string (PRIMARY, ALIAS, KNOWN_AS, MAIDEN)",
        "language": "string (ES, EN, AR, etc.)"
      }
    ],
    "identifications": [
      {
        "idType": "string (PASSPORT, NATIONAL_ID, TAX_ID, etc.)",
        "idNumber": "string",
        "country": "string",
        "issueDate": "date",
        "expiryDate": "date"
      }
    ],
    "addresses": [
      {
        "fullAddress": "string",
        "city": "string",
        "country": "string",
        "postalCode": "string"
      }
    ],
    "dateOfBirth": "date",
    "placeOfBirth": "string",
    "nationality": ["string"],
    "sanctionInfo": {
      "program": "string",
      "reason": "string",
      "dateDesignated": "date",
      "remarks": "string"
    },
    "metadata": {
      "importedAt": "timestamp",
      "version": "integer",
      "isActive": "boolean"
    }
  }
}
```

### 2.3 Solicitud de Screening

```json
{
  "screeningRequest": {
    "requestId": "string (UUID)",
    "dossierId": "string (UUID)",
    "subjectType": "string (CLIENT, INTERMEDIARY, EMPLOYEE, PROVIDER, REINSURER, RETROCESSIONAIRE)",
    "subjectData": {
      "names": [
        {
          "fullName": "string",
          "firstName": "string",
          "middleName": "string",
          "lastName": "string",
          "nameType": "string"
        }
      ],
      "identifications": [
        {
          "idType": "string",
          "idNumber": "string",
          "country": "string"
        }
      ],
      "dateOfBirth": "date",
      "nationality": ["string"],
      "addresses": [
        {
          "country": "string",
          "city": "string"
        }
      ]
    },
    "screeningType": "string (AUTOMATIC, MANUAL, PERIODIC)",
    "listsToCheck": ["string (listIds)"],
    "requestedBy": "string (userId)",
    "requestedAt": "timestamp",
    "priority": "string (HIGH, NORMAL, LOW)"
  }
}
```

### 2.4 Resultado de Screening

```json
{
  "screeningResult": {
    "resultId": "string (UUID)",
    "requestId": "string (UUID, FK)",
    "dossierId": "string (UUID, FK)",
    "executionDate": "timestamp",
    "status": "string (COMPLETED, FAILED, IN_PROGRESS)",
    "totalListsChecked": "integer",
    "totalMatches": "integer",
    "highestMatchScore": "decimal (0-100)",
    "overallResult": "string (CLEAR, NEEDS_REVIEW, HIGH_RISK)",
    "listResults": [
      {
        "listId": "string (UUID)",
        "listCode": "string",
        "listName": "string",
        "checkedAt": "timestamp",
        "matches": [
          {
            "matchId": "string (UUID)",
            "entryId": "string (UUID, FK to listEntry)",
            "matchScore": "decimal (0-100)",
            "matchType": "string (NAME, IDENTIFICATION, DOB, ADDRESS)",
            "matchedFields": [
              {
                "fieldName": "string",
                "subjectValue": "string",
                "listValue": "string",
                "similarity": "decimal (0-100)"
              }
            ],
            "listEntityData": {
              "fullName": "string",
              "aliases": ["string"],
              "dateOfBirth": "date",
              "nationality": ["string"],
              "sanctionProgram": "string",
              "reason": "string"
            },
            "alertLevel": "string (NONE, LOW, MEDIUM, HIGH)",
            "requiresReview": "boolean"
          }
        ],
        "noMatchReason": "string (if applicable)"
      }
    ],
    "executionMetrics": {
      "durationMs": "integer",
      "comparisonsPerformed": "integer",
      "algorithmsUsed": ["JARO_WINKLER"]
    },
    "autoGeneratedAlerts": [
      {
        "alertId": "string (UUID)",
        "severity": "string (MEDIUM, HIGH)",
        "message": "string",
        "matchId": "string (UUID, FK)"
      }
    ]
  }
}
```

### 2.5 Evaluación del Oficial de Cumplimiento

```json
{
  "complianceEvaluation": {
    "evaluationId": "string (UUID)",
    "resultId": "string (UUID, FK)",
    "dossierId": "string (UUID, FK)",
    "evaluatedBy": "string (userId, CO only)",
    "evaluatedAt": "timestamp",
    "status": "string (PENDING, IN_REVIEW, COMPLETED)",
    "matchEvaluations": [
      {
        "matchId": "string (UUID, FK)",
        "evaluationType": "string (TRUE_POSITIVE, FALSE_POSITIVE, REQUIRES_INVESTIGATION)",
        "justification": "string (required)",
        "supportingDocuments": [
          {
            "documentId": "string (UUID)",
            "documentName": "string",
            "documentType": "string",
            "uploadedAt": "timestamp"
          }
        ],
        "actionTaken": "string (APPROVED, REJECTED, ESCALATED, ENHANCED_DD)",
        "notes": "string"
      }
    ],
    "finalDecision": {
      "decision": "string (CLEAR, CONDITIONAL_APPROVAL, REJECTION, ENHANCED_DUE_DILIGENCE)",
      "overallJustification": "string (required)",
      "impactOnRisk": "string (NO_IMPACT, INCREASE_RISK, TRIGGER_ENHANCED_DD)",
      "newRiskLevel": "string (if applicable: LOW, MEDIUM, HIGH)",
      "requiresEnhancedDD": "boolean",
      "requiresContinuousMonitoring": "boolean",
      "nextReviewDate": "date"
    },
    "approvalWorkflow": {
      "approvedBy": "string (userId, CO)",
      "approvedAt": "timestamp",
      "approvalNotes": "string"
    },
    "auditTrail": {
      "createdAt": "timestamp",
      "createdBy": "string",
      "modifiedAt": "timestamp",
      "modifiedBy": "string",
      "version": "integer"
    }
  }
}
```

### 2.6 Historial de Screening

```json
{
  "screeningHistory": {
    "dossierId": "string (UUID)",
    "subjectName": "string",
    "subjectType": "string",
    "totalScreenings": "integer",
    "firstScreening": "timestamp",
    "lastScreening": "timestamp",
    "screenings": [
      {
        "requestId": "string (UUID)",
        "resultId": "string (UUID)",
        "executionDate": "timestamp",
        "screeningType": "string",
        "totalMatches": "integer",
        "highestScore": "decimal",
        "overallResult": "string",
        "evaluationStatus": "string (PENDING, COMPLETED)",
        "coDecision": "string",
        "decisionDate": "timestamp"
      }
    ]
  }
}
```

---

## 3. Implementación del Algoritmo Jaro-Winkler

### 3.1 Clase Java para Jaro-Winkler

```java
package com.siar.screening.algorithm;

import org.springframework.stereotype.Component;
import java.text.Normalizer;

/**
 * Implementación del algoritmo Jaro-Winkler para comparación de cadenas
 * con enfoque en nombres de personas y entidades.
 * 
 * El algoritmo Jaro-Winkler es especialmente efectivo para:
 * - Detectar errores tipográficos
 * - Identificar variaciones ortográficas
 * - Reconocer prefijos comunes
 * - Comparar nombres con orden diferente
 */
@Component
public class JaroWinklerAlgorithm {

    private static final double JARO_WINKLER_PREFIX_SCALE = 0.1;
    private static final int JARO_WINKLER_PREFIX_LENGTH = 4;

    /**
     * Calcula la similitud entre dos cadenas usando Jaro-Winkler
     * 
     * @param s1 Primera cadena
     * @param s2 Segunda cadena
     * @return Similitud entre 0.0 y 1.0
     */
    public double similarity(String s1, String s2) {
        if (s1 == null || s2 == null) {
            return 0.0;
        }

        // Normalizar y limpiar las cadenas
        String str1 = normalize(s1);
        String str2 = normalize(s2);

        if (str1.isEmpty() || str2.isEmpty()) {
            return 0.0;
        }

        if (str1.equals(str2)) {
            return 1.0;
        }

        // Calcular distancia Jaro
        double jaroDistance = jaroDistance(str1, str2);

        // Calcular Jaro-Winkler con bonus por prefijo común
        int prefixLength = commonPrefixLength(str1, str2, JARO_WINKLER_PREFIX_LENGTH);
        
        return jaroDistance + (prefixLength * JARO_WINKLER_PREFIX_SCALE * (1.0 - jaroDistance));
    }

    /**
     * Retorna el porcentaje de similitud (0-100)
     */
    public double similarityPercentage(String s1, String s2) {
        return similarity(s1, s2) * 100.0;
    }

    /**
     * Calcula la distancia Jaro entre dos cadenas
     */
    private double jaroDistance(String s1, String s2) {
        int len1 = s1.length();
        int len2 = s2.length();

        // Ventana de búsqueda
        int matchWindow = Math.max(len1, len2) / 2 - 1;
        if (matchWindow < 1) {
            matchWindow = 1;
        }

        boolean[] s1Matches = new boolean[len1];
        boolean[] s2Matches = new boolean[len2];

        int matches = 0;
        int transpositions = 0;

        // Identificar coincidencias
        for (int i = 0; i < len1; i++) {
            int start = Math.max(0, i - matchWindow);
            int end = Math.min(i + matchWindow + 1, len2);

            for (int j = start; j < end; j++) {
                if (s2Matches[j] || s1.charAt(i) != s2.charAt(j)) {
                    continue;
                }
                s1Matches[i] = true;
                s2Matches[j] = true;
                matches++;
                break;
            }
        }

        if (matches == 0) {
            return 0.0;
        }

        // Contar transposiciones
        int k = 0;
        for (int i = 0; i < len1; i++) {
            if (!s1Matches[i]) {
                continue;
            }
            while (!s2Matches[k]) {
                k++;
            }
            if (s1.charAt(i) != s2.charAt(k)) {
                transpositions++;
            }
            k++;
        }

        // Calcular distancia Jaro
        return ((double) matches / len1 +
                (double) matches / len2 +
                (double) (matches - transpositions / 2.0) / matches) / 3.0;
    }

    /**
     * Encuentra la longitud del prefijo común entre dos cadenas
     */
    private int commonPrefixLength(String s1, String s2, int maxLength) {
        int n = Math.min(Math.min(s1.length(), s2.length()), maxLength);
        for (int i = 0; i < n; i++) {
            if (s1.charAt(i) != s2.charAt(i)) {
                return i;
            }
        }
        return n;
    }

    /**
     * Normaliza una cadena para comparación
     * - Convierte a minúsculas
     * - Elimina acentos
     * - Elimina caracteres especiales
     * - Elimina espacios múltiples
     */
    private String normalize(String str) {
        if (str == null) {
            return "";
        }

        // Convertir a minúsculas
        String normalized = str.toLowerCase();

        // Eliminar acentos
        normalized = Normalizer.normalize(normalized, Normalizer.Form.NFD);
        normalized = normalized.replaceAll("\\p{M}", "");

        // Eliminar caracteres especiales, mantener solo letras y espacios
        normalized = normalized.replaceAll("[^a-z0-9\\s]", " ");

        // Normalizar espacios múltiples
        normalized = normalized.replaceAll("\\s+", " ").trim();

        return normalized;
    }

    /**
     * Compara múltiples variantes de nombres
     * Útil cuando se tienen diferentes ordenamientos de nombre
     */
    public double bestMatchScore(String[] variants1, String[] variants2) {
        double maxScore = 0.0;
        
        for (String v1 : variants1) {
            for (String v2 : variants2) {
                double score = similarity(v1, v2);
                if (score > maxScore) {
                    maxScore = score;
                }
            }
        }
        
        return maxScore;
    }
}
```

### 3.2 Servicio de Screening

```java
package com.siar.screening.service;

import com.siar.screening.algorithm.JaroWinklerAlgorithm;
import com.siar.screening.model.*;
import com.siar.screening.repository.*;
import com.siar.dossier.model.Dossier;
import com.siar.alert.service.AlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ScreeningService {

    @Autowired
    private JaroWinklerAlgorithm jaroWinkler;

    @Autowired
    private ScreeningResultRepository screeningResultRepository;

    @Autowired
    private ListConfigurationRepository listConfigurationRepository;

    @Autowired
    private ListEntryRepository listEntryRepository;

    @Autowired
    private AlertService alertService;

    /**
     * Ejecuta screening automático al crear expediente
     */
    @Transactional
    public ScreeningResult executeAutoScreening(Dossier dossier, String userId) {
        ScreeningRequest request = buildScreeningRequest(dossier, "AUTOMATIC", userId);
        return executeScreening(request);
    }

    /**
     * Ejecuta screening manual bajo demanda
     */
    @Transactional
    public ScreeningResult executeManualScreening(String dossierId, String userId) {
        ScreeningRequest request = buildManualScreeningRequest(dossierId, userId);
        return executeScreening(request);
    }

    /**
     * Motor principal de screening
     */
    @Transactional
    public ScreeningResult executeScreening(ScreeningRequest request) {
        long startTime = System.currentTimeMillis();
        
        ScreeningResult result = new ScreeningResult();
        result.setResultId(UUID.randomUUID().toString());
        result.setRequestId(request.getRequestId());
        result.setDossierId(request.getDossierId());
        result.setExecutionDate(LocalDateTime.now());
        result.setStatus("IN_PROGRESS");

        List<ListResult> listResults = new ArrayList<>();
        int totalComparisons = 0;
        int totalMatches = 0;
        double highestScore = 0.0;

        // Obtener listas activas
        List<ListConfiguration> activeLists = listConfigurationRepository.findByIsActiveTrue();

        for (ListConfiguration list : activeLists) {
            ListResult listResult = screenAgainstList(
                request.getSubjectData(), 
                list
            );
            
            listResults.add(listResult);
            totalComparisons += listResult.getComparisonsPerformed();
            totalMatches += listResult.getMatches().size();

            // Encontrar el score más alto
            for (Match match : listResult.getMatches()) {
                if (match.getMatchScore() > highestScore) {
                    highestScore = match.getMatchScore();
                }
            }
        }

        result.setListResults(listResults);
        result.setTotalListsChecked(activeLists.size());
        result.setTotalMatches(totalMatches);
        result.setHighestMatchScore(highestScore);

        // Determinar resultado general
        result.setOverallResult(determineOverallResult(highestScore, totalMatches));

        // Generar alertas automáticas
        List<Alert> alerts = generateAlerts(result, listResults);
        result.setAutoGeneratedAlerts(alerts);

        // Métricas de ejecución
        ExecutionMetrics metrics = new ExecutionMetrics();
        metrics.setDurationMs(System.currentTimeMillis() - startTime);
        metrics.setComparisonsPerformed(totalComparisons);
        metrics.setAlgorithmsUsed(Arrays.asList("JARO_WINKLER"));
        result.setExecutionMetrics(metrics);

        result.setStatus("COMPLETED");

        // Guardar resultado
        screeningResultRepository.save(result);

        // Enviar alertas si es necesario
        if (!alerts.isEmpty()) {
            alertService.sendScreeningAlerts(alerts, result.getDossierId());
        }

        return result;
    }

    /**
     * Screening contra una lista específica
     */
    private ListResult screenAgainstList(SubjectData subject, ListConfiguration list) {
        ListResult listResult = new ListResult();
        listResult.setListId(list.getListId());
        listResult.setListCode(list.getListCode());
        listResult.setListName(list.getListName());
        listResult.setCheckedAt(LocalDateTime.now());

        List<Match> matches = new ArrayList<>();
        int comparisons = 0;

        // Obtener todas las entradas de la lista
        List<ListEntry> entries = listEntryRepository.findByListIdAndIsActive(
            list.getListId(), 
            true
        );

        for (ListEntry entry : entries) {
            Match match = compareSubjectWithEntry(subject, entry, list);
            comparisons++;

            if (match != null && match.getMatchScore() >= list.getMatchingThresholds().getNoMatch()) {
                matches.add(match);
            }
        }

        listResult.setMatches(matches);
        listResult.setComparisonsPerformed(comparisons);

        if (matches.isEmpty()) {
            listResult.setNoMatchReason("No se encontraron coincidencias por encima del umbral");
        }

        return listResult;
    }

    /**
     * Compara un sujeto con una entrada de lista
     */
    private Match compareSubjectWithEntry(SubjectData subject, ListEntry entry, ListConfiguration config) {
        Match match = new Match();
        match.setMatchId(UUID.randomUUID().toString());
        match.setEntryId(entry.getEntryId());

        List<MatchedField> matchedFields = new ArrayList<>();
        double maxScore = 0.0;

        // Comparar nombres
        for (Name subjectName : subject.getNames()) {
            for (Name entryName : entry.getNames()) {
                // Comparar nombre completo
                double fullNameScore = jaroWinkler.similarityPercentage(
                    subjectName.getFullName(),
                    entryName.getFullName()
                );

                if (fullNameScore > maxScore) {
                    maxScore = fullNameScore;
                }

                if (fullNameScore >= config.getMatchingThresholds().getNoMatch()) {
                    MatchedField field = new MatchedField();
                    field.setFieldName("fullName");
                    field.setSubjectValue(subjectName.getFullName());
                    field.setListValue(entryName.getFullName());
                    field.setSimilarity(fullNameScore);
                    matchedFields.add(field);
                }

                // Comparar partes del nombre
                if (subjectName.getFirstName() != null && entryName.getFirstName() != null) {
                    double firstNameScore = jaroWinkler.similarityPercentage(
                        subjectName.getFirstName(),
                        entryName.getFirstName()
                    );

                    if (firstNameScore >= config.getMatchingThresholds().getNoMatch()) {
                        MatchedField field = new MatchedField();
                        field.setFieldName("firstName");
                        field.setSubjectValue(subjectName.getFirstName());
                        field.setListValue(entryName.getFirstName());
                        field.setSimilarity(firstNameScore);
                        matchedFields.add(field);
                    }
                }

                if (subjectName.getLastName() != null && entryName.getLastName() != null) {
                    double lastNameScore = jaroWinkler.similarityPercentage(
                        subjectName.getLastName(),
                        entryName.getLastName()
                    );

                    if (lastNameScore >= config.getMatchingThresholds().getNoMatch()) {
                        MatchedField field = new MatchedField();
                        field.setFieldName("lastName");
                        field.setSubjectValue(subjectName.getLastName());
                        field.setListValue(entryName.getLastName());
                        field.setSimilarity(lastNameScore);
                        matchedFields.add(field);
                    }
                }
            }
        }

        // Comparar identificaciones
        if (subject.getIdentifications() != null && entry.getIdentifications() != null) {
            for (Identification subjectId : subject.getIdentifications()) {
                for (Identification entryId : entry.getIdentifications()) {
                    if (subjectId.getIdType().equals(entryId.getIdType())) {
                        double idScore = jaroWinkler.similarityPercentage(
                            subjectId.getIdNumber(),
                            entryId.getIdNumber()
                        );

                        if (idScore >= 95.0) { // Umbral alto para IDs
                            maxScore = Math.max(maxScore, idScore);
                            MatchedField field = new MatchedField();
                            field.setFieldName("identification");
                            field.setSubjectValue(subjectId.getIdNumber());
                            field.setListValue(entryId.getIdNumber());
                            field.setSimilarity(idScore);
                            matchedFields.add(field);
                        }
                    }
                }
            }
        }

        // Si no hay coincidencias significativas, retornar null
        if (matchedFields.isEmpty() || maxScore < config.getMatchingThresholds().getNoMatch()) {
            return null;
        }

        match.setMatchScore(maxScore);
        match.setMatchedFields(matchedFields);
        match.setMatchType(determineMatchType(matchedFields));

        // Copiar datos de la entrada de la lista
        match.setListEntityData(extractListEntityData(entry));

        // Determinar nivel de alerta
        match.setAlertLevel(determineAlertLevel(maxScore, config));
        match.setRequiresReview(maxScore >= config.getMatchingThresholds().getLowMatch());

        return match;
    }

    /**
     * Determina el resultado general del screening
     */
    private String determineOverallResult(double highestScore, int totalMatches) {
        if (totalMatches == 0) {
            return "CLEAR";
        }
        
        if (highestScore >= 85.0) {
            return "HIGH_RISK";
        }
        
        return "NEEDS_REVIEW";
    }

    /**
     * Determina el nivel de alerta basado en el score
     */
    private String determineAlertLevel(double score, ListConfiguration config) {
        if (score >= config.getMatchingThresholds().getHighMatch()) {
            return "HIGH";
        } else if (score >= config.getMatchingThresholds().getMediumMatch()) {
            return "MEDIUM";
        } else if (score >= config.getMatchingThresholds().getLowMatch()) {
            return "LOW";
        }
        return "NONE";
    }

    /**
     * Determina el tipo de coincidencia
     */
    private String determineMatchType(List<MatchedField> fields) {
        boolean hasName = fields.stream().anyMatch(f -> 
            f.getFieldName().contains("Name"));
        boolean hasId = fields.stream().anyMatch(f -> 
            f.getFieldName().equals("identification"));
        boolean hasDOB = fields.stream().anyMatch(f -> 
            f.getFieldName().equals("dateOfBirth"));

        if (hasId) return "IDENTIFICATION";
        if (hasName && hasDOB) return "NAME_DOB";
        if (hasName) return "NAME";
        return "OTHER";
    }

    /**
     * Genera alertas automáticas basadas en los resultados
     */
    private List<Alert> generateAlerts(ScreeningResult result, List<ListResult> listResults) {
        List<Alert> alerts = new ArrayList<>();

        for (ListResult listResult : listResults) {
            for (Match match : listResult.getMatches()) {
                if ("MEDIUM".equals(match.getAlertLevel()) || "HIGH".equals(match.getAlertLevel())) {
                    Alert alert = new Alert();
                    alert.setAlertId(UUID.randomUUID().toString());
                    alert.setSeverity(match.getAlertLevel());
                    alert.setMatchId(match.getMatchId());
                    alert.setMessage(String.format(
                        "Coincidencia %s detectada en %s: %.2f%% de similitud con %s",
                        match.getAlertLevel(),
                        listResult.getListName(),
                        match.getMatchScore(),
                        match.getListEntityData().getFullName()
                    ));
                    alerts.add(alert);
                }
            }
        }

        return alerts;
    }

    /**
     * Extrae datos de la entidad de la lista para mostrar
     */
    private ListEntityData extractListEntityData(ListEntry entry) {
        ListEntityData data = new ListEntityData();
        
        if (!entry.getNames().isEmpty()) {
            data.setFullName(entry.getNames().get(0).getFullName());
            data.setAliases(entry.getNames().stream()
                .skip(1)
                .map(Name::getFullName)
                .collect(Collectors.toList()));
        }
        
        data.setDateOfBirth(entry.getDateOfBirth());
        data.setNationality(entry.getNationality());
        
        if (entry.getSanctionInfo() != null) {
            data.setSanctionProgram(entry.getSanctionInfo().getProgram());
            data.setReason(entry.getSanctionInfo().getReason());
        }
        
        return data;
    }

    /**
     * Construye una solicitud de screening desde un expediente
     */
    private ScreeningRequest buildScreeningRequest(Dossier dossier, String type, String userId) {
        ScreeningRequest request = new ScreeningRequest();
        request.setRequestId(UUID.randomUUID().toString());
        request.setDossierId(dossier.getDossierId());
        request.setSubjectType(dossier.getSubjectType());
        request.setScreeningType(type);
        request.setRequestedBy(userId);
        request.setRequestedAt(LocalDateTime.now());
        request.setPriority("NORMAL");
        
        // Extraer datos del sujeto desde el expediente
        SubjectData subjectData = extractSubjectDataFromDossier(dossier);
        request.setSubjectData(subjectData);
        
        // Todas las listas activas por defecto
        List<String> listIds = listConfigurationRepository.findByIsActiveTrue()
            .stream()
            .map(ListConfiguration::getListId)
            .collect(Collectors.toList());
        request.setListsToCheck(listIds);
        
        return request;
    }

    private ScreeningRequest buildManualScreeningRequest(String dossierId, String userId) {
        // Similar implementation
        return new ScreeningRequest();
    }

    private SubjectData extractSubjectDataFromDossier(Dossier dossier) {
        // Extract subject data from dossier JSON
        return new SubjectData();
    }
}
```

---

## 4. Integración con Módulos Existentes

### 4.1 Integración con Expediente Único

```java
@Service
public class DossierService {
    
    @Autowired
    private ScreeningService screeningService;
    
    @Transactional
    public Dossier createDossier(DossierRequest request, String userId) {
        // Crear expediente
        Dossier dossier = new Dossier();
        // ... configurar expediente
        
        dossierRepository.save(dossier);
        
        // TRIGGER AUTOMÁTICO: Ejecutar screening
        ScreeningResult screeningResult = screeningService.executeAutoScreening(dossier, userId);
        
        // Registrar en el expediente
        dossier.getScreeningHistory().add(screeningResult.getResultId());
        dossierRepository.save(dossier);
        
        return dossier;
    }
}
```

### 4.2 Integración con Evaluación de Riesgo

```java
@Service
public class RiskAssessmentService {
    
    /**
     * El resultado del screening puede modificar la evaluación de riesgo
     */
    public void updateRiskFromScreening(String dossierId, ComplianceEvaluation evaluation) {
        if ("INCREASE_RISK".equals(evaluation.getFinalDecision().getImpactOnRisk())) {
            RiskEvaluation currentRisk = getCurrentRiskEvaluation(dossierId);
            
            // Crear nueva evaluación de riesgo con incremento
            RiskEvaluation newRisk = new RiskEvaluation();
            newRisk.setReason("Screening positivo: " + evaluation.getFinalDecision().getOverallJustification());
            newRisk.setRiskLevel(evaluation.getFinalDecision().getNewRiskLevel());
            
            // Trigger enhanced due diligence si es necesario
            if (evaluation.getFinalDecision().isRequiresEnhancedDD()) {
                triggerEnhancedDueDiligence(dossierId);
            }
            
            riskEvaluationRepository.save(newRisk);
        }
    }
}
```

### 4.3 Integración con Debida Diligencia

```java
@Service
public class DueDiligenceService {
    
    /**
     * Screening positivo puede requerir DD reforzada
     */
    public void triggerEnhancedDueDiligence(String dossierId, ScreeningResult screeningResult) {
        if ("HIGH_RISK".equals(screeningResult.getOverallResult())) {
            // Crear checklist de DD reforzada
            DueDiligenceChecklist enhancedChecklist = createEnhancedChecklist(dossierId);
            
            // Añadir documentos adicionales requeridos
            addEnhancedDocumentRequirements(enhancedChecklist, screeningResult);
            
            dueDiligenceRepository.save(enhancedChecklist);
        }
    }
}
```

---

## 5. API REST Endpoints

### 5.1 Ejecución de Screening

```http
POST /api/screening/execute
Authorization: Bearer {token}
Content-Type: application/json

{
  "dossierId": "uuid",
  "screeningType": "MANUAL",
  "listsToCheck": ["uuid1", "uuid2"]
}

Response 200:
{
  "resultId": "uuid",
  "status": "COMPLETED",
  "totalMatches": 2,
  "overallResult": "NEEDS_REVIEW",
  "executionDate": "2024-01-15T10:30:00Z"
}
```

### 5.2 Consultar Resultado

```http
GET /api/screening/results/{resultId}
Authorization: Bearer {token}

Response 200:
{
  "screeningResult": { ... }
}
```

### 5.3 Historial de Screening

```http
GET /api/screening/history/{dossierId}
Authorization: Bearer {token}

Response 200:
{
  "screeningHistory": {
    "totalScreenings": 5,
    "screenings": [ ... ]
  }
}
```

### 5.4 Evaluar Screening (CO Only)

```http
POST /api/screening/evaluate
Authorization: Bearer {token}
X-Role: COMPLIANCE_OFFICER
Content-Type: application/json

{
  "resultId": "uuid",
  "dossierId": "uuid",
  "matchEvaluations": [
    {
      "matchId": "uuid",
      "evaluationType": "FALSE_POSITIVE",
      "justification": "Persona homónima, diferente fecha de nacimiento",
      "actionTaken": "APPROVED"
    }
  ],
  "finalDecision": {
    "decision": "CLEAR",
    "overallJustification": "Las coincidencias son falsos positivos",
    "impactOnRisk": "NO_IMPACT"
  }
}

Response 200:
{
  "evaluationId": "uuid",
  "status": "COMPLETED",
  "approvedBy": "userId",
  "approvedAt": "2024-01-15T11:00:00Z"
}
```

### 5.5 Configuración de Listas

```http
GET /api/screening/lists
Authorization: Bearer {token}

Response 200:
{
  "lists": [
    {
      "listId": "uuid",
      "listCode": "OFAC",
      "listName": "OFAC SDN List",
      "isActive": true,
      "lastUpdate": "2024-01-10T00:00:00Z"
    }
  ]
}
```

```http
PUT /api/screening/lists/{listId}/thresholds
Authorization: Bearer {token}
X-Role: COMPLIANCE_OFFICER
Content-Type: application/json

{
  "noMatch": 69,
  "lowMatch": 70,
  "mediumMatch": 85,
  "highMatch": 95
}

Response 200:
{
  "message": "Umbrales actualizados exitosamente"
}
```

---

## 6. Base de Datos

### 6.1 Tabla: screening_list_configuration

```sql
CREATE TABLE screening_list_configuration (
    list_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_code VARCHAR(50) NOT NULL UNIQUE,
    list_name VARCHAR(200) NOT NULL,
    list_type VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 3,
    update_frequency VARCHAR(20) DEFAULT 'MONTHLY',
    last_update TIMESTAMP,
    next_update TIMESTAMP,
    source_url TEXT,
    source_provider VARCHAR(200),
    source_format VARCHAR(20),
    threshold_no_match DECIMAL(5,2) DEFAULT 69.00,
    threshold_low_match DECIMAL(5,2) DEFAULT 70.00,
    threshold_medium_match DECIMAL(5,2) DEFAULT 85.00,
    threshold_high_match DECIMAL(5,2) DEFAULT 95.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL,
    modified_at TIMESTAMP,
    modified_by UUID,
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    FOREIGN KEY (modified_by) REFERENCES users(user_id)
);

CREATE INDEX idx_list_config_active ON screening_list_configuration(is_active);
CREATE INDEX idx_list_config_code ON screening_list_configuration(list_code);
```

### 6.2 Tabla: screening_list_entries

```sql
CREATE TABLE screening_list_entries (
    entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID NOT NULL,
    external_id VARCHAR(200),
    entity_type VARCHAR(50) NOT NULL,
    entry_data JSONB NOT NULL, -- Almacena todo el JSON de la entrada
    search_vector TSVECTOR, -- Para búsqueda rápida
    date_of_birth DATE,
    is_active BOOLEAN DEFAULT true,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 1,
    FOREIGN KEY (list_id) REFERENCES screening_list_configuration(list_id) ON DELETE CASCADE
);

CREATE INDEX idx_list_entries_list ON screening_list_entries(list_id);
CREATE INDEX idx_list_entries_active ON screening_list_entries(is_active);
CREATE INDEX idx_list_entries_search ON screening_list_entries USING GIN(search_vector);
CREATE INDEX idx_list_entries_data ON screening_list_entries USING GIN(entry_data);
```

### 6.3 Tabla: screening_results

```sql
CREATE TABLE screening_results (
    result_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL,
    dossier_id UUID NOT NULL,
    execution_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL,
    total_lists_checked INTEGER,
    total_matches INTEGER,
    highest_match_score DECIMAL(5,2),
    overall_result VARCHAR(50),
    result_data JSONB NOT NULL, -- Almacena todo el JSON del resultado
    execution_duration_ms INTEGER,
    comparisons_performed INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dossier_id) REFERENCES dossiers(dossier_id)
);

CREATE INDEX idx_screening_results_dossier ON screening_results(dossier_id);
CREATE INDEX idx_screening_results_date ON screening_results(execution_date DESC);
CREATE INDEX idx_screening_results_status ON screening_results(status);
```

### 6.4 Tabla: compliance_evaluations

```sql
CREATE TABLE compliance_evaluations (
    evaluation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    result_id UUID NOT NULL,
    dossier_id UUID NOT NULL,
    evaluated_by UUID NOT NULL,
    evaluated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    evaluation_data JSONB NOT NULL, -- Almacena todo el JSON de la evaluación
    final_decision VARCHAR(50),
    impact_on_risk VARCHAR(50),
    new_risk_level VARCHAR(20),
    requires_enhanced_dd BOOLEAN DEFAULT false,
    approved_by UUID,
    approved_at TIMESTAMP,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP,
    FOREIGN KEY (result_id) REFERENCES screening_results(result_id),
    FOREIGN KEY (dossier_id) REFERENCES dossiers(dossier_id),
    FOREIGN KEY (evaluated_by) REFERENCES users(user_id),
    FOREIGN KEY (approved_by) REFERENCES users(user_id)
);

CREATE INDEX idx_compliance_eval_result ON compliance_evaluations(result_id);
CREATE INDEX idx_compliance_eval_dossier ON compliance_evaluations(dossier_id);
CREATE INDEX idx_compliance_eval_status ON compliance_evaluations(status);
```

### 6.5 Tabla: screening_audit_log

```sql
CREATE TABLE screening_audit_log (
    audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    result_id UUID,
    evaluation_id UUID,
    dossier_id UUID NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- SCREENING_EXECUTED, EVALUATION_CREATED, etc.
    action_description TEXT,
    performed_by UUID NOT NULL,
    performed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    before_data JSONB,
    after_data JSONB,
    FOREIGN KEY (result_id) REFERENCES screening_results(result_id),
    FOREIGN KEY (evaluation_id) REFERENCES compliance_evaluations(evaluation_id),
    FOREIGN KEY (dossier_id) REFERENCES dossiers(dossier_id),
    FOREIGN KEY (performed_by) REFERENCES users(user_id)
);

CREATE INDEX idx_screening_audit_dossier ON screening_audit_log(dossier_id);
CREATE INDEX idx_screening_audit_date ON screening_audit_log(performed_at DESC);
CREATE INDEX idx_screening_audit_user ON screening_audit_log(performed_by);
```

### 6.6 Triggers de Auditoría

```sql
-- Trigger para auditar ejecuciones de screening
CREATE OR REPLACE FUNCTION audit_screening_execution()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO screening_audit_log (
        result_id, dossier_id, action_type, action_description,
        performed_by, after_data
    ) VALUES (
        NEW.result_id,
        NEW.dossier_id,
        'SCREENING_EXECUTED',
        format('Screening ejecutado: %s coincidencias encontradas', NEW.total_matches),
        COALESCE(current_setting('app.current_user_id', true)::UUID, '00000000-0000-0000-0000-000000000000'),
        to_jsonb(NEW)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_screening_execution
AFTER INSERT ON screening_results
FOR EACH ROW
EXECUTE FUNCTION audit_screening_execution();

-- Trigger para auditar evaluaciones de CO
CREATE OR REPLACE FUNCTION audit_compliance_evaluation()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO screening_audit_log (
            evaluation_id, result_id, dossier_id,
            action_type, action_description,
            performed_by, after_data
        ) VALUES (
            NEW.evaluation_id,
            NEW.result_id,
            NEW.dossier_id,
            'EVALUATION_CREATED',
            format('Evaluación creada por CO: %s', NEW.final_decision),
            NEW.evaluated_by,
            to_jsonb(NEW)
        );
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO screening_audit_log (
            evaluation_id, result_id, dossier_id,
            action_type, action_description,
            performed_by, before_data, after_data
        ) VALUES (
            NEW.evaluation_id,
            NEW.result_id,
            NEW.dossier_id,
            'EVALUATION_UPDATED',
            'Evaluación modificada por CO',
            NEW.evaluated_by,
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_compliance_evaluation
AFTER INSERT OR UPDATE ON compliance_evaluations
FOR EACH ROW
EXECUTE FUNCTION audit_compliance_evaluation();
```

---

## 7. Consideraciones de Cumplimiento Regulatorio

### 7.1 Evidencia para el Regulador

El sistema mantiene evidencia completa de:

1. **Ejecución de Screening**:
   - Fecha y hora exacta
   - Listas consultadas
   - Versión de las listas
   - Algoritmo utilizado
   - Parámetros de comparación

2. **Resultados Obtenidos**:
   - Todas las coincidencias detectadas
   - Porcentajes de similitud
   - Datos comparados
   - Clasificación de alertas

3. **Evaluación del CO**:
   - Análisis de cada coincidencia
   - Justificación de decisiones
   - Documentos de soporte
   - Impacto en evaluación de riesgo

4. **Trazabilidad Completa**:
   - Registro inmutable de todas las acciones
   - Identificación de usuarios
   - Timestamps precisos
   - Cadena de custodia de decisiones

### 7.2 Segregación de Funciones

- **Ejecución**: Sistema automático o cualquier usuario autorizado
- **Evaluación**: Solo Oficial de Cumplimiento
- **Aprobación**: Solo Oficial de Cumplimiento
- **Consulta**: Roles con permisos de visualización

### 7.3 Periodicidad del Screening

```java
@Service
public class PeriodicScreeningService {
    
    /**
     * Ejecuta re-screening periódico según nivel de riesgo
     */
    @Scheduled(cron = "0 0 2 * * ?") // 2 AM diario
    public void executePeriodicScreening() {
        // Alto riesgo: cada 30 días
        List<Dossier> highRiskDossiers = dossierRepository
            .findByRiskLevelAndLastScreeningBefore("HIGH", LocalDate.now().minusDays(30));
        
        // Medio riesgo: cada 90 días
        List<Dossier> mediumRiskDossiers = dossierRepository
            .findByRiskLevelAndLastScreeningBefore("MEDIUM", LocalDate.now().minusDays(90));
        
        // Bajo riesgo: cada 180 días
        List<Dossier> lowRiskDossiers = dossierRepository
            .findByRiskLevelAndLastScreeningBefore("LOW", LocalDate.now().minusDays(180));
        
        // Ejecutar screening para cada grupo
        executeScreeningBatch(highRiskDossiers, "PERIODIC_HIGH_RISK");
        executeScreeningBatch(mediumRiskDossiers, "PERIODIC_MEDIUM_RISK");
        executeScreeningBatch(lowRiskDossiers, "PERIODIC_LOW_RISK");
    }
}
```

### 7.4 Actualización de Listas

```java
@Service
public class ListUpdateService {
    
    /**
     * Actualiza listas desde fuentes oficiales
     */
    @Scheduled(cron = "0 0 1 * * ?") // 1 AM diario
    public void updateSanctionsLists() {
        List<ListConfiguration> listsToUpdate = listConfigurationRepository
            .findByNextUpdateBefore(LocalDateTime.now());
        
        for (ListConfiguration list : listsToUpdate) {
            try {
                updateList(list);
                auditListUpdate(list, "SUCCESS");
            } catch (Exception e) {
                auditListUpdate(list, "FAILED: " + e.getMessage());
                alertService.sendListUpdateFailureAlert(list);
            }
        }
    }
}
```

---

## 8. Reportes para el Regulador

### 8.1 Reporte de Screenings Ejecutados

```sql
-- Screening por período
SELECT 
    DATE_TRUNC('month', execution_date) as mes,
    COUNT(*) as total_screenings,
    SUM(CASE WHEN total_matches > 0 THEN 1 ELSE 0 END) as con_coincidencias,
    AVG(total_matches) as promedio_coincidencias,
    MAX(highest_match_score) as score_mas_alto
FROM screening_results
WHERE execution_date BETWEEN :fecha_inicio AND :fecha_fin
GROUP BY DATE_TRUNC('month', execution_date)
ORDER BY mes;
```

### 8.2 Reporte de Coincidencias Altas

```sql
-- Coincidencias que requieren atención
SELECT 
    sr.result_id,
    d.subject_name,
    d.subject_type,
    sr.execution_date,
    sr.highest_match_score,
    sr.overall_result,
    ce.final_decision,
    ce.evaluated_at,
    u.full_name as evaluated_by
FROM screening_results sr
JOIN dossiers d ON sr.dossier_id = d.dossier_id
LEFT JOIN compliance_evaluations ce ON sr.result_id = ce.result_id
LEFT JOIN users u ON ce.evaluated_by = u.user_id
WHERE sr.highest_match_score >= 85.0
ORDER BY sr.execution_date DESC;
```

### 8.3 Reporte de Tiempos de Respuesta del CO

```sql
-- Tiempo promedio de evaluación por el CO
SELECT 
    u.full_name as oficial,
    COUNT(*) as evaluaciones_completadas,
    AVG(EXTRACT(EPOCH FROM (ce.evaluated_at - sr.execution_date))/3600) as horas_promedio,
    MIN(EXTRACT(EPOCH FROM (ce.evaluated_at - sr.execution_date))/3600) as horas_minimo,
    MAX(EXTRACT(EPOCH FROM (ce.evaluated_at - sr.execution_date))/3600) as horas_maximo
FROM compliance_evaluations ce
JOIN screening_results sr ON ce.result_id = sr.result_id
JOIN users u ON ce.evaluated_by = u.user_id
WHERE ce.status = 'COMPLETED'
GROUP BY u.full_name;
```

---

## 9. Flujo Completo de Ejemplo

### Escenario: Nuevo Cliente con Coincidencia Media

```
1. CREACIÓN DE EXPEDIENTE
   Usuario: Analista de Riesgos
   Acción: Crea expediente para Juan Carlos Rodríguez
   
2. SCREENING AUTOMÁTICO
   Sistema: Ejecuta screening contra todas las listas activas
   Resultado: Coincidencia 82% en lista OFAC con "Juan Rodriguez"
   
3. GENERACIÓN DE ALERTA
   Sistema: Genera alerta MEDIUM
   Notificación: Enviada al Oficial de Cumplimiento
   
4. EVALUACIÓN CO
   Usuario: Oficial de Cumplimiento
   Análisis:
   - Revisa datos del cliente: Juan Carlos Rodríguez, 1985-03-15, VE
   - Revisa datos OFAC: Juan Rodriguez, 1982-07-20, CO
   - Conclusión: Falso positivo (diferentes fechas nacimiento y país)
   
5. DECISIÓN CO
   Decisión: FALSE_POSITIVE
   Justificación: "Persona homónima pero diferente fecha de nacimiento y nacionalidad"
   Acción: APPROVED
   Impacto: NO_IMPACT en nivel de riesgo
   
6. ACTUALIZACIÓN EXPEDIENTE
   Sistema: Actualiza expediente con evaluación aprobada
   Estado: CLEAR para continuar con proceso de onboarding
   
7. TRAZABILIDAD
   Audit Log: Todos los pasos registrados con timestamps y usuarios
```

---

## 10. Configuración Inicial del Sistema

### Script de Inicialización de Listas

```sql
-- Insertar configuración de listas obligatorias
INSERT INTO screening_list_configuration (
    list_code, list_name, list_type, is_active, priority, update_frequency
) VALUES
    ('UN_CONSOLIDATED', 'Lista Consolidada ONU', 'SANCTIONS', true, 1, 'WEEKLY'),
    ('OFAC_SDN', 'OFAC Specially Designated Nationals', 'SANCTIONS', true, 1, 'DAILY'),
    ('EU_SANCTIONS', 'Unión Europea - Sanciones', 'SANCTIONS', true, 2, 'WEEKLY'),
    ('UNIF_VE', 'UNIF Venezuela', 'AML', true, 1, 'MONTHLY'),
    ('GAFI_HIGH_RISK', 'GAFI Jurisdicciones Alto Riesgo', 'HIGH_RISK_JURISDICTIONS', true, 2, 'MONTHLY');
```

---

## Conclusión

El módulo de Screening y Verificación está diseñado para:

✅ **Cumplimiento Total**: Consulta todas las listas obligatorias  
✅ **Automatización**: Ejecución automática en creación de expedientes  
✅ **Precisión**: Algoritmo Jaro-Winkler para comparaciones inteligentes  
✅ **No Bloquea**: Solo alerta, no impide operaciones  
✅ **Trazabilidad**: Registro completo de todas las acciones  
✅ **Segregación**: Solo CO puede evaluar resultados  
✅ **Evidencia**: Toda la información disponible para inspecciones  
✅ **Integración**: Conectado con riesgo y debida diligencia  
✅ **Escalabilidad**: Diseño preparado para alto volumen  

El sistema proporciona evidencia clara y documentada para demostrar al regulador que la empresa cumple con todas sus obligaciones de screening contra listas nacionales e internacionales.
