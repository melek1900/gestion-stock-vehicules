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
    private router: Router
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

 
}

