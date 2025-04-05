import { Component, OnInit, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-ordre-mission-list',
  templateUrl: './ordre-mission-list.component.html',
  styleUrls: ['./ordre-mission-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatInputModule
  ]
})
export class OrdreMissionListComponent implements OnInit {
  ordresMission: any[] = [];
  displayedColumns: string[] = ['numeroMission', 'date', 'chauffeur', 'vehicule', 'parcDepart', 'parcArrivee', 'statut'];
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  statutFiltre: string = '';  // ✅ Stocke le statut sélectionné
  ordresMissionFiltres: any[] = []; // ✅ Liste filtrée
  recherche: string = '';  // ✅ Stocke la valeur de la recherche
  filtrerOrdres() {
    const rechercheLower = this.recherche.trim().toLowerCase();
  
    this.ordresMissionFiltres = this.ordresMission.filter(ordre => {
      const statutMatch = this.statutFiltre ? ordre.statut === this.statutFiltre : true;
  
      const numeroMatch = ordre.numeroOrdre?.toLowerCase().includes(rechercheLower);
  
      const chauffeurMatch =
        ordre.chauffeur?.nom?.toLowerCase().includes(rechercheLower) ||
        ordre.chauffeur?.prenom?.toLowerCase().includes(rechercheLower);
  
      const vehiculeMatch =
        ordre.vehiculeTransport?.matricule?.toLowerCase().includes(rechercheLower) ||
        ordre.vehiculeTransport?.type?.toLowerCase().includes(rechercheLower);
  
      let dateMatch = false;
      if (ordre.dateCreation instanceof Date && !isNaN(ordre.dateCreation)) {
        const formattedDate = new Intl.DateTimeFormat('fr-FR').format(ordre.dateCreation); // ex: 04/04/2025
        dateMatch = formattedDate.toLowerCase().includes(rechercheLower);
      }
  
      const rechercheMatch = !rechercheLower || numeroMatch || chauffeurMatch || vehiculeMatch || dateMatch;
  
      return statutMatch && rechercheMatch;
    });
  }
  
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
          dateCreation: new Date(ordre.dateCreation)
        }));
        this.ordresMissionFiltres = [...this.ordresMission]; // ✅ Initialisation de la liste filtrée
      },
      error: () => {
        this.snackBar.open('❌ Erreur lors du chargement des ordres de mission', 'Fermer', { duration: 3000 });
      },
    });
  }

  /** ✅ Télécharger ou afficher l’ordre de mission */
  afficherOrdreMission(pdfUrl: string) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    this.http.get(pdfUrl, { headers, responseType: 'blob' }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank'); // ✅ Ouvrir le PDF dans un nouvel onglet
    }, error => {
      this.snackBar.open('❌ Erreur lors de l’ouverture du document', 'Fermer', { duration: 3000 });
    });
  }
}
