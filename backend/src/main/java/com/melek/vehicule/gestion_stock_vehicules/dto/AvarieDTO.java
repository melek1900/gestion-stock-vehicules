package com.melek.vehicule.gestion_stock_vehicules.dto;

import com.melek.vehicule.gestion_stock_vehicules.model.Avarie;
import com.melek.vehicule.gestion_stock_vehicules.model.Photo;

import java.util.List;

public class AvarieDTO {
    private Long id;
    private String type;
    private String commentaire;
    private List<Long> photoIds;


    public AvarieDTO(Avarie avarie) {
        this.id = avarie.getId();
        this.type = avarie.getType();
        this.commentaire = avarie.getCommentaire();
        this.photoIds = avarie.getPhotos().stream()
                .map(Photo::getId)
                .toList();
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

    public List<Long> getPhotoIds() {
        return photoIds;
    }

    public void setPhotoIds(List<Long> photoIds) {
        this.photoIds = photoIds;
    }
}
