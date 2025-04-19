package com.melek.vehicule.gestion_stock_vehicules.dto;

public class StatVenteParRegionDTO {
    private String region;
    private Long total;

    public StatVenteParRegionDTO(String region, Long total) {
        this.region = region;
        this.total = total;
    }

    public String getRegion() { return region; }
    public Long getTotal() { return total; }

    public void setRegion(String region) { this.region = region; }
    public void setTotal(Long total) { this.total = total; }
}
