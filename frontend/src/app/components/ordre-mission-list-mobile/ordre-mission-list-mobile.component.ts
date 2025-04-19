import { Component, OnInit, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { OrdreMissionDetailsDialogComponent } from '../ordre-mission-details-dialog/ordre-mission-details-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-ordre-mission-list-mobile',
  templateUrl: './ordre-mission-list-mobile.component.html',
  styleUrls: ['./ordre-mission-list-mobile.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatInputModule,
    MatChipsModule,
    MatDialogModule,
    MatIconModule
  ]
})
export class OrdreMissionListMobileComponent implements OnInit {
  ordresMission: any[] = [];
  ordresMissionFiltres: any[] = [];
  recherche: string = '';
  statutFiltre: string = '';

  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);

  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    this.chargerOrdresMission();
  }

  /** 🔄 Charger la liste des ordres de mission */
  chargerOrdresMission() {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    this.http.get<any[]>('http://localhost:8080/api/ordres-mission', { headers }).subscribe({
      next: (data) => {
        this.ordresMission = data.map(ordre => ({
          ...ordre,
          dateCreation: new Date(ordre.dateCreation),
          pdfUrl: `http://localhost:8080/api/ordres-mission/${ordre.id}/pdf`  // ✅ URL complète ici
        }));
        this.ordresMissionFiltres = [...this.ordresMission];
      },
      error: () => {
        this.snackBar.open('❌ Erreur lors du chargement des ordres de mission', 'Fermer', { duration: 3000 });
      },
    });
  }
  annulerOrdreMission(ordreId: number) {
    if (!confirm('⚠️ Confirmer l\'annulation de cet ordre de mission ?')) return;
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
  
    this.http.put(`http://localhost:8080/api/ordres-mission/annuler/${ordreId}`, {}, { headers }).subscribe({
      next: () => {
        this.snackBar.open('✅ Ordre de mission annulé avec succès', 'Fermer', { duration: 3000 });
        this.chargerOrdresMission(); // Recharge la liste
      },
      error: () => {
        this.snackBar.open('❌ Échec de l\'annulation de l\'ordre', 'Fermer', { duration: 3000 });
      }
    });
  }
  /** 🔎 Filtrer la liste */
  filtrerOrdres() {
    if (this.statutFiltre) {
      this.ordresMissionFiltres = this.ordresMission
        .filter(ordre => ordre.statut === this.statutFiltre)
        .sort(this.ordreStatutSort);
    } else {
      // Par défaut, on exclut les statuts CLOTURE et ANNULE
      this.ordresMissionFiltres = this.ordresMission
        .filter(ordre => ordre.statut !== 'CLOTURE' && ordre.statut !== 'ANNULE')
        .sort(this.ordreStatutSort);
    }

    if (this.recherche.trim()) {
      const rechercheLower = this.recherche.toLowerCase();
      this.ordresMissionFiltres = this.ordresMissionFiltres.filter(ordre =>
        ordre.numeroOrdre.toLowerCase().includes(rechercheLower)
      );
    }
  }

  /** 🔄 Tri personnalisé : EN_COURS > PARTIEL > CLOTURE */
  ordreStatutSort(a: { statut: string }, b: { statut: string }): number {
    const priorité: Record<string, number> = {
      EN_COURS: 1,
      PARTIEL: 2,
      CLOTURE: 3,
      ANNULE: 4
    };
    return priorité[a.statut] - priorité[b.statut];
  }
  

  /** 📄 Télécharger le PDF de l’ordre */
  telechargerOrdreMission(pdfUrl: string, numeroOrdre: string) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    this.http.get(pdfUrl, { headers, responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${numeroOrdre}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.snackBar.open('❌ Erreur lors du téléchargement du document', 'Fermer', { duration: 3000 });
      }
    });
  }

  /** 📄 Détails dans popup */
  ouvrirDialogDetails(ordre: any) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    this.http.get<any[]>(`http://localhost:8080/api/ordres-mission/${ordre.numeroOrdre}/vehicules`, { headers }).subscribe({
      next: (vehicules) => {
        this.dialog.open(OrdreMissionDetailsDialogComponent, {
          width: '400px',
          data: {
            ...ordre,
            vehicules
          }
        });
      },
      error: () => {
        this.snackBar.open('❌ Erreur lors du chargement des véhicules', 'Fermer', { duration: 3000 });
      }
    });
  }
}
