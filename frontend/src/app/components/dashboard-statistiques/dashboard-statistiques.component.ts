import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import {
  NgApexchartsModule,
  ApexOptions
} from 'ng-apexcharts';
import { ScrollAnimateDirective } from './scroll-animate.directive';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';

interface StockParcParMarque {
  marque: string;
  parc: string;
  count: number;
}

@Component({
  selector: 'app-dashboard-statistiques',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    NgApexchartsModule,
    ScrollAnimateDirective,
    FormsModule,
    MatSelectModule
  ],
  templateUrl: './dashboard-statistiques.component.html',
  styleUrls: ['./dashboard-statistiques.component.scss']
})
export class DashboardStatistiquesComponent implements OnInit {
  stats: { parc: string; count: number }[] = [];
  totalVehicules: number = 0;
  statutVehiculeStats: { statut: string, label: string, color: string, count: number }[] = [];
  ordreStatuts: { statut: string, count: number, color: string }[] = [];
  selectedMarque: string = 'ISUZU'; 
  marquesDisponibles: string[] = ['GM', 'ISUZU', 'CHEVROLET'];
  selectedMarques: string[] = ['GM', 'ISUZU','CHEVROLET']; 
  marquesConcurDisponibles: string[] = ['ASTRA', 'BMW', 'CHANA', 'FORD', 'MERCEDES', 'TOYOTA']; // à adapter
  selectedMarquesConcur: string[] = [...this.marquesConcurDisponibles];
  readonly parcColors = ['#0073A8', '#003366', '#F4A300', '#e74c3c', '#8e44ad', '#A4B0BE'];
  readonly chartColors = ['#0073A8', '#003366', '#F4A300', '#e74c3c', '#8e44ad', '#A4B0BE', '#00b894', '#6c5ce7'];
  readonly concurColorMap: Record<string, string> = {
    'ASTRA': '#FF5733',
    'BMW': '#2980B9',
    'CHANA': '#D35400',
    'FORD': '#2ECC71',
    'MERCEDES': '#8E44AD',
    'TOYOTA': '#AAB7B8'
  };
  genreNosChartOptions: ApexOptions = {
    series: [],
    chart: {
      type: 'bar',
      height: 350,
      stacked: false
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%'
      }
    },
    xaxis: {
      categories: []
    },
    title: {
      text: 'Ventes par genre - Nos marques',
      align: 'center'
    },
    dataLabels: {
      enabled: true
    },
    legend: {
      position: 'bottom',
      labels: {
        colors: [] 
      }
    },
    colors: []
  };
  onConcurMarquesChange(): void {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
  
    const colorMap: Record<string, string> = {
      'ASTRA': '#8e44ad',
      'BMW': '#2980b9',
      'CHANA': '#f39c12',
      'FORD': '#d35400',
      'MERCEDES': '#2c3e50',
      'TOYOTA': '#16a085'
    };
  
    const selected = this.selectedMarquesConcur;
    const colors = selected.map(marque => colorMap[marque] || '#A4B0BE');
  
    // Si rien n’est sélectionné, on affiche une carte vide
    if (selected.length === 0) {
      this.genreConcurChartOptions = {
        ...this.genreConcurChartOptions,
        series: [],
        xaxis: { categories: [] },
        colors,
        title: {
          text: 'Ventes par genre - Concurrence',
          align: 'center'
        }
      };
      return;
    }
  
    this.http.get<any[]>(`http://localhost:8080/api/ventes-general/par-genre-par-marque?marques=${selected.join(',')}`, { headers })
      .subscribe(data => {
        const filtered = data.filter(d => selected.includes(d.marque));
        const genres = [...new Set(filtered.map(d => d.genre))];
        const categories = [...genres, 'Total Résultat'];
  
        const series = selected.map(marque => {
          const dataByGenre = genres.map(genre => {
            const match = filtered.find(d => d.marque === marque && d.genre === genre);
            return match ? match.total : 0;
          });
          const total = dataByGenre.reduce((acc, val) => acc + val, 0);
          return {
            name: marque,
            data: [...dataByGenre, total]
          };
        });
  
        this.genreConcurChartOptions = {
          ...this.genreConcurChartOptions,
          series,
          xaxis: { categories },
          colors,
          title: {
            text: 'Ventes par genre - Concurrence',
            align: 'center'
          },
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: '70%'
            }
          },
          legend: {
            position: 'bottom',
            labels: {
              colors
            }
          }
        };
      });
  }
  
  onNosMarquesChange(): void {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
  
    const colorMap: Record<string, string> = {
      'CHEVROLET': '#9E9E9E',
      'ISUZU': '#0073A8',  
      'GM': '#000000'     
    };
    const colors = this.selectedMarques.map(marque => colorMap[marque] || '#A4B0BE');
  
    this.http.get<any[]>('http://localhost:8080/api/ventes-general/par-genre-par-marque?marques=' + this.selectedMarques.join(','), { headers })
      .subscribe(data => {
        const filtered = data.filter(d => this.selectedMarques.includes(d.marque));
        const genres = [...new Set(filtered.map(d => d.genre))];
        const categories = [...genres, 'Total Résultat'];
  
        const series = this.selectedMarques.map(marque => {
          const dataByGenre = genres.map(genre => {
            const match = filtered.find(d => d.marque === marque && d.genre === genre);
            return match ? match.total : 0;
          });
          const total = dataByGenre.reduce((acc, val) => acc + val, 0);
          return {
            name: marque,
            data: [...dataByGenre, total]
          };
        });
  
        this.genreNosChartOptions = {
          ...this.genreNosChartOptions,
          series,
          xaxis: { categories },
          colors,
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: '70%'
            }
          },
          legend: {
            ...this.genreNosChartOptions.legend,
            labels: {
              colors
            }
          }
        };
      });
  }
  
  
  genreConcurChartOptions: ApexOptions = {
    series: [],
    chart: {
      type: 'bar',
      height: 350,
      stacked: false
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '100%'
      }
    },
    xaxis: {
      categories: []
    },
    title: {
      text: 'Ventes par genre - Concurrence',
      align: 'center'
    },
    dataLabels: {
      enabled: true
    },
    legend: {
      position: 'bottom',
      labels: {
        colors: []
      }
    },
    colors: []
  };
    baseGenreChartOptions: ApexOptions = {
    chart: { type: 'bar', height: 350 },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 6,
        columnWidth: '40%'
      }
    },
    dataLabels: { enabled: true },
    xaxis: { categories: [] },
    colors: ['#0073A8', '#F4A300', '#e74c3c', '#2ecc71', '#8e44ad']
  };

  venteParModelePieChartOptions: ApexOptions = {
    series: [],
    chart: {
      type: 'pie',
      width: 400
    },
    labels: [],
    title: {
      text: 'Répartition des ventes par modèle',
      align: 'center'
    },
    dataLabels: {
      enabled: true
    },
    legend: {
      position: 'bottom'
    },
    colors: ['#0073A8', '#F4A300', '#e74c3c', '#2ecc71', '#8e44ad']
  };
  chartOptions: ApexOptions = {
    series: [],
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: true
      },
      animations: {
        enabled: true,
        animateGradually: { enabled: true, delay: 150 },
        dynamicAnimation: { enabled: true, speed: 350 }
      },
      zoom: {
        enabled: true
      },
      foreColor: '#333'
    },
    grid: {
      show: true,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: false } }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        barHeight: '30%'
      }
    },
    xaxis: {
      categories: [],
      labels: {
        style: {
          colors: '#333',
          fontSize: '14px'
        }
      }
    },
    title: {
      text: 'Stock par parcs',
      align: 'center'
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '13px',
        colors: ['#FFF']
      }
    },
    colors: [],
    legend: {
      show: true,
      position: 'bottom',
      labels: { colors: '#333' }
    }
  };

  marqueChartOptions: ApexOptions = {
    series: [],
    chart: {
      type: 'bar',
      height: 350,
      background: '#ffffff'
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        barHeight: '30%'
      }
    },
    xaxis: {
      categories: []
    },
    title: {
      text: 'Stock par marque',
      align: 'center'
    },
    dataLabels: {
      enabled: true
    },
    colors: []
  };

  stockParcParMarqueChartOptions: ApexOptions = {
    series: [],
    chart: {
      type: 'bar',
      height: 350,
      stacked: false,
      background: '#ffffff',
      toolbar: {
        show: true
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '40%'
      }
    },
    xaxis: {
      categories: []
    },
    dataLabels: {
      enabled: true
    },
    title: {
      text: 'Stock parc par marque',
      align: 'center'
    },
    colors: [],
    legend: {
      show: true,
      position: 'bottom',
      labels: { colors: '#003366' }
    }
  };

  constructor(private http: HttpClient) {}
  onMarqueChange(): void {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
  
    this.http.get<any[]>(`http://localhost:8080/api/ventes/statistiques/par-modele?marque=${this.selectedMarque}`, { headers })
      .subscribe(data => {
        if (data.length > 0) {
          this.venteParModelePieChartOptions = {
            ...this.venteParModelePieChartOptions,
            series: data.map(item => item.total),
            labels: data.map(item => item.modele)
          };
        } else {
          // 🎯 Affiche une carte vide avec un seul label "Aucune vente"
          this.venteParModelePieChartOptions = {
            ...this.venteParModelePieChartOptions,
            series: [0],
            labels: ['Aucune vente']
          };
        }
      });
  }
  ngOnInit(): void {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    this.onMarqueChange();
    this.loadStatutVehiculeStats(headers);
    this.loadOrdreMissionStatuts(headers);
    this.loadStockParcParMarque(headers);
    this.onNosMarquesChange();
    this.onConcurMarquesChange();


    this.http.get<any[]>('http://localhost:8080/api/vehicules/statistiques/par-parc', { headers })
      .subscribe(data => {
        this.stats = data;
        this.totalVehicules = data.reduce((sum, parc) => sum + parc.count, 0);

        const colorsPerBar = data.map((_, i) => this.parcColors[i % this.parcColors.length]);

        this.chartOptions = {
          ...this.chartOptions,
          series: [{
            name: 'Véhicules',
            data: data.map(p => p.count)
          }],
          xaxis: { categories: data.map(p => p.parc) },
          colors: colorsPerBar
        };
      });

    this.http.get<any[]>('http://localhost:8080/api/vehicules/statistiques/par-marque', { headers })
      .subscribe(data => {
        const colorsPerBar = data.map((_, i) => this.parcColors[i % this.parcColors.length]);

        this.marqueChartOptions = {
          ...this.marqueChartOptions,
          series: [{
            name: 'Véhicules par marque',
            data: data.map(p => p.count)
          }],
          xaxis: { categories: data.map(p => p.marque) },
          colors: colorsPerBar
        };
      });

      
  }

  loadStatutVehiculeStats(headers: any) {
    this.http.get<{ [key: string]: number }>('http://localhost:8080/api/vehicules/statistiques/par-statut', { headers })
      .subscribe(data => {
        const mapping: Record<string, { label: string; color: string }> = {
          EN_ETAT: { label: 'En état', color: '#4CAF50' },
          AVARIE: { label: 'En avarie', color: '#F44336' },
          RESERVE: { label: 'Réservé', color: '#F4A300' },
          LIVRE: { label: 'Livré', color: '#9E9E9E' },
          VENDU: { label: 'Vendu', color: '#616161' }
        };

        this.statutVehiculeStats = Object.entries(data).map(([statut, count]) => ({
          statut,
          label: mapping[statut]?.label || statut,
          color: mapping[statut]?.color || '#000',
          count
        }));
      });
  }

  loadOrdreMissionStatuts(headers: any) {
    this.http.get<{ [key: string]: number }>('http://localhost:8080/api/ordres-mission/statistiques/statut', { headers })
      .subscribe(data => {
        const couleurs: Record<string, string> = {
          EN_COURS: '#0073A8',
          CLOTURE: '#A4B0BE',
          PARTIELLE: '#9E9E9E'
        };

        this.ordreStatuts = Object.entries(data).map(([statut, count]) => ({
          statut,
          count,
          color: couleurs[statut] || '#ccc'
        }));
      });
  }

  loadStockParcParMarque(headers: any) {
    this.http.get<StockParcParMarque[]>('http://localhost:8080/api/vehicules/statistiques/stock-parc-par-marque', { headers })
      .subscribe(data => {
        const marques = [...new Set(data.map(d => d.marque))];
        const parcs = [...new Set(data.map(d => d.parc))];

        const series = parcs.map(parc => ({
          name: parc,
          data: marques.map(marque => {
            const match = data.find(d => d.marque === marque && d.parc === parc);
            return match ? match.count : 0;
          })
        }));

        const colorsByParc = parcs.map((_, index) => this.parcColors[index % this.parcColors.length]);

        this.stockParcParMarqueChartOptions = {
          ...this.stockParcParMarqueChartOptions,
          xaxis: { categories: marques },
          series: series,
          colors: colorsByParc,
          legend: {
            show: true,
            position: 'bottom',
            labels: { colors: '#003366' }
          }
        };
      });
  }

  hasParcData(): boolean {
    return Array.isArray(this.chartOptions.series) &&
      this.chartOptions.series.length > 0 &&
      typeof this.chartOptions.series[0] === 'object' &&
      'data' in this.chartOptions.series[0] &&
      Array.isArray((this.chartOptions.series[0] as any).data);
  }

  hasMarqueData(): boolean {
    return Array.isArray(this.marqueChartOptions.series) &&
      this.marqueChartOptions.series.length > 0 &&
      typeof this.marqueChartOptions.series[0] === 'object' &&
      'data' in this.marqueChartOptions.series[0] &&
      Array.isArray((this.marqueChartOptions.series[0] as any).data);
  }
}
