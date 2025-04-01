package com.melek.vehicule.gestion_stock_vehicules.model;
import jakarta.persistence.*;

import java.util.List;

@Entity
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int nombreTotal;

    @OneToOne
    @JoinColumn(name = "parc_id", unique = true)  // 🔥 Ajoute cette relation !
    private Parc parc;

    public Parc getParc() {
        return parc;
    }

    public void setParc(Parc parc) {
        this.parc = parc;
    }

    @OneToMany(mappedBy = "stock")
    private List<Vehicule> vehicules;

    public List<Rapport> getRapports() {
        return rapports;
    }

    public void setRapports(List<Rapport> rapports) {
        this.rapports = rapports;
    }

    public List<Vehicule> getVehicules() {
        return vehicules;
    }

    public void setVehicules(List<Vehicule> vehicules) {
        this.vehicules = vehicules;
    }

    public int getNombreTotal() {
        return nombreTotal;
    }

    public void setNombreTotal(int nombreTotal) {
        this.nombreTotal = nombreTotal;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @OneToMany(mappedBy = "stock")
    private List<Rapport> rapports;

}
