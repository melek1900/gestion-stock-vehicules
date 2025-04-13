package com.melek.vehicule.gestion_stock_vehicules.dto;

import com.melek.vehicule.gestion_stock_vehicules.model.Avarie;
import com.melek.vehicule.gestion_stock_vehicules.model.Photo;

import java.util.List;

public class AvarieDTO {
    private Long id;
    private String type;
    private String commentaire;
    private List<String> photoUrls;


    public AvarieDTO(Avarie avarie) {
        this.id = avarie.getId();
        this.type = avarie.getType();
        this.commentaire = avarie.getCommentaire();
        this.photoUrls = avarie.getPhotos().stream()
                .map(photo -> "/api/photos-by-name/" + photo.getFileName())
                .toList();
    }

    // Getters et Setters

    public List<String> getPhotoUrls() {
        return photoUrls;
    }

    public void setPhotoUrls(List<String> photoUrls) {
        this.photoUrls = photoUrls;
    }

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


}
