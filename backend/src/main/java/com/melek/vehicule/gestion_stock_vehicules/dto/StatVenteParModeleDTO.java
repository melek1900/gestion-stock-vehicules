package com.melek.vehicule.gestion_stock_vehicules.dto;

public class StatVenteParModeleDTO {
    private String modele;
    private Long total;
    private String groupe;

    public StatVenteParModeleDTO(String modele, Long total) {
        this.modele = modele;
        this.total = total;
    }

    public String getGroupe() {
        return groupe;
    }

    public void setGroupe(String groupe) {
        this.groupe = groupe;
    }

    public String getModele() {
        return modele;
    }

    public void setModele(String modele) {
        this.modele = modele;
    }

    public Long getTotal() {
        return total;
    }

    public void setTotal(Long total) {
        this.total = total;
    }
}
