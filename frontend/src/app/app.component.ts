import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NgIf } from '@angular/common';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [NavbarComponent, RouterOutlet, SidebarComponent, NgIf],
})
export class AppComponent {
  showNavbar: boolean = false;
  isSidebarOpen: boolean = false;
  userRole: string | null = null; 
  isFullWidth: boolean = false; // ✅ Flag pour détecter si on doit enlever la sidebar

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects || event.url;
        console.log('URL actuelle :', this.router.url);

        // ✅ Vérifie si on est sur une page sans navbar
        this.showNavbar = !(
          url.startsWith('/login') || url.startsWith('/register')
        );
        console.log('Afficher navbar ?', this.showNavbar);

        // ✅ Met à jour le rôle de l'utilisateur et ajuste l'affichage
        this.checkUserRole();

        // ✅ Fermer la sidebar mobile automatiquement
        this.isSidebarOpen = false;
      }
    });
  }
  ngOnInit() {
    setTimeout(() => {
      document.querySelector('.page-container')?.classList.add('visible');
    }, 0);
  }
  checkUserRole() {
    const token = localStorage.getItem('token');
    if (token) {
      const jwtHelper = new JwtHelperService();
      const decodedToken = jwtHelper.decodeToken(token);
      this.userRole = decodedToken.role || null;
  
      // ❌ Masquer la sidebar uniquement pour GESTIONNAIRE ou EXPERT
      this.isFullWidth = 
        this.userRole === 'ROLE_GESTIONNAIRE_STOCK' || 
        this.userRole === 'ROLE_EXPERT';
    } else {
      // ✅ Si aucun token, on affiche par défaut la sidebar
      this.isFullWidth = false;
    }
  }
  
  

  toggleSidebarMobile() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
