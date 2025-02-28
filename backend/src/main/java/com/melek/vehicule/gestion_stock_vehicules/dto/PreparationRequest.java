package com.melek.vehicule.gestion_stock_vehicules.dto;

import java.util.List;

public class PreparationRequest {
    private Long vehiculeId;
    private String statut;
    private List<String> actionsEffectuees; // Ex: nettoyage, contrôle technique, etc.
    private boolean nettoyage;
    private boolean inspection;

    public boolean isNettoyage() {
        return nettoyage;
    }

    public void setNettoyage(boolean nettoyage) {
        this.nettoyage = nettoyage;
    }

    public boolean isInspection() {
        return inspection;
    }

    public void setInspection(boolean inspection) {
        this.inspection = inspection;
    }

    public Long getVehiculeId() {
        return vehiculeId;
    }

    public void setVehiculeId(Long vehiculeId) {
        this.vehiculeId = vehiculeId;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public List<String> getActionsEffectuees() {
        return actionsEffectuees;
    }

    public void setActionsEffectuees(List<String> actionsEffectuees) {
        this.actionsEffectuees = actionsEffectuees;
    }
}
