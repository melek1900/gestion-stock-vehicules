package com.melek.vehicule.gestion_stock_vehicules.dto;

import com.melek.vehicule.gestion_stock_vehicules.model.Avarie;
import com.melek.vehicule.gestion_stock_vehicules.model.Photo;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class AvarieDTO {
    private Long id;
    private String type;
    private String commentaire;
    private List<String> photoUrls;
    private List<Long> photoIds;


    public AvarieDTO(Avarie avarie) {
        this.id = avarie.getId();
        this.type = avarie.getType();
        this.commentaire = avarie.getCommentaire();

        if (avarie.getPhotos() != null) {
            this.photoIds = avarie.getPhotos().stream()
                    .map(Photo::getId)
                    .collect(Collectors.toList());

            this.photoUrls = avarie.getPhotos().stream()
                    .map(photo -> "http://localhost:8080/photos/" + photo.getId())
                    .collect(Collectors.toList());
        } else {
            this.photoIds = List.of();
            this.photoUrls = List.of();
        }
    }

    public List<Long> getPhotoIds() {
        return photoIds;
    }

    public void setPhotoIds(List<Long> photoIds) {
        this.photoIds = photoIds;
    }

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
