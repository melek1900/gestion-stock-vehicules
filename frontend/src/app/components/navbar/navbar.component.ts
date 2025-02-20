import { Component } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router, NavigationEnd } from '@angular/router';
import { NgIf } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [NgIf, MatToolbarModule, MatButtonModule],
})
export class NavbarComponent {
  nom: string = '';
  prenom: string = '';
  role: string = '';
  isVisible: boolean = false;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.checkNavbarVisibility();
      }
    });
  }

  private checkNavbarVisibility() {
    const url = this.router.url;
    const isLoginOrRegister = url === '/login' || url === '/register';

    if (isLoginOrRegister) {
      this.isVisible = false;
    } else {
      const token = localStorage.getItem('token');
      if (token) {
        const jwtHelper = new JwtHelperService();
        const decodedToken = jwtHelper.decodeToken(token);
        this.nom = decodedToken.nom;
        this.prenom = decodedToken.prenom;
        this.role = decodedToken.role.replace('ROLE_', '');
        this.isVisible = true;
      } else {
        this.isVisible = false;
      }
    }
  }

  getRoleLabel(): string {
    switch (this.role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'GESTIONNAIRE_STOCK':
        return 'Gestionnaire de Stock';
      case 'VENDEUR':
        return 'Vendeur';
      case 'EXPERT':
        return 'Expert';
      default:
        return 'Utilisateur';
    }
  }

  logout() {
    localStorage.removeItem('token');
    this.isVisible = false;
    this.router.navigate(['/login']);
  }
}
