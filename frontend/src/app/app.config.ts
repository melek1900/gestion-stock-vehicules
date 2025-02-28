import { ApplicationConfig } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { provideHttpClient, withFetch, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HomepageComponent } from './components/homepage/homepage.component';

import { VehiculeListComponent } from './components/vehicule-list/vehicule-list.component';
import { EnregistrerVehiculeComponent } from './components/enregistrer-vehicule/enregistrer-vehicule.component';
import { authInterceptor } from './interceptors/auth.interceptor';
import { AvarieFormComponent } from './components/avarie-form/avarie-form.component';
import { DemandesExpertiseComponent } from './components/demandes-expertise/demandes-expertise.component';


const appRoutes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomepageComponent },
  { path: 'vehicules', component: VehiculeListComponent },
  { path: 'ajouter-avarie', component: AvarieFormComponent },
  { path: 'enregistrer-vehicule', component: EnregistrerVehiculeComponent },
  { path: 'demandes-expertise', component: DemandesExpertiseComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }, // Redirection automatique vers Login
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
    provideAnimations(),
  ],};
