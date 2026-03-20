import {
  Component,
  viewChild,
  AfterViewInit,
  ElementRef,
  inject,
  effect,
  signal,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';

import { ChartService } from '../../services/chart-service';

Chart.register(...registerables);

@Component({
  selector: 'app-charts',
  templateUrl: './charts.html',
  styleUrls: ['./charts.css'],
})
export class Charts implements AfterViewInit {
  readonly chartsService = inject(ChartService);

  private readonly chartsReady = signal(false);

  readonly barChartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('barChart');
  readonly lineChartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('lineChart');
  readonly gigsMiniCanvas = viewChild<ElementRef<HTMLCanvasElement>>('gigsMiniChart');
  readonly revMiniCanvas = viewChild<ElementRef<HTMLCanvasElement>>('revMiniChart');

  private readonly months = [
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
      if (this.chartsReady()) {
        this.chartsService.updateCharts();
      }
    });

    this.chartsService.loadDashboardStats();
  }

  ngAfterViewInit(): void {
    this.initCharts();
  }

  private initCharts() {
    const barCtx = this.barChartCanvas()?.nativeElement;
    const lineCtx = this.lineChartCanvas()?.nativeElement;
    const gigsCtx = this.gigsMiniCanvas()?.nativeElement;
    const revCtx = this.revMiniCanvas()?.nativeElement;

    if (!barCtx || !lineCtx || !gigsCtx || !revCtx) return;

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#94a3b8' } } },
    };

    const miniOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: { x: { display: false }, y: { display: false } },
      elements: { point: { radius: 0 }, line: { borderWidth: 2 } },
    };

    this.chartsService.barChartInstance = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: this.months,
        datasets: [{ label: 'Events', data: [], backgroundColor: '#38bdf8', borderRadius: 6 }],
      },
      options: commonOptions,
    });

    this.chartsService.lineChartInstance = new Chart(lineCtx, {
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
      options: commonOptions,
    });

    this.chartsService.gigsMiniInstance = new Chart(gigsCtx, {
      type: 'line',
      data: { labels: this.months, datasets: [{ data: [], borderColor: '#38bdf8', tension: 0.4 }] },
      options: miniOptions as any,
    });

    this.chartsService.revMiniInstance = new Chart(revCtx, {
      type: 'line',
      data: { labels: this.months, datasets: [{ data: [], borderColor: '#10b981', tension: 0.4 }] },
      options: miniOptions as any,
    });

    this.chartsReady.set(true);
  }
}
