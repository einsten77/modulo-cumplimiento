package com.siar.screening.dto;

import com.siar.screening.model.ScreeningType;

public class ScreeningExecutionRequest {
    
    private Long dossierId;
    private ScreeningType screeningType;
    
    public Long getDossierId() {
        return dossierId;
    }
    
    public void setDossierId(Long dossierId) {
        this.dossierId = dossierId;
    }
    
    public ScreeningType getScreeningType() {
        return screeningType;
    }
    
    public void setScreeningType(ScreeningType screeningType) {
        this.screeningType = screeningType;
    }
}
