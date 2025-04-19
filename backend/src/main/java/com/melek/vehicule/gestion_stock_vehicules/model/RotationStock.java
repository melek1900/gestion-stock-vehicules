package com.melek.vehicule.gestion_stock_vehicules.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "rotation_stock")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RotationStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String marque;

    private LocalDate date;

    private int quantiteVendue;

    private BigDecimal valeurVente;

    private int quantiteAchetee;

    private BigDecimal valeurAchat;
}
