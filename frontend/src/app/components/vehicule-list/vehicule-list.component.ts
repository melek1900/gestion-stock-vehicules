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
    'productionDate',
    'numeroChassis',
    'shortDescription',
    'modele',
    'shortColor',
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

  selectedParcs: string[] = [];
  parcsAccessibles: any[] = [];
  searchQuery: string = '';
  searchChassis = '';
  searchColor = '';
  searchBrand = '';
  constructor(private cdr: ChangeDetectorRef, private router: Router, private route: ActivatedRoute, private authService: AuthService) {}


  vehiculesSelectionnes: any[] = []; // Stocke les véhicules sélectionnés
  ngOnInit(): void {
    this.recupererRoleUtilisateur();
  this.getParcId();
  this.chargerParcsAccessibles();
  setTimeout(() => {
    this.chargerVehicules();
  }, 300);
  if (this.selectedParcs.length === 0 && this.parcId) {
    this.selectedParcs = [this.parcsAccessibles.find(p => p === this.obtenirParcAssocie()) || ''];
  }
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  chargerParcsAccessibles() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn("⚠️ Aucun token trouvé, impossible de charger les parcs !");
      return;
    }
  
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log("🔍 Payload du token :", payload);
  
      if (payload.parcsAcces && payload.parcsAcces.length > 0) {
        this.parcsAccessibles = payload.parcsAcces; // ✅ Récupération depuis le token
        console.log("🌍 Parcs accessibles chargés depuis le token :", this.parcsAccessibles);
      } else {
        console.warn("⚠️ Aucun parc trouvé dans le token, récupération via API...");
        this.recupererParcsDepuisAPI(); // ✅ Si vide, on les récupère via API
      }
    } catch (error) {
      console.error("❌ Erreur lors du décodage du token :", error);
      this.recupererParcsDepuisAPI(); // ✅ Fallback pour récupérer les parcs via API
    }
  }
  
  // ✅ Fallback pour récupérer les parcs via une requête API
  recupererParcsDepuisAPI() {
    this.http.get<any[]>('http://172.20.10.8:8080/api/utilisateurs/parcs-accessibles')
      .subscribe({
        next: (parcs) => {
          this.parcsAccessibles = parcs.map(p => p.nom); // ✅ Stocke les noms des parcs
          console.log("✅ Parcs accessibles récupérés via API :", this.parcsAccessibles);
        },
        error: (err) => console.error("❌ Erreur lors de la récupération des parcs accessibles :", err)
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
  
      console.log('🔑 Rôle:', this.userRole);
      console.log('📍 Parc utilisateur:', parcUtilisateur);
  
      if (parcUtilisateur) {
        this.selectedParcs = [parcUtilisateur]; // ✅ Sélectionne automatiquement le parc de l'utilisateur
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
        this.parcsAccessibles = payload.parcsAcces || [];
        console.log("🌍 Parcs accessibles:", this.parcsAccessibles);
      } catch (error) {
        console.error("❌ Erreur lors du décodage du token:", error);
      }
    }
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

  const apiUrl = `http://172.20.10.8:8080/api/vehicules`;

  this.http.get<Vehicule[]>(apiUrl, { headers }).subscribe({
    next: (data) => {
      console.log("📡 Véhicules reçus :", JSON.stringify(data, null, 2)); // 🔍 Vérification détaillée

      this.vehicules = data.map(v => ({
        ...v,
        parcNom: mappingParcNom[v.parcId] || 'Parc Inconnu', // ✅ Utilisation de parcId seulement
        productionDate: v.productionDate ? new Date(v.productionDate).toISOString().split('T')[0] : '',
        shortColor: v.shortColor || 'Non défini',
        shortDescription: v.shortDescription || 'Non défini',
      }));

      // ✅ Vérifie la pagination après le chargement des véhicules
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }

      // ✅ Appliquer les filtres immédiatement après le chargement
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
  console.log(`📢 Filtrage appliqué : Parcs=${this.selectedParcs}, Statut=${this.selectedStatut}, Recherche=${this.searchQuery}`);

  this.vehiculesFiltres = this.vehicules.filter(vehicule => {
    const matchParc = this.selectedParcs.length === 0 || this.selectedParcs.includes(vehicule.parcNom);
    const matchStatut = this.selectedStatut === 'all' || vehicule.statut?.toUpperCase() === this.selectedStatut.toUpperCase();
    
    const matchSearch =
    
      !this.searchQuery || 
      vehicule.numeroChassis.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
      vehicule.shortColor.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      vehicule.shortDescription.toLowerCase().includes(this.searchQuery.toLowerCase());

    return matchParc && matchStatut && matchSearch;
  });

  console.log("📡 Véhicules après filtrage :", this.vehiculesFiltres);

  // ✅ Mise à jour de la source de données pour appliquer la pagination
  this.dataSource.data = this.vehiculesFiltres;

  // ✅ Réinitialise la pagination à la première page après filtrage
  if (this.paginator) {
    this.paginator.firstPage();
  }
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

    this.http.delete(`http://172.20.10.8:8080/api/vehicules/${id}`).subscribe({
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
  console.log('🛠️ Ouverture du popup avec les données :', vehicule);

  const dialogRef = this.dialog.open(PopupVehiculeComponent, {
      width: '500px',
      data: { vehicule },
  });

  dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      if (result.action === 'update') {
          console.log('✏️ Mise à jour demandée :', result.data);
          this.updateVehicule(result.data, result.deletedPhotoIds || [], result.newPhotos || []); 
      } else if (result.action === 'delete') {
          console.log('🗑️ Suppression demandée pour ID :', result.data.id);
          this.supprimerVehicule(result.data.id);
      }
  });
}

  deleteVehicule(id: number) {
    this.http.delete(`http://172.20.10.8:8080/api/vehicules/${id}`).subscribe(() => {
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

    this.http.put(`http://172.20.10.8:8080/api/vehicules/${vehicule.id}`, formData, { headers }).subscribe({
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

  this.http.put<{ message: string }>(`http://172.20.10.8:8080/api/transferts/receptionner/${vehiculeId}`, {}).subscribe({
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
  this.http.post<{ message: string }>('http://172.20.10.8:8080/api/transferts/initier', {
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

  this.http.post('http://172.20.10.8:8080/api/vehicules/preparation', payload).subscribe({
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
