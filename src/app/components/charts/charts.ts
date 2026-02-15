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

  private calendarService = inject(CalendarService);

  private chartsReady = signal<boolean>(false);
  private barChartInstance?: Chart<'bar'>;
  private lineChartInstance?: Chart<'line'>;

  private months: string[] = [
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

  private data: number[] = Array(12).fill(0);

  chartConfigBar = {
    type: 'bar' as const,
    data: {
      labels: this.months,
      datasets: [
        {
          label: 'Events',
          data: this.data,
        },
      ],
    },
  };

  chartConfigLine = {
    type: 'line' as const,
    data: {
      labels: this.months,
      datasets: [
        {
          label: 'Events',
          data: this.data,
        },
      ],
    },
  };

  constructor() {
    effect(() => {
      const events = this.calendarService.eventsSignal();
      if (!this.chartsReady()) return;

      this.updateCharts();
    });
  }

  ngAfterViewInit(): void {
    this.barChartInstance = new Chart(this.barChart.nativeElement, this.chartConfigBar);
    this.lineChartInstance = new Chart(this.lineChart.nativeElement, this.chartConfigLine);
    this.chartsReady.set(true);
  }

  private updateCharts(): void {
    const events = this.calendarService.eventsSignal();
    const eventsByMonth = events.reduce<Record<number, number>>((acc, event) => {
      const month = new Date(event.date).getMonth();
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    this.data = this.months.map((_, i) => eventsByMonth[i] || 0);

    [this.barChartInstance, this.lineChartInstance].forEach((chart) => {
      if (chart && chart.data.datasets.length > 0) {
        chart.data.datasets[0].data = this.data;
        chart.update();
      }
    });
  }
}
