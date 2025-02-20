import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../services/auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  imports: [
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    ReactiveFormsModule,
  ],
})
export class LoginComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private http : HttpClient
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }
  goToRegister() {
    this.router.navigate(['/register']);
  }
  
  login() {
    if (this.form.valid) {
      this.http.post<{ token: string }>('http://localhost:8080/auth/login', this.form.value).subscribe({
        next: (res) => {
          localStorage.setItem('token', res.token);
  
          const decodedToken = new JwtHelperService().decodeToken(res.token);
          const role = decodedToken.role.replace('ROLE_', '');
  
          console.log('Rôle décodé :', role); // Pour vérifier ce qu'on obtient
  
          switch (role) {
            case 'ADMIN':
              window.location.href = '/admin';
              break;
            case 'GESTIONNAIRE_STOCK':
              window.location.href = '/gestionnaire';
              break;
            case 'VENDEUR':
              window.location.href = '/vendeur';
              break;
            case 'EXPERT':
              window.location.href = '/expert';
              break;
            default:
              window.location.href = '/';
          }
        },
        error: (err) => {
          console.error('Erreur lors de la connexion', err);
        },
      });
    }
  }
  
  
  
  
}
