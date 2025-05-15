package com.melek.vehicule.gestion_stock_vehicules.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class MouvementDTO {
    private String numeroChassis;
    private int sequence;
    private Long parcId;
    private Long typeMouvementId;
    private int qty;
    private LocalDate dateMouvement;
    private LocalTime heureMouvement;
    private Long utilisateurId;
}
