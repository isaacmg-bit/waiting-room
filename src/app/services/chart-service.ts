import { Injectable, signal, inject, computed } from '@angular/core';
import { SupabaseService } from './supabase-service';
import { CalendarService } from './calendar-service';
import { Chart } from 'chart.js';

interface InstrumentData {
  name: string;
  count: number;
}

interface UserProfile {
  created_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChartService {
  private readonly supabase = inject(SupabaseService);
  private readonly calendarService = inject(CalendarService);

  readonly totalUsersRegistered = signal<number>(0);
  readonly popularInstrumentData = signal<InstrumentData[]>([]);
  readonly popularArtistName = signal<string>('');
  readonly totalEventsCount = signal<number>(0);

  barChartInstance?: Chart<'bar'>;
  lineChartInstance?: Chart<'line'>;
  gigsMiniInstance?: Chart<'line'>;
  revMiniInstance?: Chart<'line'>;

  readonly topInstrumentName = computed(() => {
    const data = this.popularInstrumentData();
    return data.length > 0 ? data[0].name : '---';
  });

  async loadDashboardStats(): Promise<void> {
    await Promise.all([
      this.fetchTotalUsers(),
      this.fetchPopularArtist(),
      this.fetchPopularInstrument(),
    ]);
  }

  async fetchTotalUsers(): Promise<void> {
    const { count, error } = await this.supabase
      .getClient()
      .from('user_profile')
      .select('*', { count: 'exact', head: true });

    if (!error) {
      this.totalUsersRegistered.set(count || 0);
    }
  }

  private async fetchPopularInstrument(): Promise<void> {
    const { data, error } = await this.supabase.getClient().rpc('get_most_popular_instrument');

    if (!error && data) {
      this.popularInstrumentData.set(data as InstrumentData[]);
    }
  }

  private async fetchPopularArtist(): Promise<void> {
    const { data, error } = await this.supabase.getClient().rpc('get_public_user_bands');

    if (error || !data || !Array.isArray(data)) {
      return;
    }

    const artistData = data as { name: string }[];

    const counts = artistData.reduce(
      (acc: Record<string, number>, item) => {
        const name = item.name?.trim();
        if (name) {
          acc[name] = (acc[name] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    if (sorted.length > 0) {
      this.popularArtistName.set(sorted[0][0]);
    }
  }

  async updateCharts(): Promise<void> {
    const events = this.calendarService.userEventsSignal();
    const publicEvents = this.calendarService.userPublicEventsSignal();

    const allEventsMap = new Map<string, any>();
    publicEvents.forEach((event) => allEventsMap.set(event.id, event));
    events.forEach((event) => allEventsMap.set(event.id, event));

    const allEvents = Array.from(allEventsMap.values());
    const eventMonthlyCounts = Array(12).fill(0);

    allEvents.forEach((event) => {
      if (event.event_date) {
        const month = new Date(event.event_date).getMonth();
        eventMonthlyCounts[month]++;
      }
    });

    const { data: usersData, error: usersError } = await this.supabase
      .getClient()
      .from('user_profile')
      .select('created_at');

    const userMonthlyCounts = Array(12).fill(0);

    if (!usersError && usersData) {
      (usersData as UserProfile[]).forEach((user) => {
        if (user.created_at) {
          const month = new Date(user.created_at).getMonth();
          userMonthlyCounts[month]++;
        }
      });
    }

    const userGrowth = userMonthlyCounts.reduce<number[]>((acc, count, i) => {
      acc[i] = (i === 0 ? 0 : acc[i - 1]) + count;
      return acc;
    }, Array(12).fill(0));

    this.totalEventsCount.set(allEvents.length);
    this.totalUsersRegistered.set(usersData?.length || 0);

    this.refreshChartInstances(eventMonthlyCounts, userGrowth);
  }

  private refreshChartInstances(eventData: number[], growthData: number[]): void {
    if (this.barChartInstance) {
      this.barChartInstance.data.datasets[0].data = eventData;
      this.barChartInstance.update();
    }

    if (this.lineChartInstance) {
      this.lineChartInstance.data.datasets[0].data = growthData;
      this.lineChartInstance.update();
    }

    if (this.gigsMiniInstance) {
      this.gigsMiniInstance.data.datasets[0].data = eventData;
      this.gigsMiniInstance.update();
    }

    if (this.revMiniInstance) {
      this.revMiniInstance.data.datasets[0].data = growthData;
      this.revMiniInstance.update();
    }
  }
}
