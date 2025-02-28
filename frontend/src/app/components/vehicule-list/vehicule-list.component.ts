import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
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
import { PopupPreparationComponent } from '../popup-preparation/popup-preparation.component';
import { StatutVehicule } from '../../models/statut-vehicule.enum';
import { StatutTransfert } from '../../models/statut-transfert.enum';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

interface Avarie {
  id?: number;  // ✅ L'ID peut être absent si c'est une nouvelle avarie
  type: string;
  commentaire: string;
}

@Component({
  selector: 'app-vehicule-list',
  standalone: true,
  templateUrl: './vehicule-list.component.html',
  styleUrls: ['./vehicule-list.component.scss'],
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule, 
    FormsModule,
    MatButtonToggleModule
  ]
})

export class VehiculeListComponent implements OnInit {
  displayedColumns: string[] = ['select', 'modele', 'numeroChassis', 'couleur', 'dateArrivee', 'provenance', 'statut', 'actions'];

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
  constructor(private cdr: ChangeDetectorRef) {}

  vehiculesSelectionnes: any[] = []; // Stocke les véhicules sélectionnés
  ngOnInit(): void {
    this.recupererRoleUtilisateur();
    this.chargerVehicules();
  }

  recupererRoleUtilisateur() {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1])); 
      this.userRole = payload.role;
      console.log('🔑 Rôle de l’utilisateur connecté:', this.userRole); // ✅ Vérifie bien le rôle ici
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
  /** ✅ Vérifie si le bouton "Transférer au Parc 2" doit être désactivé */
  isTransfertDisabled(): boolean {
    return this.selection.selected.length === 0 || this.selection.selected.some(v => v.statut === 'TRANSFERT');
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
  this.http.get<any[]>('http://localhost:8080/api/vehicules').subscribe((data) => {
    console.log("📡 Véhicules reçus :", JSON.stringify(data, null, 2)); // ✅ Affichage détaillé
    this.vehicules = data;
    this.filtrerVehicules(); 
    this.cdr.detectChanges();
  });
}
filtrerVehicules() {
  console.log(`📢 Filtrage appliqué : Parc=${this.selectedParc}, Statut=${this.selectedStatut}`);

  this.vehiculesFiltres = this.vehicules.filter(vehicule => {
    let matchParc = false;

    if (this.selectedParc === 'all') {
      matchParc = true; // ✅ Afficher tous les véhicules
    } else if (this.selectedParc === 'transit') {
      matchParc = vehicule.statut === 'TRANSFERT'; // ✅ Afficher uniquement les véhicules en TRANSIT
    } else {
      matchParc = vehicule.parc?.id == this.selectedParc && vehicule.statut !== 'TRANSFERT'; 
    }

    const matchStatut = this.selectedStatut === 'all' || vehicule.statut === this.selectedStatut;

    return matchParc && matchStatut;
  });

  console.log("📡 Véhicules après filtrage :", this.vehiculesFiltres);
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
        vehicule.statut = 'EN_PREPARATION';
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
ouvrirPopupPreparation(vehicule: any) {
  const dialogRef = this.dialog.open(PopupPreparationComponent, {
    width: '500px',
    data: { vehicule }
  });

  dialogRef.afterClosed().subscribe((result: any) => { // ✅ Correction du type `any`
    if (!result) return;

    if (result.action === 'update') {
      console.log('🔧 Mise à jour de la préparation :', result.data);
      this.mettreAJourPreparation(result.data);
    }
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
