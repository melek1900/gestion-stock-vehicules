package com.melek.vehicule.gestion_stock_vehicules.model;

import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
public class Avarie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type;



    private String commentaire;
    private String photoUrl;



    @ManyToOne
    @JoinColumn(name = "vehicule_id")
    @JsonIgnore
    private Vehicule vehicule;

    @OneToMany(mappedBy = "avarie", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<Photo> photos = new ArrayList<>();

    public Avarie() {}

    public Avarie(String type, String commentaire, Vehicule vehicule) {
        this.type = type;
        this.commentaire = commentaire;
        this.vehicule = vehicule;
    }

    public void addPhoto(Photo photo) {
        photo.setAvarie(this);
        this.photos.add(photo);
    }

    public void addPhotos(List<Photo> photos) {
        for (Photo photo : photos) {
            addPhoto(photo);
        }
    }

    public String getPhotoUrl() {
        return photoUrl;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setCommentaire(String commentaire) {
        this.commentaire = commentaire;
    }

    public void setVehicule(Vehicule vehicule) {
        this.vehicule = vehicule;
    }
    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }    public Long getId() { return id; }
    public String getType() { return type; }
    public String getCommentaire() { return commentaire; }
    public Vehicule getVehicule() { return vehicule; }
    public List<Photo> getPhotos() { return photos; }

    public void setPhotos(List<Photo> photos) { this.photos = photos; }
}
