import { NgIf, NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-user',
  imports: [ReactiveFormsModule,
    NgIf,
    NgFor,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss'
})
export class AddUserComponent {
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
      parc: ['', Validators.required], // ✅ Obligatoire pour tous les rôles
      parcsAcces: [[]]
    });
  }

  ngOnInit(): void {
    this.chargerParcs();
    this.chargerMarques();

  }
  chargerMarques() {
    this.http.get<string[]>('http://localhost:8080/api/utilisateurs/marques-accessibles')
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
    this.http.get<any[]>('http://localhost:8080/api/parcs')
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

 

  register() {
    if (this.form.valid) {
      let formData = { ...this.form.value };

      // ✅ Supprimer les espaces en début et fin des champs texte
      formData.nom = formData.nom.trim();
      formData.prenom = formData.prenom.trim();
      formData.email = formData.email.trim();

      this.http.post('http://localhost:8080/auth/register', formData, { responseType: 'text' })
      .subscribe({
        next: (response) => {
          console.log('✅ Inscription réussie', response);
          this.router.navigate(['/home']);
        },
        error: (err) => console.error('❌ Erreur lors de l’inscription', err)
      });
    }
  }
}
