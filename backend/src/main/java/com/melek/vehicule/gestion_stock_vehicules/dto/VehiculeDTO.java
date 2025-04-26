package com.melek.vehicule.gestion_stock_vehicules.dto;

import com.melek.vehicule.gestion_stock_vehicules.model.Parc;
import com.melek.vehicule.gestion_stock_vehicules.model.StatutVehicule;
import com.melek.vehicule.gestion_stock_vehicules.model.Vehicule;

import java.util.Date;
import java.util.List;

public class VehiculeDTO {
    private Long id;
    private Date productionDate;
    private String numeroChassis; // ✅ Ajout du VIN
    private String modele;
    private String description;
    private String engine;
    private String keyCode;
    private String couleur;
    private String pegCode;
    private String shortDescription;
    private String shortColor;
    private StatutVehicule statut;
    private Long parcId; // ✅ Ajout de l'ID du parc
    private String parcNom;
    private List<AvarieDTO> avaries;
    private String sousParcNom;



    public VehiculeDTO(Vehicule vehicule) {
        this.id = vehicule.getId();
        this.modele = vehicule.getModele();
        this.numeroChassis = vehicule.getNumeroChassis();
        this.couleur = vehicule.getCouleur();
        this.statut = vehicule.getStatut();
        this.parcNom = vehicule.getParc() != null ? vehicule.getParc().getNom() : "AUPORT";
        this.sousParcNom = vehicule.getSousParc() != null ? vehicule.getSousParc().getNom() : null;

        this.parcId = vehicule.getParc() != null ? vehicule.getParc().getId() : null;

        this.productionDate = vehicule.getProductionDate();
        this.description = vehicule.getDescription();
        this.engine = vehicule.getEngine();
        this.keyCode = vehicule.getKeyCode();
        this.pegCode = vehicule.getPegCode();
        this.shortColor = vehicule.getShortColor();
        this.shortDescription = vehicule.getShortDescription();

        this.avaries = vehicule.getAvaries() != null ?
                vehicule.getAvaries().stream().map(AvarieDTO::new).toList() : List.of();
    }

    // Getters et Setters


    public String getSousParcNom() {
        return sousParcNom;
    }

    public void setSousParcNom(String sousParcNom) {
        this.sousParcNom = sousParcNom;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getEngine() {
        return engine;
    }

    public void setEngine(String engine) {
        this.engine = engine;
    }

    public String getKeyCode() {
        return keyCode;
    }

    public void setKeyCode(String keyCode) {
        this.keyCode = keyCode;
    }

    public Long getParcId() {
        return parcId;
    }

    public void setParcId(Long parcId) {
        this.parcId = parcId;
    }

    public String getPegCode() {
        return pegCode;
    }

    public void setPegCode(String pegCode) {
        this.pegCode = pegCode;
    }

    public String getShortDescription() {
        return shortDescription;
    }

    public void setShortDescription(String shortDescription) {
        this.shortDescription = shortDescription;
    }

    public String getShortColor() {
        return shortColor;
    }

    public void setShortColor(String shortColor) {
        this.shortColor = shortColor;
    }

    public String getParcNom() {
        return parcNom;
    }

    public void setParcNom(String parcNom) {
        this.parcNom = parcNom;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getModele() {
        return modele;
    }

    public void setModele(String modele) {
        this.modele = modele;
    }

    public String getNumeroChassis() {
        return numeroChassis;
    }

    public void setNumeroChassis(String numeroChassis) {
        this.numeroChassis = numeroChassis;
    }

    public String getCouleur() {
        return couleur;
    }

    public void setCouleur(String couleur) {
        this.couleur = couleur;
    }


    public Date getProductionDate() {
        return productionDate;
    }

    public void setProductionDate(Date productionDate) {
        this.productionDate = productionDate;
    }

    public StatutVehicule getStatut() {
        return statut;
    }

    public void setStatut(StatutVehicule statut) {
        this.statut = statut;
    }

    public List<AvarieDTO> getAvaries() {
        return avaries;
    }

    public void setAvaries(List<AvarieDTO> avaries) {
        this.avaries = avaries;
    }
}
