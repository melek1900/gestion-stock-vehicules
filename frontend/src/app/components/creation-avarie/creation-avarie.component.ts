import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BarcodeFormat } from '@zxing/browser';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Html5Qrcode } from 'html5-qrcode';

@Component({
  selector: 'app-creation-avarie',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    ZXingScannerModule
  ],
  templateUrl: './creation-avarie.component.html',
  styleUrl: './creation-avarie.component.scss'
})
export class CreationAvarieComponent {
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
    this.scannerStarted = true;

    setTimeout(() => {
      const readerElement = document.getElementById("reader");

      if (!readerElement) {
        console.error("❌ Élément #reader introuvable");
        return;
      }

      this.html5QrCode = new Html5Qrcode("reader");

      this.html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          console.log("QR détecté:", decodedText);
          this.qrForm.controls['numeroChassis'].setValue(decodedText);
          this.snackBar.open("✅ Code détecté", "Fermer", { duration: 2000 });
          this.stopScanner();
        },
        (err) => { }
      ).catch(err => {
        console.error("❌ Erreur démarrage scanner:", err);
        this.snackBar.open("Erreur lors du démarrage du scanner", "Fermer", { duration: 3000 });
      });
    }, 300);
  }

  stopScanner() {
    if (this.scannerStarted && this.html5QrCode) {
      this.html5QrCode.stop().then(() => {
        this.scannerStarted = false;
      }).catch((err) => {
        console.error("❌ Erreur arrêt scanner:", err);
      });
    }
  }

  receptionnerVehicule() {
    const numeroChassis = this.qrForm.value.numeroChassis;
    if (!numeroChassis) {
      this.snackBar.open("🚨 Numéro de châssis requis", "Fermer", { duration: 3000 });
      return;
    }

    const parc = this.getParcDepuisToken();

    this.router.navigate(['/enregistrer-avarie'], {
      queryParams: { parc, numeroChassis }
    });
  }

  allerVersEnregistrement() {
    const parc = this.getParcDepuisToken();
    this.router.navigate(['/enregistrer-avarie'], {
      queryParams: { parc }
    });
  }

  getParcDepuisToken(): string {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const mappingParcId: Record<number, string> = {
        1: 'MEGRINE',
        2: 'CHARGUIA',
        4: 'AUPORT'
      };
      if (decoded?.parcNom) return decoded.parcNom;
      if (decoded?.parcId) return mappingParcId[decoded.parcId] || 'MEGRINE';
    }
    return 'MEGRINE';
  }

  ngOnDestroy() {
    this.stopScanner();
  }
}

