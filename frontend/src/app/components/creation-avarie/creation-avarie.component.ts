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

@Component({
  selector: 'app-creation-avarie',
  imports: [ CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    ZXingScannerModule,],
  templateUrl: './creation-avarie.component.html',
  styleUrl: './creation-avarie.component.scss'
})
export class CreationAvarieComponent {
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
  
    // 🔁 Redirection vers la page d'enregistrement avec numéro de châssis
    this.router.navigate(['/enregistrer-avarie'], {
      queryParams: {
        parc: 'MEGRINE',             // tu le passes déjà
        numeroChassis: numeroChassis // ✅ ici on passe le numéro scanné
      }
    });
  }

  /** ✅ Aller vers l'enregistrement manuel */
  allerVersEnregistrement() {
    this.router.navigate(['/enregistrer-avarie'], { queryParams: { parc: 'MEGRINE' } });
  }
}
