package com.melek.vehicule.gestion_stock_vehicules.dto;

public class AvarieCreationDTO {
    private String type;
    private String commentaire;

    public AvarieCreationDTO() {}

    public AvarieCreationDTO(String type, String commentaire) {
        this.type = type;
        this.commentaire = commentaire;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getCommentaire() {
        return commentaire;
    }

    public void setCommentaire(String commentaire) {
        this.commentaire = commentaire;
    }
}
