package com.melek.vehicule.gestion_stock_vehicules.model;

import jakarta.persistence.*;

@Entity
@Table(name = "vente_region")
public class VenteRegion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String marque;
    private String region;
    private Long totalVendu;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMarque() {
        return marque;
    }

    public void setMarque(String marque) {
        this.marque = marque;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public Long getTotalVendu() {
        return totalVendu;
    }

    public void setTotalVendu(Long totalVendu) {
        this.totalVendu = totalVendu;
    }
}

