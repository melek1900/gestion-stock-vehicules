package com.melek.vehicule.gestion_stock_vehicules.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
public class CarteGrise {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numeroChassis;
    private String numeroCarteGrise;
    private String immatriculation;

    private LocalDate datePremiereMiseEnCirculation;

    private String codeClient;
    private String nomClient;
    private String adresseClient;

    @OneToOne
    @JoinColumn(name = "vehicule_id")
    private Vehicule vehicule;

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

    public String getNumeroCarteGrise() {
        return numeroCarteGrise;
    }

    public void setNumeroCarteGrise(String numeroCarteGrise) {
        this.numeroCarteGrise = numeroCarteGrise;
    }

    public String getImmatriculation() {
        return immatriculation;
    }

    public void setImmatriculation(String immatriculation) {
        this.immatriculation = immatriculation;
    }

    public LocalDate getDatePremiereMiseEnCirculation() {
        return datePremiereMiseEnCirculation;
    }

    public void setDatePremiereMiseEnCirculation(LocalDate datePremiereMiseEnCirculation) {
        this.datePremiereMiseEnCirculation = datePremiereMiseEnCirculation;
    }

    public String getCodeClient() {
        return codeClient;
    }

    public void setCodeClient(String codeClient) {
        this.codeClient = codeClient;
    }

    public String getNomClient() {
        return nomClient;
    }

    public void setNomClient(String nomClient) {
        this.nomClient = nomClient;
    }

    public String getAdresseClient() {
        return adresseClient;
    }

    public void setAdresseClient(String adresseClient) {
        this.adresseClient = adresseClient;
    }

    public Vehicule getVehicule() {
        return vehicule;
    }

    public void setVehicule(Vehicule vehicule) {
        this.vehicule = vehicule;
    }
}

