package com.melek.vehicule.gestion_stock_vehicules.dto;

public class StatistiqueParcParMarqueDTO {
    private String marque;
    private String parc;
    private long count;

    public StatistiqueParcParMarqueDTO(String marque, String parc, long count) {
        this.marque = marque;
        this.parc = parc;
        this.count = count;
    }

    // Getters
    public String getMarque() { return marque; }
    public String getParc() { return parc; }
    public long getCount() { return count; }
}

