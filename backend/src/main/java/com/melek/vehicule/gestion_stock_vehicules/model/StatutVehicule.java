package com.melek.vehicule.gestion_stock_vehicules.model;

public enum StatutVehicule {
    EN_STOCK,
    TRANSFERT,  // ✅ Vérifier que c'est bien cette valeur qui est stockée en base
    EN_PREPARATION,
    PRET_A_LA_VENTE,
    VENDU;
}
