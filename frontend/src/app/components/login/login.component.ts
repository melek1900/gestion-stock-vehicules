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
import { NgIf } from '@angular/common';
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
    NgIf
  ],
})

export class LoginComponent {
  form: FormGroup;
  hide = true;
  adminExists = false;

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
  ngOnInit(): void {
    this.verifierAdminExistant();
  }
  verifierAdminExistant(): void {
    this.http.get<boolean>('http://localhost:8080/api/utilisateurs/admin-exists').subscribe({
      next: (exists) => {
        console.log("🔍 Admin existe :", exists);
        this.adminExists = exists;
      },
      error: (err) => {
        console.error("❌ Erreur lors de la vérification admin :", err);
        this.adminExists = false;
      }
    });
  }
  login() {
    if (this.form.valid) {
      console.log("📡 Envoi de la requête de connexion...");
  
      this.http.post<{ token: string }>('http://localhost:8080/auth/login', this.form.value).subscribe({
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
    this.http.get<boolean>('http://localhost:8080/api/utilisateurs/admin-exists').subscribe({
      next: (adminExists) => {
        if (adminExists) {
          this.snackBar.open("❌ Un administrateur existe déjà. Création de compte désactivée.", "Fermer", { duration: 4000 });
        } else {
          this.router.navigate(['/register']);
        }
      },
      error: (err) => {
        console.error("❌ Erreur lors de la vérification de l'admin :", err);
        this.snackBar.open("Erreur de vérification. Veuillez réessayer plus tard.", "Fermer", { duration: 3000 });
      }
    });
  }
}
