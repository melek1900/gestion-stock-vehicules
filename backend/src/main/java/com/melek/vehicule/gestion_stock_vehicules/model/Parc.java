package com.melek.vehicule.gestion_stock_vehicules.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Parc {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String localisation;

    public List<Vehicule> getVehicules() {
        return vehicules;
    }

    public void setVehicules(List<Vehicule> vehicules) {
        this.vehicules = vehicules;
    }

    public List<HistoriqueMouvements> getHistoriques() {
        return historiques;
    }

    public void setHistoriques(List<HistoriqueMouvements> historiques) {
        this.historiques = historiques;
    }

    public String getLocalisation() {
        return localisation;
    }

    public void setLocalisation(String localisation) {
        this.localisation = localisation;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @OneToMany(mappedBy = "parc")
    private List<Vehicule> vehicules;

    @OneToMany(mappedBy = "parc")
    private List<HistoriqueMouvements> historiques;

}
