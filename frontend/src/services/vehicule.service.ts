import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Vehicule {
  production: string;
  peg: string;
  keyCode: string;
  engine: string;
  description: string;
  id: number;
  modele: string;
  numeroChassis: string;
  couleur: string;
  dateArrivee: string;
  provenance: string;
  statut: string;
  parc: { id: number };

}

@Injectable({ providedIn: 'root' })
export class VehiculeService {
  private apiUrl = 'http://192.168.1.121:8080/api/vehicules';

  constructor(private http: HttpClient) {}

  getVehicules(): Observable<Vehicule[]> {
    return this.http.get<Vehicule[]>(this.apiUrl);
  }
}
