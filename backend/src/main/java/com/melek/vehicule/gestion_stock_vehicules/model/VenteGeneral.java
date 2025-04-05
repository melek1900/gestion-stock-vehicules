package com.melek.vehicule.gestion_stock_vehicules.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class VenteGeneral {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private long TotalVendu;
    private String marque;
    private String Genre;
}
