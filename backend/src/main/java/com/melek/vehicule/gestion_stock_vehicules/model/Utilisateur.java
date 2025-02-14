package com.melek.vehicule.gestion_stock_vehicules.model;
import jakarta.persistence.*;
import java.util.List;

@Entity
public class Utilisateur {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String email;

    @Enumerated(EnumType.STRING)
    private RoleUtilisateur role;

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

    public List<Vente> getVentes() {
        return ventes;
    }

    public void setVentes(List<Vente> ventes) {
        this.ventes = ventes;
    }

    public List<Vehicule> getVehicules() {
        return vehicules;
    }

    public void setVehicules(List<Vehicule> vehicules) {
        this.vehicules = vehicules;
    }

    public List<DemandeExpertise> getDemandesExpertise() {
        return demandesExpertise;
    }

    public void setDemandesExpertise(List<DemandeExpertise> demandesExpertise) {
        this.demandesExpertise = demandesExpertise;
    }

    public List<HistoriqueMouvements> getHistoriques() {
        return historiques;
    }

    public void setHistoriques(List<HistoriqueMouvements> historiques) {
        this.historiques = historiques;
    }

    @OneToMany(mappedBy = "utilisateur")
    private List<Vente> ventes;

    @OneToMany(mappedBy = "utilisateur")
    private List<Vehicule> vehicules;

    @OneToMany(mappedBy = "utilisateur")
    private List<DemandeExpertise> demandesExpertise;

    @OneToMany(mappedBy = "utilisateur")
    private List<HistoriqueMouvements> historiques;
}
