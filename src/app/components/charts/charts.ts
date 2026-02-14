import { Component, ViewChild, AfterViewInit, ElementRef, inject, effect } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { CalendarService } from '../../services/calendar-service';

@Component({
  selector: 'app-charts',
  imports: [],
  templateUrl: './charts.html',
  styleUrl: './charts.css',
})
export class Charts implements AfterViewInit {
  @ViewChild('barChart') barChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChart') lineChart!: ElementRef<HTMLCanvasElement>;

  calendarService = inject(CalendarService);

  private barChartInstance: Chart | null = null;
  private lineChartInstance: Chart | null = null;

  chartConfig = {
    type: 'bar' as const,
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Events',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
      ],
    },
  };
  chartConfig2 = {
    type: 'line' as const,
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Events',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
      ],
    },
  };

  constructor() {
    effect(() => {
      this.updateCharts();
    });
  }

  ngAfterViewInit() {
    Chart.register(...registerables);
    this.barChartInstance = new Chart(this.barChart.nativeElement, this.chartConfig);
    this.lineChartInstance = new Chart(this.lineChart.nativeElement, this.chartConfig2);
    this.updateCharts();
  }

  updateCharts() {
    if (!this.barChartInstance || !this.lineChartInstance) return;
    const events = this.calendarService.eventsSignal();
    const eventsByMonth = events.reduce(
      (acc, event) => {
        const month = new Date(event.date).getMonth();
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );
    const data = Array.from({ length: 12 }, (_, i) => eventsByMonth[i] || 0);
    this.barChartInstance!.data.datasets[0].data = data;
    this.lineChartInstance!.data.datasets[0].data = data;
    this.barChartInstance!.update();
    this.lineChartInstance!.update();
  }
}
