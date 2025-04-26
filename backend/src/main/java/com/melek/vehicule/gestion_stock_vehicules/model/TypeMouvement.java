package com.melek.vehicule.gestion_stock_vehicules.model;

import jakarta.persistence.*;

@Entity
@Table(name = "type_mouvement")
public class TypeMouvement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idTransact;

    @Column(name = "libel_transact", nullable = false, unique = true)
    private String libelTransact;

    public Long getIdTransact() {
        return idTransact;
    }

    public void setIdTransact(Long idTransact) {
        this.idTransact = idTransact;
    }

    public String getLibelTransact() {
        return libelTransact;
    }

    public void setLibelTransact(String libelTransact) {
        this.libelTransact = libelTransact;
    }
}

