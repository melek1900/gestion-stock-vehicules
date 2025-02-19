import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgIf, NgFor } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

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
  ],
})
export class RegisterComponent {
  form: FormGroup;

  roles = [
    { label: 'Administrateur', value: 'ROLE_ADMIN' },
    { label: 'Gestionnaire de Stock', value: 'ROLE_GESTIONNAIRE_STOCK' },
    { label: 'Vendeur', value: 'ROLE_VENDEUR' },
    { label: 'Expert', value: 'ROLE_EXPERT' }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', Validators.required],
      role: ['', Validators.required]
    });
  }

  register() {
    if (this.form.valid) {
      this.http.post('http://localhost:8080/auth/register', this.form.value, { responseType: 'text' })
      .subscribe({
        next: (response) => {
          console.log('Inscription réussie', response);
          this.router.navigate(['/login']);
        },
        error: (err) => console.error('Erreur lors de l’inscription', err)
        });
    }
  }
}
