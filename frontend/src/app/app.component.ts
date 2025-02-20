import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [NavbarComponent, RouterOutlet],
})
export class AppComponent {
  showNavbar: boolean = false;

  constructor(private router: Router) {
    // Écoute les changements d'URL
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showNavbar = !(event.url === '/login' || event.url === '/register');
      }
    });
  }
}
