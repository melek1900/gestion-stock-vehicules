import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { ChauffeurDialogComponent } from '../chauffeur-dialog/chauffeur-dialog.component';

@Component({
  selector: 'app-chauffeur',
  imports: [ CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatDividerModule ],
  templateUrl: './chauffeur.component.html',
  styleUrl: './chauffeur.component.scss'
})
export class ChauffeurComponent {
  chauffeurs: any[] = [];
  displayedColumns: string[] = ['nom', 'prenom', 'cin', 'telephone', 'statut', 'actions'];
  dataSource = new MatTableDataSource<any>();

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadChauffeurs();
  }

  loadChauffeurs() {
    this.http.get<any[]>('http://192.168.1.121:8080/api/chauffeurs').subscribe({
      next: (data) => {
        this.chauffeurs = data;
        this.dataSource.data = data;
      },
      error: () => {
        this.snackBar.open('Erreur chargement chauffeurs', 'Fermer', { duration: 3000 });
      }
    });
  }

  openAddDialog() {
    const dialogRef = this.dialog.open(ChauffeurDialogComponent, {
      width: '500px',
      data: { mode: 'add' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.post('http://192.168.1.121:8080/api/chauffeurs', result).subscribe({
          next: () => {
            this.snackBar.open('✅ Chauffeur ajouté', 'Fermer', { duration: 3000 });
            this.loadChauffeurs();
          },
          error: () => this.snackBar.open('❌ Erreur ajout', 'Fermer', { duration: 3000 })
        });
      }
    });
  }

  editChauffeur(chauffeur: any) {
    const dialogRef = this.dialog.open(ChauffeurDialogComponent, {
      width: '500px',
      data: {
        mode: 'edit',
        chauffeur: {
          ...chauffeur,
          statut: chauffeur.disponible ? 'Disponible' : 'Non disponible' // 👈 On transforme pour affichage
        }
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // 👇 On reconvertit le statut string en boolean
        const updatedChauffeur = {
          ...result,
          disponible: result.statut === 'Disponible'
        };
        delete updatedChauffeur.statut; // 👈 On supprime le champ inutile pour l'API
  
        this.http.put(`http://192.168.1.121:8080/api/chauffeurs/${chauffeur.id}`, updatedChauffeur).subscribe({
          next: () => {
            this.snackBar.open('✅ Chauffeur modifié', 'Fermer', { duration: 3000 });
            this.loadChauffeurs();
          },
          error: () => this.snackBar.open('❌ Erreur modification', 'Fermer', { duration: 3000 })
        });
      }
    });
  }

  viewChauffeur(chauffeur: any) {
    this.dialog.open(ChauffeurDialogComponent, {
      width: '500px',
      data: { mode: 'view', chauffeur }
    });
  }

  deleteChauffeur(id: number) {
    if (confirm('Voulez-vous vraiment supprimer ce chauffeur ?')) {
      this.http.delete(`http://192.168.1.121:8080/api/chauffeurs/${id}`).subscribe({
        next: () => {
          this.snackBar.open('🗑️ Chauffeur supprimé', 'Fermer', { duration: 3000 });
          this.loadChauffeurs();
        },
        error: () => this.snackBar.open('❌ Erreur suppression: chauffeur en mission', 'Fermer', { duration: 3000 })
      });
    }
  }
}
