import { ChangeDetectorRef,ViewChild, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { PopupVehiculeComponent } from '../popup-vehicule/popup-vehicule.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { SelectionModel } from '@angular/cdk/collections';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { StatutVehicule } from '../../models/statut-vehicule.enum';
import { StatutTransfert } from '../../models/statut-transfert.enum';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { Vehicule } from '../../models/vehicule.model';
import { MatMenuModule } from '@angular/material/menu';

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { MatInputModule } from '@angular/material/input';
@Component({
  selector: 'app-vehicule-list',
  standalone: true,
  templateUrl: './vehicule-list.component.html',
  styleUrls: ['./vehicule-list.component.scss'],
  imports: [
    CommonModule,
    MatInputModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatButtonToggleModule,
    MatPaginatorModule,
    MatMenuModule
    
  ]
})

export class VehiculeListComponent implements OnInit {
  displayedColumns: string[] = [
    'select',
    'shortDescription',
    'modele',
    'shortColor',
    'numeroChassis',
    'productionDate',
    'statut',
    'parcNom',
    'actions'
  ];
  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  vehicules: any[] = [];
  vehiculesFiltres: any[] = [];
  selectedParc: string = 'all';
  selectedStatut: string = 'all'
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  userRole: string | null = null;
  selection = new SelectionModel<any>(true, []);
  StatutVehicule = StatutVehicule; 
  StatutTransfert = StatutTransfert;
  parcId: number | null = null;
  isOrdreMission:Boolean=false;
  marquesAccessibles: string[] = [];
  marquesDisponibles: string[] = [];
  selectedMarques: string[] = [];
  selectedParcs: string[] = [];
  parcsAccessibles: any[] = [];
  searchQuery: string = '';
  searchChassis = '';
  searchColor = '';
  searchBrand = '';
  constructor(private cdr: ChangeDetectorRef, private router: Router, private route: ActivatedRoute, private authService: AuthService) {}


  vehiculesSelectionnes: any[] = []; 
  ngOnInit(): void {
    this.recupererRoleUtilisateur();
  
    this.getParcId();
  
    this.chargerParcsAccessibles();
  
    if (this.selectedMarques.length === 0 && this.marquesAccessibles.length > 0) {
      this.selectedMarques = [...this.marquesAccessibles];
    }
    this.dataSource = new MatTableDataSource(this.vehicules);

    setTimeout(() => {
      this.chargerVehicules();
  
      const parcNom = this.obtenirParcAssocie();
      if (this.selectedParcs.length === 0 && parcNom) {
        this.selectedParcs = [parcNom];
      }
      this.filtrerVehicules();
    }, 300);
  }
   
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
 
  chargerParcsAccessibles() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn("⚠️ Aucun token trouvé, fallback API...");
      this.recupererParcsDepuisAPI();
      return;
    }
  
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
  
      // ⚠️ Ici il faut bien vérifier si le champ est un tableau d’objets { id, nom }
      if (Array.isArray(payload.parcsAcces)) {
        // Si tableau de strings => transformation en [{ nom: '...' }]
        if (typeof payload.parcsAcces[0] === 'string') {
          this.parcsAccessibles = payload.parcsAcces.map((nom: string) => ({ nom }));
        } 
        // Si déjà un tableau d’objets
        else if (payload.parcsAcces[0].nom) {
          this.parcsAccessibles = payload.parcsAcces;
        }
      }
    } catch (err) {
      console.error("❌ Erreur décodage token :", err);
      this.recupererParcsDepuisAPI();
    }
  }
  
  
  
  
  
  recupererParcsDepuisAPI() {
    this.http.get<any[]>('http://localhost:8080/api/utilisateurs/parcs-accessibles')
      .subscribe({
        next: (parcs) => {
          this.parcsAccessibles = parcs;
          console.log("✅ Parcs accessibles via API :", parcs);
        },
        error: (err) => {
          console.error("❌ Erreur API parcs accessibles :", err);
        }
      });
  }
  
  
  naviguerVersTransfert() {
    if (this.selection.selected.length === 0) {
      console.warn("⚠️ Aucun véhicule sélectionné pour le transfert !");
      return;
    }
  
    // Récupération des ID des véhicules sélectionnés
    const vehiculeIds = this.selection.selected.map(v => v.id);
  
    // Navigation vers la page de transfert avec les IDs sélectionnés
    this.router.navigate(['/transfert-selection'], { queryParams: { vehicules: vehiculeIds.join(',') } });
  }
  
  recupererRoleUtilisateur() {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.userRole = payload.role;
      const parcUtilisateur = payload.parcNom || null;
  
      this.marquesAccessibles = payload.marquesAccessibles || [];
  
      if (this.userRole === 'ROLE_GESTIONNAIRE_APPLICATION') {
        this.isOrdreMission = true;
      }
  
      if (parcUtilisateur) {
        this.selectedParcs = [parcUtilisateur];
      }
  
      // Ajout automatique des parcs accessibles formatés { nom: '...' }
      if (Array.isArray(payload.parcsAcces)) {
        this.parcsAccessibles = payload.parcsAcces.map((nom: string) => ({ nom }));
      }
    }
  }
  
  ouvrirPopupLivraison(vehicule: any) {
    console.log("📌 Livraison du véhicule :", vehicule);
    this.ouvrirPopup(vehicule); // 🔥 Pour l’instant, utiliser la même popup
  }
  
  ouvrirPopupVente(vehicule: any) {
    console.log("📌 Vente du véhicule :", vehicule);
    this.ouvrirPopup(vehicule); // 🔥 Pour l’instant, utiliser la même popup
  }
  
  ouvrirPopupReservation(vehicule: any) {
    console.log("📌 Réservation du véhicule :", vehicule);
    this.ouvrirPopup(vehicule); // 🔥 Pour l’instant, utiliser la même popup
  }
  recupererParcsAccessibles() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (Array.isArray(payload.parcsAcces)) {
          this.parcsAccessibles = payload.parcsAcces.map((nom: string) => ({ nom }));
          console.log("🌍 Parcs accessibles depuis token :", this.parcsAccessibles);
          return;
        }
      } catch (error) {
        console.error("❌ Erreur lors du décodage du token:", error);
      }
    }
  
    // Fallback si erreur
    this.http.get<any[]>('http://localhost:8080/api/utilisateurs/parcs-accessibles').subscribe({
      next: (parcs) => {
        this.parcsAccessibles = parcs;
        console.log("✅ Parcs accessibles via API :", parcs);
      },
      error: (err) => {
        console.error("❌ Erreur API parcs accessibles :", err);
      }
    });
  }
  
  isReceptionPossible(): boolean {
    console.log("🛠️ Vérification du bouton Réceptionner...");
    console.log("📌 Véhicules sélectionnés :", this.selection.selected);
  
    if (this.selection.selected.length === 1 && this.selection.selected[0]?.statut === 'TRANSFERT') {
      console.log("✅ Bouton actif : Le véhicule est bien en transit !");
      return true;
    } else {
      console.log("❌ Bouton désactivé : Le véhicule n'est PAS en transit !");
      return false;
    }
  }
  /**
 * ✅ Vérifie si toutes les lignes sont sélectionnées
 */
  isAllSelected(): boolean {
    return this.selection.selected.length === this.vehicules.length;
  }
  /** ✅ Vérifie si le bouton "Transférer" doit être désactivé */
  isTransfertDisabled(): boolean {
    return this.selection.selected.length === 0 || 
           this.selection.selected.some(v => v.statut !== 'EN_ETAT');
  }
  
  toggleAllRows() {
    if (this.isAllSelected()) {
       this.selection.clear();
    } else {
      this.vehicules.forEach(v => this.selection.select(v));
    }
  }
/**
 * ✅ Met à jour la liste des véhicules sélectionnés
 */
mettreAJourVehiculesSelectionnes() {
  this.vehiculesSelectionnes = this.selection.selected;
}

chargerVehicules() {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn("⚠️ Aucun token trouvé, impossible de charger les véhicules !");
    return;
  }

  const mappingParcNom: Record<number, string> = {
    1: 'MEGRINE',
    2: 'CHARGUIA',
    4: 'AUPORT'
  };

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  const apiUrl = `http://localhost:8080/api/vehicules`;

  this.http.get<Vehicule[]>(apiUrl, { headers }).subscribe({
    next: (data) => {
      console.log("📡 Véhicules reçus :", JSON.stringify(data, null, 2));

      this.vehicules = data.map(v => ({
        ...v,
        parcNom: mappingParcNom[v.parcId] || 'Parc Inconnu',
        productionDate: v.productionDate ? new Date(v.productionDate) : null,
        shortColor: v.shortColor || 'Non défini',
        shortDescription: v.shortDescription || 'Non défini',
      }));

      // ✅ Extraire toutes les marques présentes dans les véhicules
      this.marquesDisponibles = [...new Set(this.vehicules.map(v => v.shortDescription))];

      // ✅ Sélectionne par défaut les marques accessibles si rien n’est sélectionné
      if (this.selectedMarques.length === 0 && this.marquesAccessibles.length > 0) {
        this.selectedMarques = [...this.marquesAccessibles];
      }

      // ✅ Appliquer les filtres
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }

      this.filtrerVehicules();
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error("❌ Erreur lors du chargement des véhicules :", err);
    }
  });
}



obtenirParcAssocie(): string | null {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log("🔍 Payload du token :", payload);
      return payload.parcNom || null; // ✅ Retourne null si non défini
    } catch (error) {
      console.error("❌ Erreur lors du décodage du token :", error);
    }
  }
  return null;
}


getParcId() {
  const parcNom = this.obtenirParcAssocie();
  console.log("🔍 Parc détecté depuis le token :", parcNom);

  const mappingParcId: { [key: string]: number } = {
    'MEGRINE': 1,
    'AUPORT': 4
  };

  if (parcNom && mappingParcId[parcNom]) {
    this.parcId = mappingParcId[parcNom];
    console.log("✅ Parc ID attribué dynamiquement :", this.parcId);
  } else {
    console.warn("⚠️ Parc non trouvé dans le mapping !");
    this.parcId = null; // ✅ On met `null` au lieu de `undefined`
  }

  if (this.parcId === null) {
    console.error("🚨 ERREUR: Aucun `parcId` valide trouvé !");
  }
}




filtrerVehicules() {
  const searchLower = this.searchQuery?.trim().toLowerCase();

  this.vehiculesFiltres = this.vehicules.filter(vehicule => {
    const isAccessible = this.marquesAccessibles.length === 0 || this.marquesAccessibles.includes(vehicule.shortDescription);
    if (!isAccessible) return false;

    const matchParc = this.selectedParcs.length === 0 || this.selectedParcs.includes(vehicule.parcNom);
    const matchStatut = this.selectedStatut === 'all' || vehicule.statut?.toUpperCase() === this.selectedStatut.toUpperCase();
    const matchMarque = this.selectedMarques.length === 0 || this.selectedMarques.includes(vehicule.shortDescription);

    let matchSearch = true;
    if (searchLower) {
      const matchChassis = vehicule.numeroChassis?.toLowerCase().includes(searchLower);
      const matchModele = vehicule.modele?.toLowerCase().includes(searchLower);
      const matchCouleur = vehicule.shortColor?.toLowerCase().includes(searchLower);
      const matchDate = vehicule.productionDate instanceof Date && !isNaN(vehicule.productionDate)
        ? new Intl.DateTimeFormat('fr-FR').format(vehicule.productionDate).toLowerCase().includes(searchLower)
        : false;
      const matchShortDesc = vehicule.shortDescription?.toLowerCase().includes(searchLower);

      matchSearch = matchChassis || matchModele || matchCouleur || matchShortDesc || matchDate;
    }

    return matchParc && matchStatut && matchMarque && matchSearch;
  });

  this.dataSource.data = this.vehiculesFiltres;
  if (this.paginator) this.paginator.firstPage();
}


toggleParcSelection(parc: string) {
  if (this.selectedParcs.includes(parc)) {
    this.selectedParcs = this.selectedParcs.filter(p => p !== parc);
  } else {
    this.selectedParcs.push(parc);
  }
  this.filtrerVehicules();
}
  supprimerVehicule(id: number) {
    if (!id) {
        console.error('❌ Erreur : ID du véhicule manquant pour la suppression');
        return;
    }

    console.log('📡 Envoi de la requête DELETE pour ID :', id);

    this.http.delete(`http://localhost:8080/api/vehicules/${id}`).subscribe({
        next: () => {
            console.log('✅ Véhicule supprimé avec succès !');
            this.chargerVehicules();
        },
        error: (err) => {
            console.error('❌ Erreur lors de la suppression du véhicule :', err);
        },
    });
}
ouvrirPopup(vehicule: any) {
  const dialogRef = this.dialog.open(PopupVehiculeComponent, {
    width: '500px',
    data: {
      vehicule,
      isReadonly: true // ✅ mode lecture seule
    }
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (!result) return;

    if (result.action === 'update') {
      this.updateVehicule(result.data, result.deletedPhotoIds || [], result.newPhotos || []);
    } else if (result.action === 'delete') {
      this.supprimerVehicule(result.data.id);
    }
  });
}


  deleteVehicule(id: number) {
    this.http.delete(`http://localhost:8080/api/vehicules/${id}`).subscribe(() => {
      this.chargerVehicules();
    });
  }

  updateVehicule(vehicule: any, deletedPhotoIds: number[], newPhotos: File[]) {
    if (!vehicule.id) {
        console.error('❌ Erreur : ID du véhicule manquant');
        return;
    }

    const formData = new FormData();

    formData.append('vehicule', JSON.stringify({
        id: vehicule.id,
        modele: vehicule.modele,
        numeroChassis: vehicule.numeroChassis,
        couleur: vehicule.couleur,
        dateArrivee: vehicule.dateArrivee,
        provenance: vehicule.provenance
    }));

    if (vehicule.avaries && vehicule.avaries.length > 0) {
        formData.append('avaries', JSON.stringify(vehicule.avaries.map((avarie: any) => ({
            id: avarie.id || null,
            type: avarie.type,
            commentaire: avarie.commentaire
        }))));  
    }

    if (deletedPhotoIds.length > 0) {
        formData.append('deletedPhotoIds', JSON.stringify(deletedPhotoIds));
    }

    newPhotos.forEach((photo, index) => {
        formData.append(`photos`, photo);  // ✅ Correction ici : pas besoin d'index
    });

    const headers = new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    console.log('📡 Envoi de la requête PUT pour la modif :', vehicule.id);

    this.http.put(`http://localhost:8080/api/vehicules/${vehicule.id}`, formData, { headers }).subscribe({
        next: () => {
            console.log('✅ Véhicule mis à jour avec succès !');
            this.chargerVehicules();
        },
        error: (err) => {
            console.error('❌ Erreur lors de la mise à jour du véhicule :', err);
        },
    });
}

receptionnerTransfert(vehiculeId: number) {
  console.log("🚚 Tentative de réception du véhicule ID :", vehiculeId);

  if (!vehiculeId) {
    console.warn("⚠️ Aucun véhicule sélectionné !");
    return;
  }

  this.http.put<{ message: string }>(`http://localhost:8080/api/transferts/receptionner/${vehiculeId}`, {}).subscribe({
    next: (response) => {
      console.log("✅ Réponse API :", response);

      // ✅ Met à jour le statut et le parc du véhicule
      let vehicule = this.vehicules.find(v => v.id === vehiculeId);
      if (vehicule) {
        vehicule.statut = 'EN';
        vehicule.parc = { id: 2, nom: 'Parc 2' };
      }

      this.filtrerVehicules(); // ✅ Rafraîchit l'affichage immédiatement
      setTimeout(() => { this.chargerVehicules(); }, 500); // ✅ Recharge après un court délai
    },
    error: (err) => {
      console.error('❌ Erreur lors de la réception du véhicule :', err);
    }
  });
}

initierTransfert() {
  if (this.selection.selected.length === 0) {
    console.warn("⚠️ Aucun véhicule sélectionné pour le transfert !");
    return;
  }

  const vehiculeIds = this.selection.selected.map(v => v.id);
  this.http.post<{ message: string }>('http://localhost:8080/api/transferts/initier', {
    vehiculeIds,
    parcDestinationId: 2
  }).subscribe(response => {
    console.log("✅ Transfert initié avec succès !");

    // ✅ Met à jour les statuts en EN_TRANSIT dans le frontend
    this.selection.selected.forEach(v => v.statut = 'TRANSFERT');

    this.selection.clear();
    this.filtrerVehicules(); // ✅ Réapplique le filtre immédiatement
    setTimeout(() => { this.chargerVehicules(); }, 500); // ✅ Recharge la liste après l’API
  });
}

mettreAJourPreparation(preparation: any) {
  const payload = {
    vehiculeId: preparation.id,
    nettoyageEffectue: preparation.nettoyage,  // ✅ Correction : Accès direct aux valeurs du formulaire
    inspectionEffectuee: preparation.inspection,
    remarques: preparation.remarques
  };

  this.http.post('http://localhost:8080/api/vehicules/preparation', payload).subscribe({
    next: () => {
      console.log('✅ Préparation mise à jour avec succès !');
      this.chargerVehicules(); // ✅ Recharge la liste après mise à jour
    },
    error: (err) => {
      console.error('❌ Erreur lors de la mise à jour de la préparation :', err);
    }
  });
}
}
