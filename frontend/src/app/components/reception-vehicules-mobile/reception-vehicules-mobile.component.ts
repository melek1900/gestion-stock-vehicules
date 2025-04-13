import { Component, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { AutofocusDirective } from '../../../autofocus.directive';
@Component({
  selector: 'app-reception-vehicules-mobile',
  templateUrl: './reception-vehicules-mobile.component.html',
  styleUrls: ['./reception-vehicules-mobile.component.scss'],
  imports: [MatCardModule,AutofocusDirective, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,ReactiveFormsModule,NgIf]
})
export class ReceptionVehiculesMobileComponent {
  qrForm: FormGroup;

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
    this.http.get(`http://192.168.1.121:8080/api/vehicules/chassis/${numeroChassis}`).subscribe({
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

}
