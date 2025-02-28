package com.melek.vehicule.gestion_stock_vehicules.dto;

import com.melek.vehicule.gestion_stock_vehicules.model.Avarie;
import com.melek.vehicule.gestion_stock_vehicules.model.Photo;

import java.util.List;

public class AvarieDTO {
    private Long id;
    private String type;
    private String commentaire;
    private List<String> photos; // Ne renvoie que les noms des photos


    public AvarieDTO(Avarie avarie) {
        this.id = avarie.getId();
        this.type = avarie.getType();
        this.commentaire = avarie.getCommentaire();
        this.photos = avarie.getPhotos().stream()
                .map(Photo::getFileName)
                .toList(); // Convertit les photos en liste de noms
    }

    // Getters et Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public List<String> getPhotos() {
        return photos;
    }

    public void setPhotos(List<String> photos) {
        this.photos = photos;
    }
}
