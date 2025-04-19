import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/browser';

@Component({
  selector: 'app-reception-vehicules',
  templateUrl: './reception-vehicules.component.html',
  styleUrls: ['./reception-vehicules.component.scss'],
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
    ZXingScannerModule,
  ],
})
export class ReceptionVehiculesComponent {
  qrForm: FormGroup;
  isScanning = false;
  scannerFormats = [BarcodeFormat.QR_CODE, BarcodeFormat.CODE_128];
  qrResult: string = '';

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

  /** ✅ Démarrer le scanner QR Code */
  startScanner() {
    this.isScanning = true;
  }

  /** ✅ Capture du QR Code */
  onCodeResult(resultString: string) {
    console.log('📸 QR Code détecté:', resultString);
    this.qrResult = resultString;
    this.qrForm.controls['numeroChassis'].setValue(resultString);
    this.isScanning = false;
  }

  /** ✅ Réceptionner un véhicule */
  receptionnerVehicule() {
    const numeroChassis = this.qrForm.value.numeroChassis;

    if (!numeroChassis) {
      this.snackBar.open("🚨 Numéro de châssis requis", "Fermer", { duration: 3000 });
      return;
    }

    this.http.post(`http://localhost:8080/api/vehicules/reception`, { numeroChassis })
      .subscribe({
        next: () => {
          this.snackBar.open('✅ Véhicule réceptionné avec succès !', 'Fermer', { duration: 3000 });
          this.qrForm.reset();
        },
        error: () => {
          this.snackBar.open('❌ Erreur lors de la réception', 'Fermer', { duration: 3000 });
        }
      });
  }

  /** ✅ Aller vers l'enregistrement manuel */
  allerVersEnregistrement() {
    this.router.navigate(['/enregistrer-vehicule'], { queryParams: { parc: 'MEGRINE' } });
  }
}
