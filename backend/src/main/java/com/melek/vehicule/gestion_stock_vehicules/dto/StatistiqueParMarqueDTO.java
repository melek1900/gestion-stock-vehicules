package com.melek.vehicule.gestion_stock_vehicules.dto;

public class StatistiqueParMarqueDTO {
    private String marque;
    private long count;

    public StatistiqueParMarqueDTO(String marque, long count) {
        this.marque = marque;
        this.count = count;
    }

    public String getMarque() {
        return marque;
    }

    public long getCount() {
        return count;
    }
}
