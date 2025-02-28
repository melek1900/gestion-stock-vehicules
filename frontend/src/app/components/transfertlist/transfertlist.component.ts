import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StatutTransfert } from '../../models/statut-transfert.enum';

@Component({
  selector: 'app-transfert-list',
  templateUrl: './transfertList.component.html',
  styleUrls: ['./transfertList.component.scss'],
})
export class TransfertListComponent implements OnInit {
  transferts: any[] = [];
  StatutTransfert = StatutTransfert;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.chargerTransferts();
  }

  chargerTransferts() {
    this.http.get<any[]>('http://localhost:8080/api/transferts').subscribe(
      (data) => {
        this.transferts = data.filter(transfert => transfert.statut === 'En transit'); // ✅ Filtre uniquement les transferts "En transit"
      },
      (error) => console.error('❌ Erreur lors du chargement des transferts:', error)
    );
  }

  receptionnerTransfert(transfertId: number) {
    this.http.put(`http://localhost:8080/api/transferts/receptionner/${transfertId}`, {})
      .subscribe(() => {
        console.log("✅ Transfert réceptionné avec succès !");
        this.chargerTransferts();
      }, error => console.error("❌ Erreur lors de la réception du transfert :", error));
  }
  
}
