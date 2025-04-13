package com.melek.vehicule.gestion_stock_vehicules.dto;

import java.util.List;

public class AvarieWithPhotosDTO {
    private String type;
    private String commentaire;
    private String key; // identifiant temporaire côté frontend

    // Getters / Setters
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getCommentaire() { return commentaire; }
    public void setCommentaire(String commentaire) { this.commentaire = commentaire; }

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }
}
