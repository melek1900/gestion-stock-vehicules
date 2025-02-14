package com.melek.vehicule.gestion_stock_vehicules.model;
import jakarta.persistence.*;
import java.util.Date;
import java.util.List;


@Entity
public class Vehicule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String modele;
    private String numeroChassis;
    private String couleur;
    private Date dateArrivee;
    private String provenance;

    @Enumerated(EnumType.STRING)
    private StatutVehicule statut;

    @ManyToOne
    @JoinColumn(name = "stock_id")
    private Stock stock;

    @ManyToOne
    @JoinColumn(name = "parc_id")
    private Parc parc;

    @OneToMany(mappedBy = "vehicule")
    private List<Avarie> avaries;

    @OneToMany(mappedBy = "vehicule")
    private List<HistoriqueMouvements> historiques;
    @ManyToOne
    @JoinColumn(name = "utilisateur_id")
    private Utilisateur utilisateur;

    @OneToOne(mappedBy = "vehicule")
    private Vente vente;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getModele() {
        return modele;
    }

    public void setModele(String modele) {
        this.modele = modele;
    }

    public String getNumeroChassis() {
        return numeroChassis;
    }

    public void setNumeroChassis(String numeroChassis) {
        this.numeroChassis = numeroChassis;
    }

    public String getCouleur() {
        return couleur;
    }

    public void setCouleur(String couleur) {
        this.couleur = couleur;
    }

    public Date getDateArrivee() {
        return dateArrivee;
    }

    public void setDateArrivee(Date dateArrivee) {
        this.dateArrivee = dateArrivee;
    }

    public String getProvenance() {
        return provenance;
    }

    public void setProvenance(String provenance) {
        this.provenance = provenance;
    }

    public StatutVehicule getStatut() {
        return statut;
    }

    public void setStatut(StatutVehicule statut) {
        this.statut = statut;
    }

    public Stock getStock() {
        return stock;
    }

    public void setStock(Stock stock) {
        this.stock = stock;
    }

    public Parc getParc() {
        return parc;
    }

    public void setParc(Parc parc) {
        this.parc = parc;
    }

    public List<Avarie> getAvaries() {
        return avaries;
    }

    public void setAvaries(List<Avarie> avaries) {
        this.avaries = avaries;
    }

    public List<HistoriqueMouvements> getHistoriques() {
        return historiques;
    }

    public void setHistoriques(List<HistoriqueMouvements> historiques) {
        this.historiques = historiques;
    }

    public Vente getVente() {
        return vente;
    }

    public void setVente(Vente vente) {
        this.vente = vente;
    }

    public DemandeExpertise getDemandeExpertise() {
        return demandeExpertise;
    }

    public void setDemandeExpertise(DemandeExpertise demandeExpertise) {
        this.demandeExpertise = demandeExpertise;
    }

    @OneToOne(mappedBy = "vehicule")
    private DemandeExpertise demandeExpertise;
}
