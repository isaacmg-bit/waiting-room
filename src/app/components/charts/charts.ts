import {
  Component,
  viewChild,
  AfterViewInit,
  ElementRef,
  inject,
  effect,
  signal,
  computed,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { CalendarService } from '../../services/calendar-service';
import { SupabaseService } from '../../services/supabase-service';

Chart.register(...registerables);

@Component({
  selector: 'app-charts',
  templateUrl: './charts.html',
  styleUrls: ['./charts.css'],
})
export class Charts implements AfterViewInit {
  private readonly barChartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('barChart');
  private readonly lineChartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('lineChart');
  private readonly gigsMiniCanvas = viewChild<ElementRef<HTMLCanvasElement>>('gigsMiniChart');
  private readonly revMiniCanvas = viewChild<ElementRef<HTMLCanvasElement>>('revMiniChart');

  private readonly calendarService = inject(CalendarService);
  private readonly supabase = inject(SupabaseService);

  private readonly chartsReady = signal(false);
  readonly totalEventsCount = signal<number>(0);
  readonly totalUsersRegistered = signal<number>(0);
  readonly popularArtistName = signal<string>('');
  readonly popularInstrumentData = signal<any[]>([]);

  readonly topInstrumentName = computed(() => {
    const data = this.popularInstrumentData();
    return data && data.length > 0 ? data[0].name : '---';
  });

  private barChartInstance?: Chart<'bar'>;
  private lineChartInstance?: Chart<'line'>;
  private gigsMiniInstance?: Chart<'line'>;
  private revMiniInstance?: Chart<'line'>;

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
        this.updateCharts();
      }
    });

    this.loadDashboardStats();
  }

  private async loadDashboardStats() {
    await Promise.all([
      this.fetchTotalUsers(),
      this.fetchPopularArtist(),
      this.fetchPopularInstrument(),
    ]);
  }

  private async fetchTotalUsers() {
    const { count, error } = await this.supabase
      .getClient()
      .from('user_profile')
      .select('*', { count: 'exact', head: true });

    if (!error) this.totalUsersRegistered.set(count || 0);
  }

  private async fetchPopularInstrument() {
    const { data, error } = await this.supabase.getClient().rpc('get_most_popular_instrument');
    if (!error && data) this.popularInstrumentData.set(data);
  }

  private async fetchPopularArtist() {
    const { data, error } = await this.supabase.getClient().rpc('get_public_user_bands');
    if (error || !data || !Array.isArray(data)) return;

    const counts = data.reduce((acc: Record<string, number>, item: any) => {
      const name = item.name?.trim();
      if (name) acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) this.popularArtistName.set(sorted[0][0]);
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

    this.barChartInstance = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: this.months,
        datasets: [{ label: 'Events', data: [], backgroundColor: '#38bdf8', borderRadius: 6 }],
      },
      options: commonOptions,
    });

    this.lineChartInstance = new Chart(lineCtx, {
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

    this.gigsMiniInstance = new Chart(gigsCtx, {
      type: 'line',
      data: { labels: this.months, datasets: [{ data: [], borderColor: '#38bdf8', tension: 0.4 }] },
      options: miniOptions as any,
    });

    this.revMiniInstance = new Chart(revCtx, {
      type: 'line',
      data: { labels: this.months, datasets: [{ data: [], borderColor: '#10b981', tension: 0.4 }] },
      options: miniOptions as any,
    });

    this.chartsReady.set(true);
  }

  private updateCharts(): void {
    const events = this.calendarService.userEventsSignal();
    const eventsPublic = this.calendarService.userPublicEventsSignal();

    const allEventsMap = new Map();
    eventsPublic.forEach((e) => allEventsMap.set(e.id, e));
    events.forEach((e) => allEventsMap.set(e.id, e));

    const allEvents = Array.from(allEventsMap.values());

    const eventMonthlyCounts = Array(12).fill(0);

    allEvents.forEach((event) => {
      if (event.event_date) {
        const month = new Date(event.event_date).getMonth();
        eventMonthlyCounts[month]++;
      }
    });

    const totalUsers = this.totalUsersRegistered();
    const userGrowth = Array(12)
      .fill(0)
      .map((_, i) => Math.floor((totalUsers / 12) * (i + 1)));

    this.totalEventsCount.set(allEvents.length);

    if (this.barChartInstance) {
      this.barChartInstance.data.datasets[0].data = eventMonthlyCounts;
      this.barChartInstance.update();
    }
    if (this.lineChartInstance) {
      this.lineChartInstance.data.datasets[0].data = userGrowth;
      this.lineChartInstance.update();
    }
    if (this.gigsMiniInstance) {
      this.gigsMiniInstance.data.datasets[0].data = eventMonthlyCounts;
      this.gigsMiniInstance.update();
    }
    if (this.revMiniInstance) {
      this.revMiniInstance.data.datasets[0].data = userGrowth;
      this.revMiniInstance.update();
    }
  }
}
