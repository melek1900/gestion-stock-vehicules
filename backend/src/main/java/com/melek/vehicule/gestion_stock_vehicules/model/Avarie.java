package com.melek.vehicule.gestion_stock_vehicules.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Avarie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type;
    private String commentaire;

    @ManyToOne
    @JoinColumn(name = "vehicule_id", nullable = false)
    @JsonIgnore // ✅ Empêche la boucle infinie avec Vehicule
    private Vehicule vehicule;

    @OneToMany(mappedBy = "avarie", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Photo> photos = new ArrayList<>();

    public Avarie() {}

    public Avarie(String type, String commentaire, Vehicule vehicule) {
        this.type = type;
        this.commentaire = commentaire;
        this.vehicule = vehicule;
    }

    // ✅ Ajout d'une photo à l'avarie
    public void addPhoto(Photo photo) {
        photo.setAvarie(this);
        this.photos.add(photo);
    }

    // ✅ Getters et Setters
    public Long getId() { return id; }
    public String getType() { return type; }
    public String getCommentaire() { return commentaire; }
    public Vehicule getVehicule() { return vehicule; }
    public List<Photo> getPhotos() { return photos; }

    public void setId(Long id) { this.id = id; }
    public void setType(String type) { this.type = type; }
    public void setCommentaire(String commentaire) { this.commentaire = commentaire; }
    public void setVehicule(Vehicule vehicule) { this.vehicule = vehicule; }
    public void setPhotos(List<Photo> photos) { this.photos = photos; }
}
