import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface SousParc {
  id?: number;
  nom: string;
}

@Injectable({
  providedIn: 'root'
})
export class SousParcService {

  private apiUrl = 'http://localhost:8080/api/sous-parcs';

  constructor(private http: HttpClient) {}

  getAll(): Observable<SousParc[]> {
    return this.http.get<SousParc[]>(`${this.apiUrl}/by-parc-nom/CARROSSERIE`);
  }

  create(sousParc: SousParc): Observable<SousParc> {
    return this.http.post<SousParc>(this.apiUrl, sousParc);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
