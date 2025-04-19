import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { VehiculeTransportDialogComponent } from '../vehicule-transport-dialog/vehicule-transport-dialog.component';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-veicule-transport',
  imports: [ MatCardModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatDividerModule],
  templateUrl: './veicule-transport.component.html',
  styleUrl: './veicule-transport.component.scss'
})
export class VeiculeTransportComponent {
  vehicules: any[] = [];
  displayedColumns: string[] = ['matricule', 'capacite', 'type', 'statut', 'actions'];
  dataSource = new MatTableDataSource<any>();

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadVehicules();
  }

  loadVehicules() {
    this.http.get<any[]>('http://localhost:8080/api/vehicules-transport').subscribe({
      next: (data) => {
        this.vehicules = data;
        this.dataSource.data = data;
      },
      error: () => {
        this.snackBar.open('Erreur chargement véhicules', 'Fermer', { duration: 3000 });
      }
    });
  }

  openAddDialog() {
    const dialogRef = this.dialog.open(VehiculeTransportDialogComponent, {
      width: '500px',
      data: { mode: 'add' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.post('http://localhost:8080/api/vehicules-transport', result).subscribe({
          next: () => {
            this.snackBar.open('✅ Véhicule ajouté', 'Fermer', { duration: 3000 });
            this.loadVehicules();
          },
          error: () => this.snackBar.open('❌ Erreur ajout', 'Fermer', { duration: 3000 })
        });
      }
    });
  }

  editVehicule(vehicule: any) {
    const dialogRef = this.dialog.open(VehiculeTransportDialogComponent, {
      width: '500px',
      data: { mode: 'edit', vehicule }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.put(`http://localhost:8080/api/vehicules-transport/${vehicule.id}`, result).subscribe({
          next: () => {
            this.snackBar.open('✅ Véhicule modifié', 'Fermer', { duration: 3000 });
            this.loadVehicules();
          },
          error: () => this.snackBar.open('❌ Erreur modification', 'Fermer', { duration: 3000 })
        });
      }
    });
  }

  viewVehicule(vehicule: any) {
    this.dialog.open(VehiculeTransportDialogComponent, {
      width: '500px',
      data: { mode: 'view', vehicule }
    });
  }

  deleteVehicule(id: number) {
    if (confirm('Voulez-vous vraiment supprimer ce véhicule ?')) {
      this.http.delete(`http://localhost:8080/api/vehicules-transport/${id}`).subscribe({
        
        
        next: () => {
          this.snackBar.open('🗑️ Véhicule supprimé', 'Fermer', { duration: 3000 });
          this.loadVehicules();
        },
        error: () => this.snackBar.open('❌ Erreur suppression: vehicule en mission', 'Fermer', { duration: 3000 })
      });
    }
  }
}
