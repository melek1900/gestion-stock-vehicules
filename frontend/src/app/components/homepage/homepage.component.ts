import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    RouterModule,
    MatButtonModule,
    NgIf,
  ],
})
export class HomepageComponent {
  prenom: string = '';
  nom: string = '';
  role: string = '';

  getRoleLabel(role: string): string {
    switch (role) {
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

  constructor() {
    const token = localStorage.getItem('token');
    if (token) {
      const jwtHelper = new JwtHelperService();
      const decodedToken = jwtHelper.decodeToken(token);
      this.prenom = decodedToken.prenom;
      this.nom = decodedToken.nom;
      this.role = decodedToken.role.replace('ROLE_', '');
      console.log('Role décodé :', this.role);
    }
  }
}
