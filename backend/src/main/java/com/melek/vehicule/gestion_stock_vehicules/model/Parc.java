package com.melek.vehicule.gestion_stock_vehicules.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.util.List;

@Entity
public class Parc {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String localisation;
    @Enumerated(EnumType.STRING) // ✅ Stocke le type de parc en texte (ex: STOCK, VENTE)
    private TypeParc typeParc;

    @OneToMany(mappedBy = "parc", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Vehicule> vehicules;

  

    @OneToMany(mappedBy = "parc", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<SousParc> sousParcs;

    public List<SousParc> getSousParcs() {
        return sousParcs;
    }

    public void setSousParcs(List<SousParc> sousParcs) {
        this.sousParcs = sousParcs;
    }
    public List<Vehicule> getVehicules() {
        return vehicules;
    }

    public TypeParc getTypeParc() {
        return typeParc;
    }

    public void setTypeParc(TypeParc typeParc) {
        this.typeParc = typeParc;
    }

    public void setVehicules(List<Vehicule> vehicules) {
        this.vehicules = vehicules;
    }




    public String getLocalisation() {
        return localisation;
    }

    public void setLocalisation(String localisation) {
        this.localisation = localisation;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }



}
