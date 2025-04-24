import { CommonModule, NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-profil-utilisateur',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    NgIf,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './profil-utilisateur.component.html',
  styleUrl: './profil-utilisateur.component.scss'
})

export class ProfilUtilisateurComponent implements OnInit {
  profilForm!: FormGroup;
  utilisateurId!: number;

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any>('http://localhost:8080/api/utilisateurs/me').subscribe(data => {
      this.utilisateurId = data.id;
      this.profilForm = this.fb.group({
        nom: [data.nom, Validators.required],
        prenom: [data.prenom, Validators.required],
        email: [data.email, [Validators.required, Validators.email]],
        role: [data.role],
        parcNom: [data.parcNom],
        parcsAccessibles: [data.parcsAccessibles],
        marquesAccessibles: [data.marquesAccessibles],
        motDePasse: [''],
        confirmationMotDePasse: ['']
      });
    });
  }

  onSubmit(): void {
    const form = this.profilForm.value;

    if (form.motDePasse && form.motDePasse !== form.confirmationMotDePasse) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    const dto: any = {
      id: this.utilisateurId,
      nom: form.nom,
      prenom: form.prenom,
      email: form.email,
    };
    
    if (form.motDePasse && form.motDePasse.trim() !== '') {
      dto.motDePasse = form.motDePasse;
    }
    

    this.http.put(`http://localhost:8080/api/utilisateurs/${this.utilisateurId}`, dto).subscribe({
      next: () => alert('Profil mis à jour avec succès !'),
      error: () => alert('Erreur lors de la mise à jour du profil')
    });
  }

  roleLabel(role: string): string {
    return {
      'ROLE_ADMINISTRATEUR': 'Administrateur',
      'ROLE_GESTIONNAIRE_STOCK': 'Gestionnaire de stock',
      'ROLE_Manager': 'Manager',
      'ROLE_EXPERT': 'Expert',
      'ROLE_Commercial': 'Commercial'
    }[role] || role;
  }
}
