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
import {jwtDecode} from 'jwt-decode';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

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
    MatPaginatorModule
  ],
})
export class ReparationComponent implements OnInit {
  vehiculesAvaries: any[] = [];
  displayedColumns: string[] = ['numeroChassis','marque', 'modele', 'couleur', 'parcNom', 'actions'];
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  recherche: string = '';
  vehiculesAvariesFiltres: any[] = [];
  vehiculesFiltres: any[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<any>([]);


  filtrerVehicules() {
    const query = this.recherche.toLowerCase().trim();
  
    if (!query) {
      this.vehiculesFiltres = [...this.vehiculesAvaries];
    } else {
      this.vehiculesFiltres = this.vehiculesAvaries.filter(v =>
        v.numeroChassis?.toLowerCase().includes(query) ||
        v.shortDescription?.toLowerCase().includes(query) ||
        v.modele?.toLowerCase().includes(query)
      );
    }
  }
  ngOnInit() {
  
    this.chargerVehiculesAvaries();
  
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

    this.http.get<any[]>('http://192.168.1.121:8080/api/vehicules/by-statut?statut=AVARIE', { headers }).subscribe({
      next: (data) => {
        this.vehiculesAvaries = data;
        this.dataSource.data = data; 
        this.vehiculesFiltres = [...data];
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
      if (result && result.action === 'reparer') {
        this.vehiculesAvaries = this.vehiculesAvaries.filter(v => v.numeroChassis !== vehicule.numeroChassis);
      }
    });
  }

  

  /** ✅ Réparer un véhicule : Changer son statut en STOCK */
  reparerVehicule(numeroChassis: string) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
  
    this.http.patch(`http://192.168.1.121:8080/api/vehicules/${numeroChassis}/reparer`, {}, { headers }).subscribe({
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

