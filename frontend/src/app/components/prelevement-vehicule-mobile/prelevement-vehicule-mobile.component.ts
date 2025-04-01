import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/browser';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-prelevement-vehicule-mobile',
  templateUrl: './prelevement-vehicule-mobile.component.html',
  styleUrls: ['./prelevement-vehicule-mobile.component.scss'],
  standalone: true,
  imports: [  CommonModule,
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
    ZXingScannerModule,
    MatProgressBarModule
  ]
})
export class PrelevementVehiculeMobileComponent {
  ordreMission: string = '';
  vehicules: any[] = [];
  vehiculesManquants: any[] = [];
  isScannerActif = false;
  isLoading: boolean = false;

  formatsScanner = [
    BarcodeFormat.QR_CODE, 
    BarcodeFormat.EAN_13, 
    BarcodeFormat.CODE_128, 
    BarcodeFormat.CODE_39
  ];
  constructor(private http: HttpClient, private snackBar: MatSnackBar) {
    console.log("📸 Formats de codes supportés :", Object.values(BarcodeFormat));
  }
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
          console.log("📦 Véhicules reçus :", data);

          this.vehicules = data.map(v => ({
            ...v,
            preleve: v.parcId === 3 || v.parcNom === 'TRANSFERT'
          }));
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
  private vibrate(pattern: number | number[] = 200): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern as any); // ✅ Cast "any" pour bypass TS
    }
  }
  

  scannerVehicule(numeroChassis: string) {
    console.log('📷 Scanner détecté:', numeroChassis);
  
    if (!this.ordreMission?.trim()) {
      this.snackBar.open("⚠️ Numéro d'ordre de mission invalide", "Fermer", { duration: 3000 });
      return;
    }
  
    if (!numeroChassis?.trim()) {
      this.snackBar.open("⚠️ Numéro de châssis invalide", "Fermer", { duration: 3000 });
      return;
    }
  
    const token = localStorage.getItem('token');
    if (!token) {
      this.snackBar.open("❌ Vous devez être connecté", "Fermer", { duration: 3000 });
      return;
    }
  
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    const url = `http://172.20.10.8:8080/api/ordres-mission/${encodeURIComponent(this.ordreMission)}/prelever/${encodeURIComponent(numeroChassis)}`;
  
    this.isLoading = true;
  
    this.http.patch(url, {}, { headers }).subscribe({
      next: (res: any) => {
        const vehicule = this.vehicules.find(v => v.numeroChassis === numeroChassis);
        if (vehicule) {
          vehicule.preleve = true;
          vehicule.parc = "TRANSFERT";
          this.snackBar.open(`✅ Véhicule ${numeroChassis} prélevé`, 'Fermer', { duration: 3000 });
          this.vibrate(150); // ✅ vibration douce
        }
  
        if (this.peutValiderPrelevement()) {
          this.snackBar.open('⚡ Prélèvement partiel possible.', 'Fermer', { duration: 4000 });
        }
  
        this.desactiverScanner();
        this.isLoading = false;
      },
      error: (err) => {
        this.vibrate([100, 50, 100]);
        console.error("❌ Erreur lors du prélèvement :", err);
        this.snackBar.open(err.error?.message || '❌ Véhicule invalide ou déjà prélevé', 'Fermer', { duration: 3000 });
        this.desactiverScanner();
        this.isLoading = false;
      }
    });
  }
  
  
  peutValiderPrelevement(): boolean {
    return this.vehicules.some(v => v.preleve);
  }
  
  
  validerPrelevement() {
    if (!this.peutValiderPrelevement()) {
      this.snackBar.open("⚠️ Au moins un véhicule doit être prélevé avant validation", "Fermer", { duration: 3000 });
      return;
    }
  
    if (!this.ordreMission || this.ordreMission.trim() === "") {
      console.error("🚨 Erreur: ordreMission est vide !");
      this.snackBar.open("⚠️ Numéro d'ordre de mission invalide", "Fermer", { duration: 3000 });
      return;
    }
  
    const token = localStorage.getItem('token');
    console.log("📌 Token envoyé dans la requête :", token);

    if (!token) {
      console.error("🚨 Erreur: Aucun token JWT trouvé !");
      this.snackBar.open("❌ Vous devez être connecté", "Fermer", { duration: 3000 });
      return;
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    const url = `http://172.20.10.8:8080/api/ordres-mission/${encodeURIComponent(this.ordreMission)}/valider-prelevement`;
  
    this.http.patch(url, {}, { headers })
      .subscribe({
        next: () => {
          this.snackBar.open('✅ Prélèvement validé. L’ordre de mission reste "En cours".', 'Fermer', { duration: 3000 });
  
          // ✅ Réinitialiser les listes après validation
          this.vehicules = [];
          this.vehiculesManquants = [];
          this.ordreMission = '';
        },
        error: (err) => {
          console.error("❌ Erreur lors de la validation du prélèvement :", err);
          this.snackBar.open("❌ Échec de la validation", "Fermer", { duration: 3000 });
        }
      });
  }
}
