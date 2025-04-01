package com.melek.vehicule.gestion_stock_vehicules.model;

import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
public class Vehicule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numeroChassis;
    private String modele;
    private String description;
    private String engine;
    private String keyCode;
    private String couleur;
    private String pegCode;
    private String shortDescription;
    private String shortColor;


    @Temporal(TemporalType.DATE)
    private Date productionDate;


    @Enumerated(EnumType.STRING)
    private StatutVehicule statut = StatutVehicule.EN_ETAT;

    @ManyToOne
    @JoinColumn(name = "utilisateur_id")
    @JsonIgnore
    private Utilisateur utilisateur;

    @ManyToOne(cascade = CascadeType.MERGE)
    @JoinColumn(name = "parc_id")
    @JsonIgnore
    private Parc parc;

    @ManyToOne
    @JoinColumn(name = "stock_id")
    @JsonIgnore
    private Stock stock;


    @OneToMany(mappedBy = "vehicule", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<Avarie> avaries = new ArrayList<>();

    public Vehicule() {}

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

    public String getModele() {
        return modele;
    }

    public void setModele(String modele) {
        this.modele = modele;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getEngine() {
        return engine;
    }

    public void setEngine(String engine) {
        this.engine = engine;
    }

    public String getKeyCode() {
        return keyCode;
    }

    public void setKeyCode(String keyCode) {
        this.keyCode = keyCode;
    }

    public String getCouleur() {
        return couleur;
    }

    public void setCouleur(String couleur) {
        this.couleur = couleur;
    }

    public String getPegCode() {
        return pegCode;
    }

    public void setPegCode(String pegCode) {
        this.pegCode = pegCode;
    }

    public String getShortDescription() {
        return shortDescription;
    }

    public void setShortDescription(String shortDescription) {
        this.shortDescription = shortDescription;
    }

    public String getShortColor() {
        return shortColor;
    }

    public void setShortColor(String shortColor) {
        this.shortColor = shortColor;
    }

    public Date getProductionDate() {
        return productionDate;
    }

    public void setProductionDate(Date productionDate) {
        this.productionDate = productionDate;
    }


    public StatutVehicule getStatut() {
        return statut;
    }

    public void setStatut(StatutVehicule statut) {
        this.statut = statut;
    }

    public Utilisateur getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(Utilisateur utilisateur) {
        this.utilisateur = utilisateur;
    }

    public Parc getParc() {
        return parc;
    }

    public void setParc(Parc parc) {
        this.parc = parc;
    }

    public Stock getStock() {
        return stock;
    }

    public void setStock(Stock stock) {
        this.stock = stock;
    }

    public List<Avarie> getAvaries() {
        return avaries;
    }

    @PostUpdate
    public void afterUpdate() {
        System.out.println("✅ Mise à jour du véhicule : " + this.numeroChassis);
    }


    public void setAvaries(List<Avarie> avaries) {
        this.avaries.clear();
        if (avaries != null) {
            for (Avarie avarie : avaries) {
                avarie.setVehicule(this);
            }
            this.avaries.addAll(avaries);
        }
    }



}
