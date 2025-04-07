import { ApplicationConfig, importProvidersFrom } from '@angular/core';
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
import { ImportVehiculesComponent } from './components/import-vehicules/import-vehicules.component';
import { ReparationComponent } from './components/reparation/reparation.component';
import { ReceptionVehiculesComponent } from './components/reception-vehicules/reception-vehicules.component';
import { TransfertListComponent } from './components/transfertlist/transfertlist.component';
import { OrdreMissionListComponent } from './components/ordre-mission-list/ordre-mission-list.component';
import { PrelevementVehiculeComponent } from './components/prelevement-vehicule/prelevement-vehicule.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ReceptionVehiculesMobileComponent } from './components/reception-vehicules-mobile/reception-vehicules-mobile.component';
import { PrelevementVehiculeMobileComponent } from './components/prelevement-vehicule-mobile/prelevement-vehicule-mobile.component';
import { OrdreMissionListMobileComponent } from './components/ordre-mission-list-mobile/ordre-mission-list-mobile.component';
import { GestionnaireStockDashboardComponent } from './components/gestionnaire-stock-dashboard/gestionnaire-stock-dashboard.component';
import { AddUserComponent } from './components/add-user/add-user.component';
import { ChauffeurComponent } from './components/chauffeur/chauffeur.component';

import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { VeiculeTransportComponent } from './components/veicule-transport/veicule-transport.component';
import { CompteurImportComponent } from './components/compteur-import/compteur-import.component';
import { CompteurOrdreMissionComponent } from './components/compteur-ordre-mission/compteur-ordre-mission.component';
import { CreationAvarieComponent } from './components/creation-avarie/creation-avarie.component';
import { EnregistrerAvarieComponent } from './components/enregistrer-avarie/enregistrer-avarie.component';
import { UtilisateurListComponent } from './components/utilisateur-list/utilisateur-list.component';

const appRoutes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomepageComponent },
  { path: 'reparation', component: ReparationComponent },
  { path: 'vehicules', component: VehiculeListComponent },
  { path: 'ajouter-avarie', component: AvarieFormComponent },
  { path: 'enregistrer-vehicule', component: EnregistrerVehiculeComponent },
  { path: 'demandes-expertise', component: DemandesExpertiseComponent },
  { path: 'import-vehicules', component: ImportVehiculesComponent },
  { path: 'reception-vehicules', component: ReceptionVehiculesComponent },
  { path: 'reception-vehicules-mobile', component: ReceptionVehiculesMobileComponent },
  { path: 'transfert-selection', component: TransfertListComponent },
  { path: 'prelevement-vehicules', component: PrelevementVehiculeComponent },
  { path: 'prelevement-vehicule-mobile', component: PrelevementVehiculeMobileComponent },
  { path: 'ordre-mission', component: OrdreMissionListComponent },
  { path: 'ordre-mission-mobile', component: OrdreMissionListMobileComponent},
  { path: 'gestionnaire-stock-dashboard', component: GestionnaireStockDashboardComponent},
  { path: 'addUser', component: AddUserComponent},
  { path: 'Chauffeur', component: ChauffeurComponent},
  { path: 'compteur-import', component: CompteurImportComponent},
  { path: 'compteur-ordre-mission', component: CompteurOrdreMissionComponent},
  { path: 'voiture-transport', component: VeiculeTransportComponent},
  { path: 'creer-avarie', component: CreationAvarieComponent},
  { path: 'enregistrer-avarie', component: EnregistrerAvarieComponent},
  { path: 'utilisateur-list', component: UtilisateurListComponent},

  { path: '**', redirectTo: 'login', pathMatch: 'full' },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
    provideAnimations(), provideAnimationsAsync(),
    importProvidersFrom(MatNativeDateModule),

    // ✅ Affichage français dans le calendrier
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' }
  ],};
