export interface Vehicule {
    id?: number;
    productionDate: string;
    numeroChassis: string;
    modele: string;
    description: string;
    engine: string;
    keyCode: string;
    couleur: string;
    pegCode: string;
    shortDescription: string;
    shortColor: string;
    statut: string;
    parcId: number;  // ✅ On garde l'ID du parc
    parcNom?: string;  // ✅ Ajout du nom du parc après conversion
    avaries?: Avarie[]; // ✅ Liste d'avaries associées
  }
  
  export interface Avarie {
    id?: number;
    type: string;
    commentaire: string;
  }
  