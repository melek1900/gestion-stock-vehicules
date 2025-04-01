package com.melek.vehicule.gestion_stock_vehicules.dto;

import com.melek.vehicule.gestion_stock_vehicules.model.Vehicule;

import java.util.List;

public class ImportResult {
    private List<Vehicule> vehiculesAjoutes;
    private int nombreVehiculesIgnores;
    private String numeroImport;
    public ImportResult(List<Vehicule> vehiculesAjoutes, int nombreVehiculesIgnores, String numeroImport) {
        this.vehiculesAjoutes = vehiculesAjoutes;
        this.nombreVehiculesIgnores = nombreVehiculesIgnores;
        this.numeroImport = numeroImport;

    }

    public String getNumeroImport() {
        return numeroImport;
    }

    public void setNumeroImport(String numeroImport) {
        this.numeroImport = numeroImport;
    }

    public List<Vehicule> getVehiculesAjoutes() {
        return vehiculesAjoutes;
    }

    public void setVehiculesAjoutes(List<Vehicule> vehiculesAjoutes) {
        this.vehiculesAjoutes = vehiculesAjoutes;
    }

    public int getNombreVehiculesIgnores() {
        return nombreVehiculesIgnores;
    }

    public void setNombreVehiculesIgnores(int nombreVehiculesIgnores) {
        this.nombreVehiculesIgnores = nombreVehiculesIgnores;
    }
}
