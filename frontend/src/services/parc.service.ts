import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParcService {
  private apiUrl = 'http://172.20.10.8:8080/api/parcs'; // ✅ API maintenant disponible

  constructor(private http: HttpClient) {}

  getParcs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }
  
}
