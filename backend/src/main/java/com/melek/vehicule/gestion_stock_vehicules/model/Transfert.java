package com.melek.vehicule.gestion_stock_vehicules.model;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
public class Transfert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToMany
    @JoinTable(
            name = "transfert_vehicules",
            joinColumns = @JoinColumn(name = "transfert_id"),
            inverseJoinColumns = @JoinColumn(name = "vehicule_id")
    )
    private List<Vehicule> vehicules = new ArrayList<>();
    @ManyToOne
    @JoinColumn(name = "ordre_mission_id")
    private OrdreMission ordreMission;

    public OrdreMission getOrdreMission() {
        return ordreMission;
    }

    public void setOrdreMission(OrdreMission ordreMission) {
        this.ordreMission = ordreMission;
    }

    public Date getDateReception() {
        return dateReception;
    }

    public void setDateReception(Date dateReception) {
        this.dateReception = dateReception;
    }

    private Date dateTransfert;
    private Date dateReception;

    @ManyToOne
    @JoinColumn(name = "parc_source_id")
    private Parc parcSource;

    @ManyToOne
    @JoinColumn(name = "parc_destination_id")
    private Parc parcDestination;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut")
    private StatutTransfert statut;

    public Transfert() {}

    public void setStatut(StatutTransfert statut) {
        this.statut = statut;
    }
// Getters et Setters

    public Long getId() {
        return id;
    }

    public StatutTransfert getStatut() {
        return statut;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<Vehicule> getVehicules() {
        return vehicules;
    }

    public void setVehicules(List<Vehicule> vehicules) {
        this.vehicules = vehicules;
    }

    public Date getDateTransfert() {
        return dateTransfert;
    }

    public void setDateTransfert(Date dateTransfert) {
        this.dateTransfert = dateTransfert;
    }

    public Parc getParcSource() {
        return parcSource;
    }

    public void setParcSource(Parc parcSource) {
        this.parcSource = parcSource;
    }

    public Parc getParcDestination() {
        return parcDestination;
    }

    public void setParcDestination(Parc parcDestination) {
        this.parcDestination = parcDestination;
    }
    public void addVehicule(Vehicule vehicule) {
        if (this.vehicules == null) {
            this.vehicules = new ArrayList<>();
        }
        this.vehicules.add(vehicule);
    }

}
