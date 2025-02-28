package com.melek.vehicule.gestion_stock_vehicules.dto;

import com.melek.vehicule.gestion_stock_vehicules.model.Parc;
import com.melek.vehicule.gestion_stock_vehicules.model.StatutVehicule;
import com.melek.vehicule.gestion_stock_vehicules.model.Vehicule;

import java.util.Date;
import java.util.List;

public class VehiculeDTO {
    private Long id;
    private String modele;
    private String numeroChassis;
    private String couleur;
    private Date dateArrivee;
    private String provenance;
    private StatutVehicule statut;
    private Parc parc;
    private List<AvarieDTO> avaries;

    public Parc getParc() {
        return parc;
    }

    public void setParc(Parc parc) {
        this.parc = parc;
    }

    public VehiculeDTO(Vehicule vehicule) {
        this.id = vehicule.getId();
        this.modele = vehicule.getModele();
        this.numeroChassis = vehicule.getNumeroChassis();
        this.couleur = vehicule.getCouleur();
        this.dateArrivee = vehicule.getDateArrivee();
        this.provenance = vehicule.getProvenance();
        this.statut = vehicule.getStatut();
        this.parc = vehicule.getParc(); // ✅ Ajout de parc
        this.avaries = vehicule.getAvaries().stream()
                .map(AvarieDTO::new)
                .toList(); // Convertit les Avaries en DTOs
    }

    // Getters et Setters

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

    public Date getDateArrivee() {
        return dateArrivee;
    }

    public void setDateArrivee(Date dateArrivee) {
        this.dateArrivee = dateArrivee;
    }

    public String getProvenance() {
        return provenance;
    }

    public void setProvenance(String provenance) {
        this.provenance = provenance;
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
