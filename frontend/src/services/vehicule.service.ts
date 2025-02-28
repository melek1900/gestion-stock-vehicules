import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Vehicule {
  id: number;
  modele: string;
  numeroChassis: string;
  couleur: string;
  dateArrivee: string;
  provenance: string;
  statut: string;
}

@Injectable({ providedIn: 'root' })
export class VehiculeService {
  private apiUrl = 'http://localhost:8080/api/vehicules';

  constructor(private http: HttpClient) {}

  getVehicules(): Observable<Vehicule[]> {
    return this.http.get<Vehicule[]>(this.apiUrl);
  }
}
