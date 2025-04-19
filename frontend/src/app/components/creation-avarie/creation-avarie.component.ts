import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ParcService } from '../../../services/parc.service';

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
    MatIconModule  ],
  templateUrl: './creation-avarie.component.html',
  styleUrl: './creation-avarie.component.scss'
})
export class CreationAvarieComponent  implements AfterViewInit {
  @ViewChild('chassisInput') chassisInputRef!: ElementRef<HTMLInputElement>;

  qrForm: FormGroup;
  scannerStarted = false;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private parcService: ParcService
  ) {
    this.qrForm = this.fb.group({
      numeroChassis: ['', Validators.required],
    });
  }

  

  ngAfterViewInit() {
    setTimeout(() => {
      this.chassisInputRef?.nativeElement.focus();
    });
  }

  async receptionnerVehicule() {
    const numeroChassis = this.qrForm.value.numeroChassis;
    if (!numeroChassis) {
      this.snackBar.open("🚨 Numéro de châssis requis", "Fermer", { duration: 3000 });
      return;
    }
  
    try {
      const parc = await this.getParcDepuisTokenDynamique();
      this.router.navigate(['/enregistrer-avarie'], {
        queryParams: { parc, numeroChassis }
      });
    } catch (error: any) {
      this.snackBar.open(error.message || "Erreur de parc", "Fermer", { duration: 3000 });
    }
  }

  async allerVersEnregistrement() {
    try {
      const parc = await this.getParcDepuisTokenDynamique();
      this.router.navigate(['/enregistrer-avarie'], {
        queryParams: { parc }
      });
    } catch (error: any) {
      this.snackBar.open(error.message || "Erreur de parc", "Fermer", { duration: 3000 });
    }
  }
  
  getParcDepuisTokenDynamique(): Promise<string> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("🚨 Token non trouvé");
  
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const parcNom = decoded?.parcNom;

if (!parcNom) throw new Error("🚨 Nom du parc manquant dans le token");

return new Promise((resolve, reject) => {
  this.parcService.getParcs().subscribe({
    next: (parcs) => {
      const parc = parcs.find(p => p.nom.toUpperCase() === parcNom.toUpperCase());
      if (parc) resolve(parc.nom); // ou parc.id si tu veux travailler avec ID
      else reject(new Error("🚨 Parc inconnu : " + parcNom));
    },
    error: (err) => reject(new Error("❌ Erreur chargement des parcs : " + err.message))
  });
});
}
}

