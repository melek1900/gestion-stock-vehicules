import { Component, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PopupAvarieComponent } from '../popup-avarie/popup-avarie.component';
@Component({
  selector: 'app-reparation-mobile',
  imports: [ CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule],
  templateUrl: './reparation-mobile.component.html',
  styleUrl: './reparation-mobile.component.scss'
})
export class ReparationMobileComponent {
  vehiculesAvaries: any[] = [];
  recherche: string = '';
  vehiculesFiltres: any[] = [];

  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    this.chargerVehiculesAvaries();
  }

  chargerVehiculesAvaries() {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });

    this.http.get<any[]>('http://localhost:8080/api/vehicules/by-statut?statut=AVARIE', { headers }).subscribe({
      next: (data) => {
        this.vehiculesAvaries = data;
        this.vehiculesFiltres = [...data];
      },
      error: () => {
        this.snackBar.open('❌ Erreur lors du chargement des véhicules avariés', 'Fermer', { duration: 3000 });
      }
    });
  }

  filtrerVehicules() {
    const query = this.recherche.toLowerCase().trim();
    this.vehiculesFiltres = this.vehiculesAvaries.filter(v =>
      v.numeroChassis?.toLowerCase().includes(query) ||
      v.shortDescription?.toLowerCase().includes(query) ||
      v.modele?.toLowerCase().includes(query)
    );
  }

  ouvrirPopupModification(vehicule: any) {
    const dialogRef = this.dialog.open(PopupAvarieComponent, {
      width: '95%',
      data: { vehicule }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'reparer') {
        this.vehiculesAvaries = this.vehiculesAvaries.filter(v => v.numeroChassis !== vehicule.numeroChassis);
        this.vehiculesFiltres = [...this.vehiculesAvaries];
      }
    });
  }
}
