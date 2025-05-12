import { Component, EventEmitter, Output, HostListener } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router, NavigationEnd } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule,NgIf,NgClass ],
})
export class NavbarComponent {
  nom: string = '';
  prenom: string = '';
  role: string = '';
  isMobile: boolean = false;
  navbarClass = 'custom-navbar'; // valeur par défaut

  private checkNavbarVisibility() {
    const token = localStorage.getItem('token');
    if (token) {
      const jwtHelper = new JwtHelperService();
      if (!jwtHelper.isTokenExpired(token)) {
        const decodedToken = jwtHelper.decodeToken(token);
        this.nom = decodedToken.nom || '';
        this.prenom = decodedToken.prenom || '';
        this.role = decodedToken.role?.replace('ROLE_', '') || 'Utilisateur';
  
        // 🎨 Mise à jour de la couleur de la navbar
        this.navbarClass =
          this.role === 'GESTIONNAIRE_STOCK' ? 'custom-navbar white-navbar' : 'custom-navbar';
      }
    }
  }
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(private router: Router) {
    this.updateScreenSize();
    this.checkNavbarVisibility();

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.checkNavbarVisibility();
      }
    });
  }

  @HostListener('window:resize', [])
  updateScreenSize() {
    this.isMobile = window.innerWidth <= 768;
  }
  goToProfile() {
    this.router.navigate(['/profil']);
  }
  getRoleLabel(): string {
    switch (this.role) {
      case 'ADMINISTRATEUR':
        return 'Administrateur';
      case 'GESTIONNAIRE_STOCK':
        return 'Gestionnaire de Stock';
      case 'GESTIONNAIRE_APPLICATION':
        return 'Gestionnaire Application';
      case 'MANAGER':
        return 'Manager';
      case 'EXPERT':
        return 'Expert';
      case 'COMMERCIAL':
        return 'Commercial';
      default:
        return 'Utilisateur';
    }
  }

  logout() {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:8080/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }).finally(() => {
        localStorage.clear();
        this.router.navigate(['/login']);
      });
    } else {
      localStorage.clear();
      this.router.navigate(['/login']);
    }
  }
  redirectToHome() {
    this.router.navigate(['/home']);
  }
}
