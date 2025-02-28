import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-demandes-expertise',
  templateUrl: './demandes-expertise.component.html',
  styleUrls: ['./demandes-expertise.component.scss'],
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatCardModule, MatSnackBarModule],
})
export class DemandesExpertiseComponent implements OnInit {
  demandes: any[] = [];
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.chargerDemandes();
  }

  chargerDemandes() {
    this.http.get<any[]>('http://localhost:8080/api/expertises').subscribe({
      next: (data) => {
        console.log("📡 Demandes d'expertise reçues :", data);
        this.demandes = data;
      },
      error: (err) => {
        console.error("❌ Erreur lors du chargement des demandes :", err);
        this.snackBar.open("Erreur lors du chargement des demandes", "Fermer", { duration: 3000 });
      },
    });
  }

  traiterDemande(demandeId: number) {
    this.http.put(`http://localhost:8080/api/expertises/${demandeId}/traiter`, {}).subscribe({
      next: () => {
        console.log(`✅ Demande ${demandeId} traitée avec succès`);
        this.snackBar.open("Demande traitée avec succès", "Fermer", { duration: 3000 });
        this.chargerDemandes();
      },
      error: (err) => {
        console.error("❌ Erreur lors du traitement de la demande :", err);
      },
    });
  }
}
