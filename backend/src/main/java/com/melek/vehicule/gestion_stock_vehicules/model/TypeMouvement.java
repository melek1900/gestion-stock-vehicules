package com.melek.vehicule.gestion_stock_vehicules.model;

import jakarta.persistence.*;

@Entity
@Table(name = "type_mouvement")
public class TypeMouvement {

    @Id
    @Column(name = "libel_transact", nullable = false, unique = true)
    private String libelTransact;


    public String getLibelTransact() {
        return libelTransact;
    }

    public void setLibelTransact(String libelTransact) {
        this.libelTransact = libelTransact;
    }
}

