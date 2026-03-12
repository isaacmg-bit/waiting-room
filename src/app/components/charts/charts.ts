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
import { CalendarService } from '../../services/calendar-service';

Chart.register(...registerables);

@Component({
  selector: 'app-charts',
  templateUrl: './charts.html',
  styleUrls: ['./charts.css'],
})
export class Charts implements AfterViewInit {
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
        datasets: [{ label: 'Events', data: [...initialData] }],
      },
    });

    this.lineChartInstance = new Chart(lineCanvas, {
      type: 'line',
      data: {
        labels: this.months,
        datasets: [{ label: 'Events', data: [...initialData] }],
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
      if (chart?.data.datasets.length) {
        chart.data.datasets[0].data = data;
        chart.update();
      }
    });
  }
}
