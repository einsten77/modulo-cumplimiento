package com.siar.screening.service;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;

@Service
public class JaroWinklerService {
    
    private static final double DEFAULT_SCALING_FACTOR = 0.1;
    private static final int DEFAULT_PREFIX_LENGTH = 4;
    
    /**
     * Calcula la similitud Jaro-Winkler entre dos strings.
     * 
     * @param s1 Primera cadena
     * @param s2 Segunda cadena
     * @return Similitud de 0.0 a 1.0 (0% a 100%)
     */
    public double calculateSimilarity(String s1, String s2) {
        if (s1 == null || s2 == null) {
            return 0.0;
        }
        
        // Normalizar: lowercase, remover acentos, trim
        s1 = normalizeString(s1);
        s2 = normalizeString(s2);
        
        if (s1.equals(s2)) {
            return 1.0;
        }
        
        if (s1.isEmpty() || s2.isEmpty()) {
            return 0.0;
        }
        
        // Calcular similitud Jaro
        double jaroSimilarity = calculateJaroSimilarity(s1, s2);
        
        // Calcular longitud del prefijo común
        int prefixLength = calculateCommonPrefixLength(s1, s2);
        
        // Aplicar Jaro-Winkler
        return jaroSimilarity + (prefixLength * DEFAULT_SCALING_FACTOR * (1.0 - jaroSimilarity));
    }
    
    private double calculateJaroSimilarity(String s1, String s2) {
        int s1Len = s1.length();
        int s2Len = s2.length();
        
        // Distancia máxima para considerar coincidencia
        int matchDistance = Math.max(s1Len, s2Len) / 2 - 1;
        if (matchDistance < 0) matchDistance = 0;
        
        boolean[] s1Matches = new boolean[s1Len];
        boolean[] s2Matches = new boolean[s2Len];
        
        int matches = 0;
        int transpositions = 0;
        
        // Buscar coincidencias
        for (int i = 0; i < s1Len; i++) {
            int start = Math.max(0, i - matchDistance);
            int end = Math.min(i + matchDistance + 1, s2Len);
            
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
        for (int i = 0; i < s1Len; i++) {
            if (!s1Matches[i]) continue;
            while (!s2Matches[k]) k++;
            if (s1.charAt(i) != s2.charAt(k)) {
                transpositions++;
            }
            k++;
        }
        
        return ((double) matches / s1Len +
                (double) matches / s2Len +
                (double) (matches - transpositions / 2.0) / matches) / 3.0;
    }
    
    private int calculateCommonPrefixLength(String s1, String s2) {
        int minLen = Math.min(s1.length(), s2.length());
        int maxPrefixLen = Math.min(DEFAULT_PREFIX_LENGTH, minLen);
        
        for (int i = 0; i < maxPrefixLen; i++) {
            if (s1.charAt(i) != s2.charAt(i)) {
                return i;
            }
        }
        return maxPrefixLen;
    }
    
    private String normalizeString(String str) {
        if (str == null) return "";
        
        // Convertir a minúsculas
        str = str.toLowerCase();
        
        // Remover acentos
        str = Normalizer.normalize(str, Normalizer.Form.NFD);
        str = str.replaceAll("\\p{M}", "");
        
        // Remover caracteres especiales excepto espacios
        str = str.replaceAll("[^a-z0-9\\s]", "");
        
        // Remover espacios múltiples
        str = str.replaceAll("\\s+", " ").trim();
        
        return str;
    }
    
    /**
     * Convierte similitud (0.0-1.0) a porcentaje (0-100).
     */
    public BigDecimal toPercentage(double similarity) {
        return BigDecimal.valueOf(similarity * 100)
            .setScale(2, RoundingMode.HALF_UP);
    }
}
