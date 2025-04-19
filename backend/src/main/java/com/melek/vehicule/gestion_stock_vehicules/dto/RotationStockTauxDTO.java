package com.melek.vehicule.gestion_stock_vehicules.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RotationStockTauxDTO {
    @JsonProperty("mois")
    private String mois;

    @JsonProperty("marque")
    private String marque;

    @JsonProperty("taux")
    private Double taux;

    public RotationStockTauxDTO(String mois, String marque, Double taux) {
        this.mois = mois;
        this.marque = marque;
        this.taux = taux;
    }

    public String getMois() { return mois; }
    public String getMarque() { return marque; }
    public Double getTaux() { return taux; }
}

