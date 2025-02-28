package com.melek.vehicule.gestion_stock_vehicules.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
public class Photo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;

    @ManyToOne
    @JoinColumn(name = "avarie_id", nullable = false)
    @JsonBackReference // ✅ Empêche la récursion infinie avec Avarie
    private Avarie avarie;

    public Photo() {}

    public Photo(String fileName, Avarie avarie) {
        this.fileName = fileName;
        this.avarie = avarie;
    }

    // ✅ Getters et Setters
    public Long getId() { return id; }
    public String getFileName() { return fileName; }
    public Avarie getAvarie() { return avarie; }

    public void setId(Long id) { this.id = id; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public void setAvarie(Avarie avarie) { this.avarie = avarie; }
}