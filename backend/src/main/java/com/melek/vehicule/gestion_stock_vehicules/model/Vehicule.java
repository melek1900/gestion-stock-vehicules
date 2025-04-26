package com.melek.vehicule.gestion_stock_vehicules.model;

import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Getter
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

    @Setter
    @ManyToOne
    @JoinColumn(name = "stock_id")
    @JsonIgnore
    private Stock stock;


    @OneToMany(mappedBy = "vehicule", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<Avarie> avaries = new ArrayList<>();
    @ManyToOne
    @JoinColumn(name = "sous_parc_id")
    private SousParc sousParc;
    public Vehicule() {}

    public void setSousParc(SousParc sousParc) {
        this.sousParc = sousParc;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setNumeroChassis(String numeroChassis) {
        this.numeroChassis = numeroChassis;
    }

    public void setModele(String modele) {
        this.modele = modele;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setEngine(String engine) {
        this.engine = engine;
    }

    public void setKeyCode(String keyCode) {
        this.keyCode = keyCode;
    }

    public void setCouleur(String couleur) {
        this.couleur = couleur;
    }

    public void setPegCode(String pegCode) {
        this.pegCode = pegCode;
    }

    public void setShortDescription(String shortDescription) {
        this.shortDescription = shortDescription;
    }

    public void setShortColor(String shortColor) {
        this.shortColor = shortColor;
    }

    public void setProductionDate(Date productionDate) {
        this.productionDate = productionDate;
    }


    public void setStatut(StatutVehicule statut) {
        this.statut = statut;
    }

    public void setUtilisateur(Utilisateur utilisateur) {
        this.utilisateur = utilisateur;
    }

    public void setParc(Parc parc) {
        this.parc = parc;
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
