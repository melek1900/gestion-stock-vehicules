package com.melek.vehicule.gestion_stock_vehicules.model;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Date;

@Entity
public class HistoriqueMouvements {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idSequence;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_vehicule", referencedColumnName = "numeroChassis")
    private Vehicule vehicule;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_parc")
    private Parc parc;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_mvt")
    private TypeMouvement typeMouvement;

    @Column(name = "id_comp")
    private Long idOrdreMission;

    @Column(name = "comp")
    private String numeroOrdreMission;

    @Column(name = "qty")
    private int qty; // +1 ou -1

    @Column(name = "date_mvt")
    private LocalDate dateMouvement;

    @Column(name = "heure_mvt")
    private LocalTime heureMouvement;

    @Column(name = "id_user")
    private String nomUtilisateur;

    public Long getIdSequence() {
        return idSequence;
    }

    public void setIdSequence(Long idSequence) {
        this.idSequence = idSequence;
    }

    public Vehicule getVehicule() {
        return vehicule;
    }

    public void setVehicule(Vehicule vehicule) {
        this.vehicule = vehicule;
    }

    public Parc getParc() {
        return parc;
    }

    public void setParc(Parc parc) {
        this.parc = parc;
    }

    public TypeMouvement getTypeMouvement() {
        return typeMouvement;
    }

    public void setTypeMouvement(TypeMouvement typeMouvement) {
        this.typeMouvement = typeMouvement;
    }

    public Long getIdOrdreMission() {
        return idOrdreMission;
    }

    public void setIdOrdreMission(Long idOrdreMission) {
        this.idOrdreMission = idOrdreMission;
    }

    public String getNumeroOrdreMission() {
        return numeroOrdreMission;
    }

    public void setNumeroOrdreMission(String numeroOrdreMission) {
        this.numeroOrdreMission = numeroOrdreMission;
    }

    public int getQty() {
        return qty;
    }

    public void setQty(int qty) {
        this.qty = qty;
    }

    public LocalDate getDateMouvement() {
        return dateMouvement;
    }

    public void setDateMouvement(LocalDate dateMouvement) {
        this.dateMouvement = dateMouvement;
    }

    public LocalTime getHeureMouvement() {
        return heureMouvement;
    }

    public void setHeureMouvement(LocalTime heureMouvement) {
        this.heureMouvement = heureMouvement;
    }

    public String getNomUtilisateur() {
        return nomUtilisateur;
    }

    public void setNomUtilisateur(String nomUtilisateur) {
        this.nomUtilisateur = nomUtilisateur;
    }
}
