import {
  Component,
  viewChild,
  AfterViewInit,
  ElementRef,
  inject,
  effect,
  signal,
} from '@angular/core';
import { Chart, registerables, ChartConfiguration, ChartOptions } from 'chart.js';
import { ChartService } from '../../services/chart-service';

Chart.register(...registerables);

@Component({
  selector: 'app-charts',
  templateUrl: './charts.html',
  styleUrls: ['./charts.css'],
})
export class Charts implements AfterViewInit {
  readonly chartsService = inject(ChartService);

  private readonly isChartsReady = signal<boolean>(false);

  private readonly barChartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('barChart');
  private readonly lineChartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('lineChart');
  private readonly gigsMiniCanvas = viewChild<ElementRef<HTMLCanvasElement>>('gigsMiniChart');
  private readonly revMiniCanvas = viewChild<ElementRef<HTMLCanvasElement>>('revMiniChart');

  private readonly months: string[] = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  constructor() {
    
    effect(() => {
      if (this.isChartsReady()) {
        this.chartsService.updateCharts();
      }
    });

    this.chartsService.loadDashboardStats();
  }

  ngAfterViewInit(): void {
    this.initializeCharts();
  }

  private initializeCharts(): void {
    const barElement = this.barChartCanvas()?.nativeElement;
    const lineElement = this.lineChartCanvas()?.nativeElement;
    const gigsElement = this.gigsMiniCanvas()?.nativeElement;
    const revElement = this.revMiniCanvas()?.nativeElement;

    if (!barElement || !lineElement || !gigsElement || !revElement) {
      return;
    }

    const commonBarOptions: ChartOptions<'bar'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8' } },
      },
    };

    const commonLineOptions: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8' } },
      },
    };

    const miniLineOptions: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
      scales: {
        x: { display: false },
        y: { display: false },
      },
      elements: {
        point: { radius: 0 },
        line: { borderWidth: 2 },
      },
    };

    const barConfig: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: this.months,
        datasets: [
          {
            label: 'Events',
            data: [],
            backgroundColor: '#38bdf8',
            borderRadius: 6,
          },
        ],
      },
      options: commonBarOptions,
    };

    const lineConfig: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: this.months,
        datasets: [
          {
            label: 'User Growth',
            data: [],
            borderColor: '#10b981',
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
          },
        ],
      },
      options: commonLineOptions,
    };

    const gigsConfig: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: this.months,
        datasets: [
          {
            data: [],
            borderColor: '#38bdf8',
            tension: 0.4,
          },
        ],
      },
      options: miniLineOptions,
    };

    const revConfig: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: this.months,
        datasets: [
          {
            data: [],
            borderColor: '#10b981',
            tension: 0.4,
          },
        ],
      },
      options: miniLineOptions,
    };

    this.chartsService.barChartInstance = new Chart(barElement, barConfig);
    this.chartsService.lineChartInstance = new Chart(lineElement, lineConfig);
    this.chartsService.gigsMiniInstance = new Chart(gigsElement, gigsConfig);
    this.chartsService.revMiniInstance = new Chart(revElement, revConfig);

    this.isChartsReady.set(true);
  }
}
