import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle,
  ApexDataLabels,
  ApexPlotOptions,
  ApexOptions
} from 'ng-apexcharts';
import { ScrollAnimateDirective } from './scroll-animate.directive';

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
    ScrollAnimateDirective
  ],
  templateUrl: './dashboard-statistiques.component.html',
  styleUrls: ['./dashboard-statistiques.component.scss']
})
export class DashboardStatistiquesComponent implements OnInit {
  stats: { parc: string; count: number }[] = [];
  totalVehicules: number = 0;
  statutVehiculeStats: { statut: string, label: string, color: string, count: number }[] = [];
  ordreStatuts: { statut: string, count: number, color: string }[] = [];

  
  readonly COLORS = ['#1c1c1c', '#6e6e6e', '#F4A300', '#e74c3c', '#8e44ad', '#2c3e50'];
  readonly chartColors = ['#1c1c1c', '#6e6e6e', '#F4A300', '#e74c3c', '#8e44ad', '#2c3e50'];

  chartOptions: ApexOptions = {
    series: [],
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: true,
        tools: {
          download: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      },
      animations: {
        enabled: true,
        animateGradually: { enabled: true, delay: 150 },
        dynamicAnimation: { enabled: true, speed: 350 }
      },
      zoom: {
        enabled: true,
        type: 'xy',
        zoomedArea: {
          fill: { color: '#90CAF9', opacity: 0.4 },
          stroke: { color: '#0D47A1', opacity: 0.4, width: 1 }
        }
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
        barHeight: '30%',
        colors: {
          backgroundBarColors: ['#f0f0f0'],
          backgroundBarOpacity: 0.2
        }
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
    colors: ['#1c1c1c', '#F4A300', '#e74c3c', '#6e6e6e'],
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      onItemClick: { toggleDataSeries: true },
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
    colors: this.chartColors
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
    colors: this.chartColors
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
 
    this.loadStatutVehiculeStats(headers);
    this.loadOrdreMissionStatuts(headers);
    this.loadStockParcParMarque(headers);
  


    this.http.get<any[]>('http://172.20.10.8:8080/api/vehicules/statistiques/par-parc', { headers })
      .subscribe(data => {
        this.stats = data;
        this.totalVehicules = data.reduce((sum, parc) => sum + parc.count, 0);
        this.chartOptions = {
          ...this.chartOptions,
          series: [{ name: 'Véhicules', data: data.map(p => p.count) }],
          xaxis: { categories: data.map(p => p.parc) }
        };
      });

    this.http.get<any[]>('http://172.20.10.8:8080/api/vehicules/statistiques/par-marque', { headers })
      .subscribe(data => {
        this.marqueChartOptions = {
          ...this.marqueChartOptions,
          series: [{ name: 'Véhicules par marque', data: data.map(p => p.count) }],
          xaxis: { categories: data.map(p => p.marque) }
        };
      });

    this.loadStockParcParMarque(headers);
  }

  loadStatutVehiculeStats(headers: any) {
    this.http.get<{ [key: string]: number }>('http://172.20.10.8:8080/api/vehicules/statistiques/par-statut', { headers })
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
    this.http.get<{ [key: string]: number }>('http://172.20.10.8:8080/api/ordres-mission/statistiques/statut', { headers })
      .subscribe(data => {
        const couleurs: Record<string, string> = {
          EN_COURS: '#F4A300',
          CLOTURE: '#4CAF50',
          PARTIELLE: '#e74c3c'
        };

        this.ordreStatuts = Object.entries(data).map(([statut, count]) => ({
          statut,
          count,
          color: couleurs[statut] || '#ccc'
        }));
      });
  }

  loadStockParcParMarque(headers: any) {
    this.http.get<StockParcParMarque[]>('http://172.20.10.8:8080/api/vehicules/statistiques/stock-parc-par-marque', { headers })
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

        this.stockParcParMarqueChartOptions = {
          ...this.stockParcParMarqueChartOptions,
          xaxis: { categories: marques },
          series: series
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