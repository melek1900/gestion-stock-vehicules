package com.melek.vehicule.gestion_stock_vehicules.model;


import jakarta.persistence.*;
import java.util.Date;

@Entity
public class Vente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private long TotalVendu;
    private String marque;
    private String modele;


    public String getModele() {
        return modele;
    }

    public void setModele(String modele) {
        this.modele = modele;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public long getTotalVendu() {
        return TotalVendu;
    }

    public void setTotalVendu(long totalVendu) {
        TotalVendu = totalVendu;
    }

    public String getMarque() {
        return marque;
    }

    public void setMarque(String marque) {
        this.marque = marque;
    }


}
