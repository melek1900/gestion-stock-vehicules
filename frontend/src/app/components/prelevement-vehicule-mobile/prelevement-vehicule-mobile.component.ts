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
import { Html5Qrcode } from 'html5-qrcode';

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
  scannerStarted = false;
  html5QrCode!: Html5Qrcode;
  formatsScanner = [
    BarcodeFormat.QR_CODE, 
    BarcodeFormat.EAN_13, 
    BarcodeFormat.CODE_128, 
    BarcodeFormat.CODE_39
  ];
  numeroChassisSaisi: string = '';
  scannerOrdreActive = false;
  html5QrCodeOrdre!: Html5Qrcode;

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {
    console.log("📸 Formats de codes supportés :", Object.values(BarcodeFormat));
  }
  ngOnDestroy() {
    this.stopScanner();
  }
  startOrdreMissionScanner() {
    this.scannerOrdreActive = true;
  
    setTimeout(() => {
      const element = document.getElementById("reader-ordre");
      if (!element) return;
  
      this.html5QrCodeOrdre = new Html5Qrcode("reader-ordre");
  
      this.html5QrCodeOrdre.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          console.log("✅ Ordre de mission détecté :", decodedText);
          this.ordreMission = decodedText;
          this.chargerOrdreMission();
          this.stopOrdreMissionScanner();
        },
        (errorMessage: string) => {
          console.log("🔁 Lecture en cours (ordre) :", errorMessage);
        }
      ).catch((err) => {
        console.error("❌ Erreur démarrage scanner ordre :", err);
      });
    }, 300);
  }
  
  stopOrdreMissionScanner() {
    if (this.html5QrCodeOrdre) {
      this.html5QrCodeOrdre.stop().then(() => {
        this.scannerOrdreActive = false;
      }).catch((err) => {
        console.error("❌ Erreur arrêt scanner ordre :", err);
      });
    }
  }
  onNumeroChassisChange(value: string) {
    const numero = value?.trim();
    
    // ✅ Déclenche dès que la longueur minimale est atteinte
    if (numero.length >= 10) {
      console.log("🚀 Numéro détecté automatiquement :", numero);
      this.scannerVehicule(numero);
      this.numeroChassisSaisi = ''; 
    }
  }
  soumettreNumeroChassis() {
    const numero = this.numeroChassisSaisi?.trim();
  
    if (!numero) {
      this.snackBar.open("⚠️ Veuillez saisir un numéro de châssis", "Fermer", { duration: 3000 });
      return;
    }
  
    this.scannerVehicule(numero); 
    this.numeroChassisSaisi = ''; 
  }
  startScanner() {
    console.log("▶️ Démarrage du scanner demandé...");
    this.scannerStarted = true;
  
    setTimeout(() => {
      console.log("🕒 Initialisation du scanner dans le setTimeout...");
      const readerElement = document.getElementById("reader");
  
      if (!readerElement) {
        console.error("❌ Élément #reader introuvable dans le DOM !");
        return;
      }
  
      console.log("📸 Élément #reader trouvé. Initialisation Html5Qrcode...");
      this.html5QrCode = new Html5Qrcode("reader");
  
      this.html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          console.log("✅ QR détecté :", decodedText);
          this.scannerVehicule(decodedText);
          this.stopScanner();
        },
        (errorMessage: string) => {
          console.log("🔁 Erreur de scan (soft) :", errorMessage);
        }
      ).then(() => {
        console.log("🎥 Scanner démarré avec succès !");
      }).catch((err) => {
        console.error("❌ Erreur lors du démarrage du scanner :", err);
      });
  
    }, 300);
  }
  
  stopScanner() {
    if (this.scannerStarted && this.html5QrCode) {
      this.html5QrCode.stop().then(() => {
        this.scannerStarted = false;
      }).catch((err) => {
        console.error("Erreur arrêt scanner:", err);
      });
    }
  }
  trierVehicules() {
    this.vehicules = this.vehicules
      .slice() // clone pour ne pas modifier la référence d’origine
      .sort((a, b) => Number(a.preleve) - Number(b.preleve)); // false (non prélevé) avant true
  }

 

  aDesVehiculesNonPreleves(): boolean {
    return this.vehicules.some(v => !v.preleve);
  }

  chargerOrdreMission() {
    if (!this.ordreMission) return;
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
  
    this.http.get<any[]>(`http://localhost:8080/api/ordres-mission/${this.ordreMission}/vehicules`, { headers })
      .subscribe({
        next: (data) => {
          console.log("📦 Véhicules reçus :", data);

          this.vehicules = data.map(v => ({
            ...v,
            preleve: v.parcId === 3 || v.parcNom === 'TRANSFERT'
          }));
          this.trierVehicules();
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
    console.log('📷 Donnée scannée reçue:', numeroChassis);
  
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
    const url = `http://localhost:8080/api/ordres-mission/${encodeURIComponent(this.ordreMission)}/prelever/${encodeURIComponent(numeroChassis)}`;
  
    this.isLoading = true;
  
    this.http.patch(url, {}, { headers }).subscribe({
      next: (res: any) => {
        const vehicule = this.vehicules.find(v => v.numeroChassis === numeroChassis);
        if (vehicule) {
          vehicule.preleve = true;
          vehicule.parc = "TRANSFERT";
          vehicule.justScanned = true; // ✅ Pour affichage temporaire "🚀 Nouveau"
        }
  
        this.trierVehicules(); // ✅ Tri dynamique après modification
        this.snackBar.open(`✅ Véhicule ${numeroChassis} prélevé`, 'Fermer', { duration: 3000 });
        this.vibrate(150);
  
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
  desactiverScanner() {
    this.isScannerActif = false;
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
  
    const url = `http://localhost:8080/api/ordres-mission/${encodeURIComponent(this.ordreMission)}/valider-prelevement`;
  
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
