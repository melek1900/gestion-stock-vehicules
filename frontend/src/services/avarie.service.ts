import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class AvarieService {
  private apiUrl = 'http://172.20.10.8:8080/api/avaries';

  constructor(private http: HttpClient) {}

  ajouterAvarie(vehiculeId: number, type: string, commentaire: string, photoUrl?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/ajouter`, { vehiculeId, type, commentaire, photoUrl });
  }

  supprimerAvarie(avarieId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/supprimer/${avarieId}`);
  }

  getAvariesByVehicule(vehiculeId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/vehicule/${vehiculeId}`);
  }
}