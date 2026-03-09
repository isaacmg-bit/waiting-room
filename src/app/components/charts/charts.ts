import {
  Component,
  ViewChild,
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
  @ViewChild('barChart') barChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChart') lineChart!: ElementRef<HTMLCanvasElement>;

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

    this.barChartInstance = new Chart(this.barChart.nativeElement, {
      type: 'bar',
      data: { labels: this.months, datasets: [{ label: 'Events', data: [...initialData] }] },
    });

    this.lineChartInstance = new Chart(this.lineChart.nativeElement, {
      type: 'line',
      data: { labels: this.months, datasets: [{ label: 'Events', data: [...initialData] }] },
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
