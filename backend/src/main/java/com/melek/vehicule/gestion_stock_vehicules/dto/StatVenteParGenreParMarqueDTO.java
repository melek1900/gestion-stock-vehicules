package com.melek.vehicule.gestion_stock_vehicules.dto;

public class StatVenteParGenreParMarqueDTO {
    private String marque;
    private String genre;
    private Long total;

    public StatVenteParGenreParMarqueDTO(String marque, String genre, Long total) {
        this.marque = marque;
        this.genre = genre;
        this.total = total;
    }

    public String getMarque() {
        return marque;
    }

    public String getGenre() {
        return genre;
    }

    public Long getTotal() {
        return total;
    }

    public void setMarque(String marque) {
        this.marque = marque;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public void setTotal(Long total) {
        this.total = total;
    }
}
