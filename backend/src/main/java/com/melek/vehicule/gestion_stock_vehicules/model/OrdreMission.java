package com.melek.vehicule.gestion_stock_vehicules.model;

import jakarta.persistence.*;
import java.util.Date;
import java.util.List;

@Entity
public class OrdreMission {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numeroOrdre; // ✅ Numéro unique de l'ordre (QR Code)
    private Date dateCreation;
    @ManyToMany
    @JoinTable(
            name = "ordre_mission_vehicules",
            joinColumns = @JoinColumn(name = "ordre_mission_id"),
            inverseJoinColumns = @JoinColumn(name = "vehicule_id")
    )
    private List<Vehicule> vehicules;
    @Enumerated(EnumType.STRING)
    private StatutOrdreMission statut;
    @ManyToOne
    @JoinColumn(name = "parc_arrivee_id", nullable = false)
    private Parc parcArrivee;
    @OneToMany(mappedBy = "ordreMission", cascade = CascadeType.ALL)
    private List<Transfert> transferts;
    @ManyToOne
    @JoinColumn(name = "chauffeur_id")
    private Chauffeur chauffeur;
    @ManyToOne
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;
    @ManyToOne
    @JoinColumn(name = "vehicule_transport_id")
    private VehiculeTransport vehiculeTransport;
    @ManyToOne
    @JoinColumn(name = "parc_depart_id", nullable = false)
    private Parc parcDepart;
    public OrdreMission() {
    }
    public OrdreMission(String numeroOrdre, Date dateCreation, List<Vehicule> vehicules, Chauffeur chauffeur, VehiculeTransport vehiculeTransport, Parc parcDepart, Parc parcArrivee) {
        this.numeroOrdre = numeroOrdre;
        this.dateCreation = dateCreation;
        this.statut = StatutOrdreMission.EN_COURS;
        this.vehicules = vehicules;
        this.chauffeur = chauffeur;
        this.vehiculeTransport = vehiculeTransport;
        this.parcDepart = parcDepart;
        this.parcArrivee = parcArrivee;
    }

    public Utilisateur getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(Utilisateur utilisateur) {
        this.utilisateur = utilisateur;
    }

    public Parc getParcArrivee() {
        return parcArrivee;
    }

    public void setParcArrivee(Parc parcArrivee) {
        this.parcArrivee = parcArrivee;
    }

    public Parc getParcDepart() {
        return parcDepart;
    }

    public void setParcDepart(Parc parcDepart) {
        this.parcDepart = parcDepart;
    }

    // ✅ Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNumeroOrdre() {
        return numeroOrdre;
    }

    public void setNumeroOrdre(String numeroOrdre) {
        this.numeroOrdre = numeroOrdre;
    }

    public List<Vehicule> getVehicules() {
        return vehicules;
    }

    public void setVehicules(List<Vehicule> vehicules) {
        this.vehicules = vehicules;
    }

    public Chauffeur getChauffeur() {
        return chauffeur;
    }

    public void setChauffeur(Chauffeur chauffeur) {
        this.chauffeur = chauffeur;
    }

    public VehiculeTransport getVehiculeTransport() {
        return vehiculeTransport;
    }

    public void setVehiculeTransport(VehiculeTransport vehiculeTransport) {
        this.vehiculeTransport = vehiculeTransport;
    }

    public Date getDateCreation() { return dateCreation; }
    public void setDateCreation(Date dateCreation) { this.dateCreation = dateCreation; }

    public StatutOrdreMission getStatut() { return statut; }
    public void setStatut(StatutOrdreMission statut) { this.statut = statut; }

    public List<Transfert> getTransferts() { return transferts; }
    public void setTransferts(List<Transfert> transferts) { this.transferts = transferts; }
}
