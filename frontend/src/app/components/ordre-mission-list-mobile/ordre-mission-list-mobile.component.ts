import { Component, OnInit, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule, NgFor, NgIf } from '@angular/common';
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
import { MatIcon, MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-ordre-mission-list-mobile',
  templateUrl: './ordre-mission-list-mobile.component.html',
  styleUrls: ['./ordre-mission-list-mobile.component.scss'],
  standalone: true,
  imports: [CommonModule,
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
  ouvrirDialogDetails(ordre: any) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
  
    this.http.get<any[]>(`http://172.20.10.8:8080/api/ordres-mission/${ordre.numeroOrdre}/vehicules`, { headers }).subscribe({
      next: (vehicules) => {
        // 🧠 Injecter les véhicules récupérés dans la popup
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
  /** 🔄 Charger la liste des ordres de mission */
  chargerOrdresMission() {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    this.http.get<any[]>('http://172.20.10.8:8080/api/ordres-mission', { headers }).subscribe({
      next: (data) => {
        this.ordresMission = data.map(ordre => ({
          ...ordre,
          dateCreation: new Date(ordre.dateCreation)
        }));
        this.ordresMissionFiltres = [...this.ordresMission];
      },
      error: () => {
        this.snackBar.open('❌ Erreur lors du chargement des ordres de mission', 'Fermer', { duration: 3000 });
      },
    });
  }

  /** 🔎 Filtrer la liste */
  filtrerOrdres() {
    this.ordresMissionFiltres = this.ordresMission.filter(ordre => {
      const statutMatch = this.statutFiltre ? ordre.statut === this.statutFiltre : true;
      const rechercheMatch = this.recherche.trim() ? ordre.numeroOrdre.toLowerCase().includes(this.recherche.toLowerCase()) : true;
      return statutMatch && rechercheMatch;
    });
  }

  /** ✅ Télécharger ou afficher l’ordre de mission */
  afficherOrdreMission(pdfUrl: string) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
  
    this.http.get(pdfUrl, { headers, responseType: 'blob' }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ordre_mission.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, error => {
      this.snackBar.open('❌ Erreur lors du téléchargement du document', 'Fermer', { duration: 3000 });
    });
  }
}
