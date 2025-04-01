package com.melek.vehicule.gestion_stock_vehicules.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
public class Photo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;

    @Lob
    @Column(name = "data", columnDefinition="LONGBLOB")
    private byte[] data;

    @ManyToOne
    @JoinColumn(name = "avarie_id", nullable = false)
    @JsonBackReference
    private Avarie avarie;

    public Photo() {}

    public Photo(String fileName, byte[] data, Avarie avarie) {
        this.fileName = fileName;
        this.data = data;
        this.avarie = avarie;
    }

    // ✅ Getters et Setters
    public Long getId() { return id; }
    public String getFileName() { return fileName; }
    public byte[] getData() { return data; }
    public Avarie getAvarie() { return avarie; }

    public void setFileName(String fileName) { this.fileName = fileName; }
    public void setData(byte[] data) { this.data = data; }
    public void setAvarie(Avarie avarie) { this.avarie = avarie; }
}
