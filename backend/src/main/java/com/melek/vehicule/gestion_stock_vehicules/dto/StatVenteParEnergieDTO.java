package com.melek.vehicule.gestion_stock_vehicules.dto;

public class StatVenteParEnergieDTO {
    private String energie;
    private Long total;

    public StatVenteParEnergieDTO(String energie, Long total) {
        this.energie = energie;
        this.total = total;
    }

    public String getEnergie() {
        return energie;
    }

    public void setEnergie(String energie) {
        this.energie = energie;
    }

    public Long getTotal() {
        return total;
    }

    public void setTotal(Long total) {
        this.total = total;
    }
}

