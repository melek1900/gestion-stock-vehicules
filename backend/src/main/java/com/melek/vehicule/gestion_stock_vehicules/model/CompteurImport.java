package com.melek.vehicule.gestion_stock_vehicules.model;

import jakarta.persistence.Entity;
import jakarta.persistence.*;

@Entity
public class CompteurImport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String annee;
    private int compteur;

    public String getNumeroComplet() {
        return annee + "-" + String.format("%04d", compteur);
    }

    public CompteurImport() {
    }

    public CompteurImport(String annee, int compteur) {
        this.annee = annee;
        this.compteur = compteur;
    }
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAnnee() {
        return annee;
    }

    public void setAnnee(String annee) {
        this.annee = annee;
    }

    public int getCompteur() {
        return compteur;
    }

    public void setCompteur(int compteur) {
        this.compteur = compteur;
    }
}
