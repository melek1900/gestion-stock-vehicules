import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HomepageComponent } from './components/homepage/homepage.component';
import { HomepageGestionnaireComponent } from './components/homepage-gestionnaire/homepage-gestionnaire.component';
import { HomepageAdminComponent } from './components/homepage-admin/homepage-admin.component';
import { HomepageVendeurComponent } from './components/homepage-vendeur/homepage-vendeur.component';
import { HomepageExpertComponent } from './components/homepage-expert/homepage-expert.component';


const appRoutes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomepageComponent },
  { path: 'admin', component: HomepageAdminComponent },
  { path: 'gestionnaire', component: HomepageGestionnaireComponent },
  { path: 'vendeur', component: HomepageVendeurComponent },
  { path: 'expert', component: HomepageExpertComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }, // Redirection automatique vers Login
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    provideAnimations(),
    AuthInterceptor,
  ],};
