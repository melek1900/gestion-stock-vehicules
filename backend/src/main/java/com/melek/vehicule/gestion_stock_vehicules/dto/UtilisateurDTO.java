package com.melek.vehicule.gestion_stock_vehicules.dto;

import com.melek.vehicule.gestion_stock_vehicules.model.Marque;
import com.melek.vehicule.gestion_stock_vehicules.model.Parc;
import com.melek.vehicule.gestion_stock_vehicules.model.RoleUtilisateur;
import java.util.List;
import java.util.Set;

public class UtilisateurDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private RoleUtilisateur role;
    private String parcNom;
    private List<String> parcsAccessibles;
    private Set<Marque> marquesAccessibles;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public RoleUtilisateur getRole() {
        return role;
    }

    public void setRole(RoleUtilisateur role) {
        this.role = role;
    }

    public String getParcNom() {
        return parcNom;
    }

    public void setParcNom(String parcNom) {
        this.parcNom = parcNom;
    }

    public Set<Marque> getMarquesAccessibles() {
        return marquesAccessibles;
    }

    public void setMarquesAccessibles(Set<Marque> marquesAccessibles) {
        this.marquesAccessibles = marquesAccessibles;
    }

    public List<String> getParcsAccessibles() {
        return parcsAccessibles;
    }

    public void setParcsAccessibles(List<String> parcsAccessibles) {
        this.parcsAccessibles = parcsAccessibles;
    }
}
