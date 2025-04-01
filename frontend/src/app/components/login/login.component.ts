import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
})

export class LoginComponent {
  form: FormGroup;
  hide = true;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  login() {
    if (this.form.valid) {
      console.log("📡 Envoi de la requête de connexion...");
  
      this.http.post<{ token: string }>('http://172.20.10.8:8080/auth/login', this.form.value).subscribe({
        next: (response) => {
          if (!response.token) {
            console.error("🚨 Aucun token reçu !");
            return;
          }
  
          console.log("🔑 Token reçu :", response.token);
          localStorage.setItem('token', response.token);
  
          const jwtHelper = new JwtHelperService();
          const decodedToken = jwtHelper.decodeToken(response.token);
          const role = decodedToken.role.replace('ROLE_', ''); // ADMIN, GESTIONNAIRE_STOCK...
  
          console.log('✅ Utilisateur connecté avec rôle :', role);
          this.router.navigateByUrl('/home', { replaceUrl: true });
   },
        error: (err) => {
          console.error("❌ Erreur lors de la connexion :", err);
          this.snackBar.open("⚠️ Identifiants incorrects ou accès refusé.", "Fermer", { duration: 3000 });
        }
      });
    }
  }
  goToRegister() {
    this.router.navigate(['/register']);
  }
}
