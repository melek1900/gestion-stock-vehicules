package com.melek.vehicule.gestion_stock_vehicules.model;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.*;

@Entity
public class Utilisateur implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String prenom;
    private String email;
    private String motDePasse;

    @ManyToOne
    @JoinColumn(name = "parc_id", nullable = true) // ✅ Le parc de travail
    private Parc parc;

    @ManyToMany
    @JoinTable(
            name = "utilisateur_parcs_acces",
            joinColumns = @JoinColumn(name = "utilisateur_id"),
            inverseJoinColumns = @JoinColumn(name = "parc_id")
    )
    private List<Parc> parcsAcces = new ArrayList<>();  // ✅ Les parcs où l'utilisateur a accès

    @Enumerated(EnumType.STRING)
    private RoleUtilisateur role;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "utilisateur_marques_accessibles",
            joinColumns = @JoinColumn(name = "utilisateur_id"),
            inverseJoinColumns = @JoinColumn(name = "marque_id")
    )
    private Set<Marque> marquesAccessibles = new HashSet<>();


    public Utilisateur() {}
    public Utilisateur(String nom, String prenom, String email, String motDePasse, RoleUtilisateur role, Parc parc) {
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.motDePasse = motDePasse;
        this.role = role;
        this.parc = parc;
    }

    public Utilisateur(Long id, String nom, String prenom, String email, String motDePasse, RoleUtilisateur role, Parc parc) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.motDePasse = motDePasse;
        this.role = role;
        this.parc = parc;
    }


    public Set<Marque> getMarquesAccessibles() {
        return marquesAccessibles;
    }

    public void setMarquesAccessibles(Set<Marque> marquesAccessibles) {
        this.marquesAccessibles = marquesAccessibles;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public Parc getParc() {
        return parc;
    }

    public void setParc(Parc parc) {
        this.parc = parc;
    }

    public List<Parc> getParcsAcces() {
        return parcsAcces;
    }

    public void setParcsAcces(List<Parc> parcsAcces) {
        this.parcsAcces = parcsAcces;
    }

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }

    public void setNom(String nom) { this.nom = nom; }

    public String getEmail() { return email; }

    public void setEmail(String email) { this.email = email; }

    public RoleUtilisateur getRole() { return role; }

    public void setRole(RoleUtilisateur role) { this.role = role; }

    public String getMotDePasse() { return motDePasse; }

    public void setMotDePasse(String motDePasse) { this.motDePasse = motDePasse; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(this.role.name()));
    }

    @Override
    public String getUsername() { return this.email; }

    @Override
    public String getPassword() { return this.motDePasse; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}
