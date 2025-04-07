import { Component, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Html5Qrcode } from 'html5-qrcode'; // Correct import
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import Quagga from 'quagga';
@Component({
  selector: 'app-reception-vehicules-mobile',
  templateUrl: './reception-vehicules-mobile.component.html',
  styleUrls: ['./reception-vehicules-mobile.component.scss'],
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,ReactiveFormsModule,NgIf]
})
export class ReceptionVehiculesMobileComponent implements OnDestroy {
  qrForm: FormGroup;
  scannerStarted = false;
  html5QrCode!: Html5Qrcode;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.qrForm = this.fb.group({
      numeroChassis: ['', Validators.required],
    });
  }

  startScanner() {
    this.scannerStarted = true; // Active le ngIf pour que le DOM rende #reader
  
    setTimeout(() => {
      const readerElement = document.getElementById("reader");
  
      if (!readerElement) {
        console.error("Erreur: L'élément avec l'id 'reader' est introuvable");
        return;
      }
  
      this.html5QrCode = new Html5Qrcode("reader");
  
      this.html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          console.log("QR code détecté:", decodedText);
          this.qrForm.controls['numeroChassis'].setValue(decodedText);
          this.snackBar.open("✅ Code détecté", "Fermer", { duration: 2000 });
          this.stopScanner();
        },
        (errorMessage: string) => {
          //console.error("Erreur lors du scan du QR code:", errorMessage);
        }
      ).then(() => {
        console.log("Scanner démarré !");
      }).catch((err) => {
        console.error("Erreur d'initialisation du scanner:", err);
        this.snackBar.open("❌ Erreur scanner", "Fermer", { duration: 3000 });
      });
  
    }, 300); // petit délai pour laisser le temps à Angular de rendre le DOM
  }
  stopScanner() {
    if (this.scannerStarted && this.html5QrCode) {
      this.html5QrCode.stop().then(() => {
        this.scannerStarted = false;
      }).catch((err) => {
        console.error("Error stopping scanner", err);
      });
    }
  }

  receptionnerVehicule() {
    const numeroChassis = this.qrForm.value.numeroChassis;
  
    if (!numeroChassis) {
      this.snackBar.open("🚨 Numéro de châssis requis", "Fermer", { duration: 3000 });
      return;
    }
  
    const token = localStorage.getItem('token');
    if (!token) {
      this.snackBar.open("❌ Token manquant", "Fermer", { duration: 3000 });
      return;
    }
  
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const parcNom = decoded?.parcNom;
  
    // ✅ Vérification d'existence du véhicule
    this.http.get(`http://localhost:8080/api/vehicules/chassis/${numeroChassis}`).subscribe({
      next: () => {
        // ✅ Véhicule trouvé → on redirige
        this.router.navigate(['/enregistrer-vehicule'], {
          queryParams: {
            numeroChassis: numeroChassis,
            parc: parcNom
          }
        });
      },
      error: (err) => {
        if (err.status === 404) {
          this.snackBar.open("🚫 Numéro de châssis introuvable !", "Fermer", { duration: 3000 });
        } else {
          this.snackBar.open("❌ Erreur lors de la vérification du véhicule", "Fermer", { duration: 3000 });
        }
      }
    });
  }

  allerVersEnregistrement() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.snackBar.open("❌ Token manquant", "Fermer", { duration: 3000 });
      return;
    }

    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const parcNom = decoded.parcNom;

      if (!parcNom) {
        this.snackBar.open("❌ parcNom manquant dans le token", "Fermer", { duration: 3000 });
        return;
      }

      this.router.navigate(['/enregistrer-vehicule'], {
        queryParams: { parc: parcNom }
      });
    } catch (error) {
      console.error("🚨 Erreur de décodage du token :", error);
      this.snackBar.open("❌ Erreur de décodage du token", "Fermer", { duration: 3000 });
    }
  }

  ngOnDestroy() {
    if (this.scannerStarted) {
      this.stopScanner();
    }
  }
}
