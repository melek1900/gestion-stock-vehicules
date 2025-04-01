package com.melek.vehicule.gestion_stock_vehicules.model;

import jakarta.persistence.*;

@Entity
@Table(name = "vehicules_transport")
public class VehiculeTransport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String matricule; // ✅ Renommé au lieu de `immatriculation`
    private int capacite;
    private String type;
    private boolean disponible = true; // ✅ Par défaut, le véhicule est disponible

    // ✅ Constructeurs
    public VehiculeTransport() {}

    public VehiculeTransport(String immatriculation, int capacite, String type) {
        this.matricule = matricule;
        this.capacite = capacite;
        this.type = type;
        this.disponible = true;
    }

    // ✅ Getters & Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMatricule() {
        return matricule;
    }

    public void setMatricule(String matricule) {
        this.matricule = matricule;
    }

    public int getCapacite() {
        return capacite;
    }

    public void setCapacite(int capacite) {
        this.capacite = capacite;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public boolean isDisponible() {
        return disponible;
    }

    public void setDisponible(boolean disponible) {
        this.disponible = disponible;
    }
}
