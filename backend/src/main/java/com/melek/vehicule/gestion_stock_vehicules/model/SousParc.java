package com.melek.vehicule.gestion_stock_vehicules.model;

import jakarta.persistence.*;

@Entity
public class SousParc {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;

    @ManyToOne
    @JoinColumn(name = "parc_id")
    private Parc parc;

    public Long getId() {
        return id;
    }

    public String getNom() {
        return nom;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public Parc getParc() {
        return parc;
    }

    public void setParc(Parc parc) {
        this.parc = parc;
    }
}
