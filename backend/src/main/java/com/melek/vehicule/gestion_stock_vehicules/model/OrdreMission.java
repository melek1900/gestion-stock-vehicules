package com.melek.vehicule.gestion_stock_vehicules.model;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
public class OrdreMission {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numeroOrdre;
    private Date dateCreation;
    @ManyToMany
    @JoinTable(
            name = "ordre_mission_vehicules",
            joinColumns = @JoinColumn(name = "ordre_mission_id"),
            inverseJoinColumns = @JoinColumn(name = "vehicule_id")
    )
    private List<Vehicule> vehicules;
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private StatutOrdreMission statut;
    @ManyToOne
    @JoinColumn(name = "parc_arrivee_id", nullable = false)
    private Parc parcArrivee;
    @OneToMany(mappedBy = "ordreMission", cascade = CascadeType.ALL)
    private List<Transfert> transferts;
    @ManyToMany
    @JoinTable(
            name = "ordre_mission_chauffeurs",
            joinColumns = @JoinColumn(name = "ordre_mission_id"),
            inverseJoinColumns = @JoinColumn(name = "chauffeur_id")
    )
    private Set<Chauffeur> chauffeurs = new HashSet<>();
    @ManyToOne
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;
    @ManyToOne
    @JoinColumn(name = "vehicule_transport_id")
    private VehiculeTransport vehiculeTransport;
    @ManyToOne
    @JoinColumn(name = "parc_depart_id", nullable = false)
    private Parc parcDepart;
    @ManyToOne
    @JoinColumn(name = "motif_deplacement_id", nullable = false)
    private MotifDeplacement motifDeplacement;
    @Column(name = "date_depart")
    private LocalDate dateDepart;

    @Column(name = "heure_depart")
    private LocalTime heureDepart;
    @ManyToOne
    @JoinColumn(name = "sous_parc_id")
    private SousParc sousParc;
    public OrdreMission() {
    }
    public OrdreMission(String numeroOrdre, Date dateCreation, List<Vehicule> vehicules,
                        Set<Chauffeur> chauffeurs, VehiculeTransport vehiculeTransport,
                        Parc parcDepart, Parc parcArrivee) {
        this.numeroOrdre = numeroOrdre;
        this.dateCreation = dateCreation;
        this.statut = StatutOrdreMission.EN_COURS;
        this.vehicules = vehicules;
        this.chauffeurs = chauffeurs;
        this.vehiculeTransport = vehiculeTransport;
        this.parcDepart = parcDepart;
        this.parcArrivee = parcArrivee;
    }
    public SousParc getSousParc() {
        return sousParc;
    }

    public void setSousParc(SousParc sousParc) {
        this.sousParc = sousParc;
    }
    public MotifDeplacement getMotifDeplacement() {
        return motifDeplacement;
    }

    public void setMotifDeplacement(MotifDeplacement motifDeplacement) {
        this.motifDeplacement = motifDeplacement;
    }

    public LocalDate getDateDepart() {
        return dateDepart;
    }

    public void setDateDepart(LocalDate dateDepart) {
        this.dateDepart = dateDepart;
    }

    public LocalTime getHeureDepart() {
        return heureDepart;
    }

    public void setHeureDepart(LocalTime heureDepart) {
        this.heureDepart = heureDepart;
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


    public Set<Chauffeur> getChauffeurs() {
        return chauffeurs;
    }

    public void setChauffeurs(Set<Chauffeur> chauffeurs) {
        this.chauffeurs = chauffeurs;
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
