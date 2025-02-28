package com.melek.vehicule.gestion_stock_vehicules.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
public class Vehicule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String modele;
    private String numeroChassis;
    private String couleur;

    @Temporal(TemporalType.DATE)
    private Date dateArrivee;

    private String provenance;

    @Enumerated(EnumType.STRING)
    private StatutVehicule statut;

    @ElementCollection
    private List<String> photos = new ArrayList<>();

    @OneToMany(mappedBy = "vehicule", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // ✅ Empêche la boucle infinie lors de la sérialisation
    private List<Avarie> avaries = new ArrayList<>();
    @ManyToOne
    @JoinColumn(name = "parc_id")
    @JsonIgnore // ✅ Empêche la boucle infinie
    private Parc parc;

    @ManyToOne
    @JoinColumn(name = "stock_id")
    @JsonIgnore // ✅ Empêche la boucle infinie
    private Stock stock;

    @ManyToOne
    @JoinColumn(name = "utilisateur_id")
    @JsonIgnore // ✅ Empêche la boucle infinie
    private Utilisateur utilisateur;

    public Vehicule() {}

    // ✅ Getters et Setters
    public Long getId() { return id; }
    public String getModele() { return modele; }
    public String getNumeroChassis() { return numeroChassis; }
    public String getCouleur() { return couleur; }
    public Date getDateArrivee() { return dateArrivee; }
    public String getProvenance() { return provenance; }
    public StatutVehicule getStatut() { return statut; }
    public Parc getParc() { return parc; }
    public Stock getStock() { return stock; }
    public Utilisateur getUtilisateur() { return utilisateur; }
    public List<Avarie> getAvaries() { return avaries; }
    public List<String> getPhotos() { return photos; }

    public void setId(Long id) { this.id = id; }
    public void setModele(String modele) { this.modele = modele; }
    public void setNumeroChassis(String numeroChassis) { this.numeroChassis = numeroChassis; }
    public void setCouleur(String couleur) { this.couleur = couleur; }
    public void setDateArrivee(Date dateArrivee) { this.dateArrivee = dateArrivee; }
    public void setProvenance(String provenance) { this.provenance = provenance; }
    public void setStatut(StatutVehicule statut) { this.statut = statut; }
    public void setParc(Parc parc) { this.parc = parc; }
    public void setStock(Stock stock) { this.stock = stock; }
    public void setUtilisateur(Utilisateur utilisateur) { this.utilisateur = utilisateur; }
    public void setAvaries(List<Avarie> avaries) { this.avaries = avaries; }
    public void setPhotos(List<String> photos) { this.photos = photos; }

    // ✅ Ajout d'une avarie
    public void addAvarie(Avarie avarie) {
        avarie.setVehicule(this);
        this.avaries.add(avarie);
    }
}
