package com.melek.vehicule.gestion_stock_vehicules.model;

import jakarta.persistence.*;

@Entity
@Table(name = "transfert_vehicules")
public class TransfertVehicule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ✅ ID devient clé primaire avec AUTO_INCREMENT
    private Long id;

    @ManyToOne
    @JoinColumn(name = "transfert_id", nullable = false)
    private Transfert transfert;

    @ManyToOne
    @JoinColumn(name = "vehicule_id", nullable = false)
    private Vehicule vehicule;

    // ✅ Constructeurs
    public TransfertVehicule() {}

    public TransfertVehicule(Transfert transfert, Vehicule vehicule) {
        this.transfert = transfert;
        this.vehicule = vehicule;
    }

    // ✅ Getters & Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Transfert getTransfert() {
        return transfert;
    }

    public void setTransfert(Transfert transfert) {
        this.transfert = transfert;
    }

    public Vehicule getVehicule() {
        return vehicule;
    }

    public void setVehicule(Vehicule vehicule) {
        this.vehicule = vehicule;
    }
}

