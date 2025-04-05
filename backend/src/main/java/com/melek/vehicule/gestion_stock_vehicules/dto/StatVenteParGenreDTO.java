package com.melek.vehicule.gestion_stock_vehicules.dto;

public class StatVenteParGenreDTO {
    private String genre;
    private Long total;
    private String groupe; // "NOS_MARQUES" ou "CONCURRENCE"

    public StatVenteParGenreDTO(String genre, Long total, String groupe) {
        this.genre = genre;
        this.total = total;
        this.groupe = groupe;
    }

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public Long getTotal() {
        return total;
    }

    public void setTotal(Long total) {
        this.total = total;
    }

    public String getGroupe() {
        return groupe;
    }

    public void setGroupe(String groupe) {
        this.groupe = groupe;
    }
}
