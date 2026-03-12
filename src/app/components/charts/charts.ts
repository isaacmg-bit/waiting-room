import {
  Component,
  viewChild,
  AfterViewInit,
  ElementRef,
  inject,
  effect,
  signal,
  OnDestroy,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { CalendarService } from '../../services/calendar-service';

Chart.register(...registerables);

@Component({
  selector: 'app-charts',
  templateUrl: './charts.html',
  styleUrls: ['./charts.css'],
})
export class Charts implements AfterViewInit, OnDestroy {
  barChart = viewChild<ElementRef<HTMLCanvasElement>>('barChart');
  lineChart = viewChild<ElementRef<HTMLCanvasElement>>('lineChart');

  private readonly calendarService = inject(CalendarService);

  private readonly chartsReady = signal(false);
  private barChartInstance?: Chart<'bar'>;
  private lineChartInstance?: Chart<'line'>;

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
      this.calendarService.eventsSignal();
      if (!this.chartsReady()) return;
      this.updateCharts();
    });
  }

  ngAfterViewInit(): void {
    const initialData = Array(12).fill(0);

    const barCanvas = this.barChart()?.nativeElement;
    const lineCanvas = this.lineChart()?.nativeElement;

    if (!barCanvas || !lineCanvas) return;

    this.barChartInstance = new Chart(barCanvas, {
      type: 'bar',
      data: {
        labels: this.months,
        datasets: [
          {
            label: 'Events',
            data: initialData,
            backgroundColor: 'rgba(var(--color-primary), 0.1)',
            borderColor: 'rgba(var(--color-primary), 1)',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
      },
    });

    this.lineChartInstance = new Chart(lineCanvas, {
      type: 'line',
      data: {
        labels: this.months,
        datasets: [
          {
            label: 'Events',
            data: initialData,
            borderColor: 'rgba(var(--color-primary), 1)',
            backgroundColor: 'rgba(var(--color-primary), 0.05)',
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
      },
    });

    this.chartsReady.set(true);
  }

  private updateCharts(): void {
    const events = this.calendarService.eventsSignal();
    const eventsByMonth = events.reduce<Record<number, number>>((acc, event) => {
      const month = new Date(event.date).getMonth();
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    const data = this.months.map((_, i) => eventsByMonth[i] ?? 0);

    [this.barChartInstance, this.lineChartInstance].forEach((chart) => {
      if (chart?.data.datasets[0]) {
        chart.data.datasets[0].data = data;
        chart.update();
      }
    });
  }

  ngOnDestroy(): void {
    this.barChartInstance?.destroy();
    this.lineChartInstance?.destroy();
  }
}
