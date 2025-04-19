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
    'parcNom',
    'statut',
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
  parcsPourFiltre: any[] = [];
  searchQuery: string = '';
  searchChassis = '';
  searchColor = '';
  searchBrand = '';
  parcMapping: Record<number, string> = {};
  constructor(private cdr: ChangeDetectorRef, private router: Router, private route: ActivatedRoute, private authService: AuthService) {}


  vehiculesSelectionnes: any[] = []; 

  async ngOnInit(): Promise<void> {

    this.recupererRoleUtilisateur();
    await this.chargerParcIdDynamiqueDepuisToken();
    this.chargerParcsAccessibles();
    this.chargerMappingParcs();
  
    if (this.selectedMarques.length === 0 && this.marquesAccessibles.length > 0) {
      this.selectedMarques = [...this.marquesAccessibles];
    }
  
    this.dataSource = new MatTableDataSource(this.vehicules);
  
    setTimeout(() => {
      this.chargerVehicules();
      const parcNom = this.obtenirParcAssocie();
  
      if (!this.selectedParcs.includes('TRANSFERT')) {
        this.selectedParcs.push('TRANSFERT');
      }
  
      if (this.selectedParcs.length === 0 && parcNom) {
        this.selectedParcs = [parcNom];
      }
  
      this.filtrerVehicules();
    }, 300);
  }
  
   
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  chargerMappingParcs() {
    this.http.get<any[]>('http://localhost:8080/api/parcs').subscribe({
      next: (parcs) => {
        parcs.forEach(parc => {
          this.parcMapping[parc.id] = parc.nom;
        });
        console.log("✅ Mapping dynamique des parcs :", this.parcMapping);
  
        // Recharger les véhicules après avoir le mapping
        this.chargerVehicules();
      },
      error: (err) => {
        console.error("❌ Erreur lors du chargement des parcs :", err);
      }
    });
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
  
      this.marquesAccessibles = (payload.marquesAccessibles || []).map((m: string) => m.trim().toUpperCase());
  
      if (this.userRole === 'ROLE_GESTIONNAIRE_APPLICATION') {
        this.isOrdreMission = true;
      }
  
      if (parcUtilisateur) {
        this.selectedParcs = [parcUtilisateur];
      }
  
      // ✅ Parcs accessibles normaux → pour filtrage logique
      if (Array.isArray(payload.parcsAcces)) {
        this.parcsAccessibles = payload.parcsAcces.map((nom: string) => ({ nom }));
      }
  
      // ✅ On crée un tableau séparé pour l'affichage du filtre
      this.parcsPourFiltre = [...this.parcsAccessibles];
  
      // ✅ Ajout du parc TRANSFERT uniquement pour le filtre visuel
      const transfertPresent = this.parcsPourFiltre.some(parc => parc.nom === 'TRANSFERT');
      if (!transfertPresent) {
        this.parcsPourFiltre.push({ nom: 'TRANSFERT' });
      }
    }
  }
  ouvrirPopupLivraison(vehicule: any) {
    console.log("📌 Livraison du véhicule :", vehicule);
    this.ouvrirPopup(vehicule);
  }
  
  ouvrirPopupVente(vehicule: any) {
    console.log("📌 Vente du véhicule :", vehicule);
    this.ouvrirPopup(vehicule); 
  }
  
  ouvrirPopupReservation(vehicule: any) {
    console.log("📌 Réservation du véhicule :", vehicule);
    this.ouvrirPopup(vehicule);
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

async chargerVehicules() {
  const token = localStorage.getItem('token');
  if (!token) return;

  const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

  console.log("📌 Parcs sélectionnés :", this.selectedParcs);
  console.log("📌 Marques accessibles :", this.marquesAccessibles);

  const vehiculesAutorisés = await this.http
    .get<Vehicule[]>('http://localhost:8080/api/vehicules', { headers })
    .toPromise();

  console.log("✅ Véhicules autorisés récupérés :", vehiculesAutorisés?.length);

  let vehiculesTransfert: Vehicule[] = [];
  if (this.selectedParcs.includes('TRANSFERT')) {
    try {
      const data = await this.http
        .get<Vehicule[]>('http://localhost:8080/api/vehicules/parc/transfert', { headers })
        .toPromise();

      vehiculesTransfert = data || [];
      console.log("📦 Véhicules TRANSFERT récupérés :", vehiculesTransfert.length);
    } catch (error) {
      console.error("❌ Erreur chargement véhicules TRANSFERT :", error);
    }
  }

  const allVehicules = [...(vehiculesAutorisés || []), ...vehiculesTransfert];

  const vehiculesAvecUtilisation = await Promise.all(
    allVehicules.map(async (v) => {
      const enUtilisation = await this.http.get<boolean>(
        `http://localhost:8080/api/ordres-mission/vehicule/${v.id}/en-utilisation`,
        { headers }
      ).toPromise().catch(() => false);

      return {
        ...v,
        parcNom: this.parcMapping[v.parcId] || 'Parc Inconnu',
        productionDate: v.productionDate ? new Date(v.productionDate) : null,
        shortColor: v.shortColor || 'Non défini',
        shortDescription: (v.shortDescription || 'Non défini').toUpperCase(),
        enUtilisation
      };
    })
  );

  this.vehicules = vehiculesAvecUtilisation;
  this.marquesDisponibles = [...new Set(this.vehicules.map(v => v.shortDescription))];

  this.filtrerVehicules(); // 🧠 Mise à jour avec les nouveaux véhicules filtrés
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

async chargerParcIdDynamiqueDepuisToken(): Promise<void> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error("🚨 Token non trouvé");

  const decoded = JSON.parse(atob(token.split('.')[1]));
  const parcNom = decoded?.parcNom;

  if (!parcNom) throw new Error("🚨 Aucun nom de parc trouvé dans le token");

 const parcs = await this.http.get<any[]>('http://localhost:8080/api/parcs').toPromise();

if (!parcs || !Array.isArray(parcs)) {
  throw new Error("🚨 Erreur : liste des parcs non disponible ou mal formée.");
}

const parc = parcs.find(p => p.nom?.toUpperCase() === parcNom.toUpperCase());

if (!parc) {
  throw new Error(`🚨 Parc inconnu : ${parcNom}`);
}

this.parcId = parc.id;
console.log("✅ Parc ID attribué dynamiquement :", this.parcId);
}

filtrerVehicules() {
  const searchLower = this.searchQuery?.trim().toLowerCase();

  this.vehiculesFiltres = this.vehicules.filter(vehicule => {
    const parcNom = vehicule.parcNom;
    const isParcSelected = this.selectedParcs.length === 0 || this.selectedParcs.includes(parcNom);
    const isParcAccessible = parcNom === 'TRANSFERT' || this.parcsAccessibles.some(p => p.nom === parcNom);
    if (!isParcSelected || !isParcAccessible) return false;

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

    return matchStatut && matchMarque && matchSearch;
  });

  // ✅ Mise à jour de la dataSource avec pagination
  this.dataSource = new MatTableDataSource(this.vehiculesFiltres);
  this.dataSource.paginator = this.paginator;
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
      isReadonly: true //mode lecture seule
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


}
