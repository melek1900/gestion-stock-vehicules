package com.melek.vehicule.gestion_stock_vehicules.dto;

public class PreparationDTO {
    private Long vehiculeId;
    private boolean nettoyageEffectue;
    private boolean inspectionEffectuee;
    private String remarques;

    // Getters et Setters
    public Long getVehiculeId() {
        return vehiculeId;
    }

    public void setVehiculeId(Long vehiculeId) {
        this.vehiculeId = vehiculeId;
    }

    public boolean isNettoyageEffectue() {
        return nettoyageEffectue;
    }

    public void setNettoyageEffectue(boolean nettoyageEffectue) {
        this.nettoyageEffectue = nettoyageEffectue;
    }

    public boolean isInspectionEffectuee() {
        return inspectionEffectuee;
    }

    public void setInspectionEffectuee(boolean inspectionEffectuee) {
        this.inspectionEffectuee = inspectionEffectuee;
    }

    public String getRemarques() {
        return remarques;
    }

    public void setRemarques(String remarques) {
        this.remarques = remarques;
    }
}
