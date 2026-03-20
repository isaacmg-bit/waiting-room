import { Injectable, signal, inject, viewChild, computed } from '@angular/core';
import { SupabaseService } from './supabase-service';
import { CalendarService } from './calendar-service';
import { Chart } from 'chart.js';

@Injectable({
  providedIn: 'root',
})
export class ChartService {
  supabase = inject(SupabaseService);
  calendarService = inject(CalendarService);

  readonly totalUsersRegistered = signal<number>(0);
  readonly popularInstrumentData = signal<any[]>([]);
  readonly popularArtistName = signal<string>('');
  readonly totalEventsCount = signal<number>(0);

   barChartInstance?: Chart<'bar'>;
   lineChartInstance?: Chart<'line'>;
   gigsMiniInstance?: Chart<'line'>;
   revMiniInstance?: Chart<'line'>;

  topInstrumentName = computed(() => {
    const data = this.popularInstrumentData();
    return data && data.length > 0 ? data[0].name : '---';
  });

  async loadDashboardStats() {
    await Promise.all([
      this.fetchTotalUsers(),
      this.fetchPopularArtist(),
      this.fetchPopularInstrument(),
    ]);
  }

  async fetchTotalUsers() {
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

  async updateCharts(): Promise<void> {
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

    const { data: usersData, error: usersError } = await this.supabase
      .getClient()
      .from('user_profile')
      .select('created_at');

    const userMonthlyCounts = Array(12).fill(0);

    if (!usersError && usersData) {
      usersData.forEach((user) => {
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
