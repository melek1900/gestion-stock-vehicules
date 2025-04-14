import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgIf, NgFor } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgFor,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
})
export class RegisterComponent implements OnInit {
  form: FormGroup;
  parcs: any[] = [];
  parcsAcces: any[] = [];
  loadingParcs: boolean = false;
  marquesDisponibles: string[] = [];

  roles = [
    { label: 'Administrateur', value: 'ROLE_ADMINISTRATEUR' },
    { label: 'Gestionnaire de Stock', value: 'ROLE_GESTIONNAIRE_STOCK' },
    { label: 'Manager', value: 'ROLE_MANAGER' },
    { label: 'Expert', value: 'ROLE_EXPERT' },
    { label: 'Commercial', value: 'ROLE_COMMERCIAL' },
    { label: 'Gestionnaire Application', value: 'ROLE_GESTIONNAIRE_APPLICATION' }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.form = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required],
      parc: ['', Validators.required],
      parcsAcces: [[]],
      marquesAccessibles: [[]]
    });
  }

  ngOnInit(): void {
    this.chargerParcs();
    this.chargerMarques();

  }
  chargerMarques() {
    this.http.get<string[]>('http://192.168.1.121:8080/api/utilisateurs/marques-accessibles')
      .subscribe({
        next: (data) => {
          this.marquesDisponibles = data;
          console.log("✅ Marques chargées :", data);
        },
        error: (err) => {
          console.error("❌ Erreur chargement marques:", err);
        }
      });
  }
  
  chargerParcs() {
    this.loadingParcs = true;
    this.http.get<any[]>('http://192.168.1.121:8080/api/parcs')
      .subscribe({
        next: (data) => {
          // ✅ Exclure "TRANSFERT" et "AUPORT" du parc de travail
          this.parcs = data.filter(parc => parc.nom !== 'TRANSFERT' && parc.nom !== 'AUPORT');

          // ✅ Exclure uniquement "TRANSFERT" des parcs accessibles
          this.parcsAcces = data.filter(parc => parc.nom !== 'TRANSFERT');

          this.loadingParcs = false;
        },
        error: (err) => {
          console.error('❌ Erreur lors du chargement des parcs:', err);
          this.loadingParcs = false;
        }
      });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  register() {
    if (this.form.valid) {
      let formData = { ...this.form.value };

      formData.nom = formData.nom.trim();
      formData.prenom = formData.prenom.trim();
      formData.email = formData.email.trim();

      this.http.post('http://192.168.1.121:8080/auth/register', formData, { responseType: 'text' })
      .subscribe({
        next: (response) => {
          console.log('✅ Inscription réussie', response);
          this.router.navigate(['/login']);
        },
        error: (err) => console.error('❌ Erreur lors de l’inscription', err)
      });
    }
  }
}
