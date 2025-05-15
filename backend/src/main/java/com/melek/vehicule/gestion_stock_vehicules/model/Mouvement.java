package com.melek.vehicule.gestion_stock_vehicules.model;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "mouvement")
public class Mouvement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numeroChassis;

    private int sequence;
    @Column(name = "utilisateur_nom_complet", nullable = false)
    private String utilisateurNomComplet;
    @ManyToOne
    @JoinColumn(name = "parc_id", nullable = false)
    private Parc parc;

    @ManyToOne
    @JoinColumn(name = "type_mouvement", referencedColumnName = "libel_transact", nullable = false)
    private TypeMouvement typeMouvement;

    private int qty;

    private LocalDate dateMouvement;

    private LocalTime heureMouvement;

    @ManyToOne
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    public String getUtilisateurNomComplet() {
        return utilisateurNomComplet;
    }

    public void setUtilisateurNomComplet(String utilisateurNomComplet) {
        this.utilisateurNomComplet = utilisateurNomComplet;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumeroChassis() {
        return numeroChassis;
    }

    public void setNumeroChassis(String numeroChassis) {
        this.numeroChassis = numeroChassis;
    }

    public int getSequence() {
        return sequence;
    }

    public void setSequence(int sequence) {
        this.sequence = sequence;
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

    public Utilisateur getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(Utilisateur utilisateur) {
        this.utilisateur = utilisateur;
    }
}

