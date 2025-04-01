import { CommonModule, NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-prelevement-vehicule',
  templateUrl: './prelevement-vehicule.component.html',
  styleUrl: './prelevement-vehicule.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgFor,
    NgIf,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatChipsModule,
    MatTableModule,
    ZXingScannerModule
  ]
})
export class PrelevementVehiculeComponent {
  ordreMission: string = '';
  vehicules: any[] = [];
  vehiculesManquants: any[] = [];
  isScannerActif = false;

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  activerScanner() {
    this.isScannerActif = true;
  }

  desactiverScanner() {
    this.isScannerActif = false;
  }

  aDesVehiculesNonPreleves(): boolean {
    return this.vehicules.some(v => !v.preleve);
  }

  chargerOrdreMission() {
    if (!this.ordreMission) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    this.http.get<any[]>(`http://172.20.10.8:8080/api/ordres-mission/${this.ordreMission}/vehicules`, { headers })
    .subscribe({
        next: (data) => {
          this.vehicules = data.map(v => ({ ...v, preleve: false }));
          this.vehiculesManquants = [];
        },
        error: () => {
          this.snackBar.open('❌ Erreur lors du chargement des véhicules', 'Fermer', { duration: 3000 });
        }
      });
  }
  tousPreleves(): boolean {
    return this.vehicules.every(v => v.preleve);
  }
  
  scannerVehicule(numeroChassis: string) {
    console.log('📷 Scanner détecté:', numeroChassis);
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
  
    this.http.patch(
      `http://172.20.10.8:8080/api/ordres-mission/${this.ordreMission}/prelever/${numeroChassis}`,
      {},
      { headers }
    ).subscribe({
      next: (res: any) => {
        const vehicule = this.vehicules.find(v => v.numeroChassis === numeroChassis);
  
        if (vehicule) {
          vehicule.preleve = true;
          this.snackBar.open(`✅ Véhicule ${numeroChassis} prélevé avec succès`, 'Fermer', { duration: 3000 });
  
          // ✅ Si tous sont prélevés
          if (this.tousPreleves()) {
            this.snackBar.open('🎉 Tous les véhicules ont été prélevés ! L’ordre est clôturé.', 'Fermer', { duration: 4000 });
          }
        } else {
          console.warn(`❌ Véhicule ${numeroChassis} non trouvé dans la liste locale`);
        }
  
        this.desactiverScanner();
      },
      error: (err) => {
        console.error("❌ Erreur lors du prélèvement :", err);
        this.snackBar.open(err.error?.message || '❌ Véhicule invalide ou déjà prélevé', 'Fermer', { duration: 3000 });
        this.desactiverScanner();
      }
    });
  }
  

  validerPrelevement() {
    if (this.aDesVehiculesNonPreleves()) {
      this.snackBar.open("⚠️ Tous les véhicules doivent être prélevés", "Fermer", { duration: 3000 });
      return;
    }

    this.snackBar.open('✅ Tous les véhicules prélevés. Ordre de mission clôturé automatiquement.', 'Fermer', { duration: 3000 });

    this.vehicules = [];
    this.vehiculesManquants = [];
    this.ordreMission = '';
  }
}
