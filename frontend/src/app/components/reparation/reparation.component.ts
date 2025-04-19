import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { PopupAvarieComponent } from '../popup-avarie/popup-avarie.component';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatOption, MatSelect, MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-reparation',
  templateUrl: './reparation.component.html',
  styleUrls: ['./reparation.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatPaginatorModule,
    MatOptionModule,
    MatSelectModule

  ],
})
export class ReparationComponent implements OnInit {
  vehiculesAvaries: any[] = [];
  displayedColumns: string[] = ['numeroChassis','marque', 'modele', 'couleur', 'parcNom', 'statutAvaries', 'actions'];
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  recherche: string = '';
  vehiculesAvariesFiltres: any[] = [];
  vehiculesFiltres: any[] = [];
  filtreStatut: 'TOUS' | 'EN_COURS' | 'CLOTURE' = 'TOUS';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<any>([]);

  getStatutPrincipal(vehicule: any): string {
    const avaries = vehicule.avaries || [];
    if (avaries.length === 0) return 'Aucune';
    if (avaries.some((a: any) => a.statut === 'EN_COURS')) return 'EN_COURS';
    return 'CLOTURE';
  }
  filtrerVehicules() {
    const query = this.recherche.toLowerCase().trim();
  
    this.vehiculesFiltres = this.vehiculesAvaries.filter(v => {
      const matchTexte =
        v.numeroChassis?.toLowerCase().includes(query) ||
        v.shortDescription?.toLowerCase().includes(query) ||
        v.modele?.toLowerCase().includes(query);
  
      const matchStatut =
        this.filtreStatut === 'TOUS' || v.avaries?.some((a: any) => a.statut === this.filtreStatut);
  
      return matchTexte && matchStatut;
    });
  
    this.dataSource.data = this.vehiculesFiltres;
  }
  ngOnInit() {
  
    this.chargerVehiculesAvaries();
    console.log("📦 Véhicules chargés :", this.vehiculesAvaries);

  
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  /** 🔄 Charger tous les véhicules en statut AVARIE */
  chargerVehiculesAvaries() {
    const token = localStorage.getItem('token');
    if (!token) {
    console.error("🚨 Aucun token trouvé !");
  } else {
  console.log("📌 Token envoyé :", token);
}
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    this.http.get<any[]>('http://localhost:8080/api/vehicules/avec-avaries', { headers }).subscribe({
      next: (data) => {
        this.vehiculesAvaries = data;
        this.dataSource.data = data; 
        this.vehiculesFiltres = [...data];
        console.log("📦 Véhicules chargés :", data);
      },
      error: () => {
        this.snackBar.open('❌ Erreur lors du chargement des véhicules avariés', 'Fermer', { duration: 3000 });
      },
    });
    this.vehiculesAvariesFiltres = [...this.vehiculesAvaries];

  }

  /** ✅ Ouvrir une pop-up pour modifier l'avarie */
  ouvrirPopupModification(vehicule: any) {
    const dialogRef = this.dialog.open(PopupAvarieComponent, {
      width: '500px',
      data: { vehicule }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.action === 'reparer') {
        const vehicule = result.vehicule;
    
        this.vehiculesAvaries = this.vehiculesAvaries.map(v =>
          v.numeroChassis === vehicule.numeroChassis
            ? { ...v, avaries: v.avaries.map((a: { statut: string }) => ({ ...a, statut: 'CLOTURE' })) }
            : v
        );
    
        // Re-filtrer pour forcer l'affichage
        this.filtrerVehicules();
      }
    });
  }

  

  /** ✅ Réparer un véhicule : Changer son statut en STOCK */
  reparerVehicule(numeroChassis: string) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
  
    this.http.patch(`http://localhost:8080/api/vehicules/${numeroChassis}/reparer`, {}, { headers }).subscribe({
      next: () => {
        this.snackBar.open('✅ Véhicule réparé et remis en stock !', 'Fermer', { duration: 3000 });
  
        // ✅ Supprime le véhicule réparé de la liste des avariés
        this.vehiculesAvaries = this.vehiculesAvaries.filter(v => v.numeroChassis !== numeroChassis);
      },
      error: () => {
        this.snackBar.open('❌ Erreur lors de la réparation', 'Fermer', { duration: 3000 });
      },
    });
  }
}
function ngAfterViewInit() {
  throw new Error('Function not implemented.');
}

