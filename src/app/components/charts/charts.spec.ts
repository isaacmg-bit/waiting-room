import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Charts } from './charts';
import { CalendarService } from '../../services/calendar-service';

vi.mock('chart.js', () => {
  const mockChartInstance = {
    data: { datasets: [{ data: [] }] },
    update: vi.fn(),
    destroy: vi.fn(),
  };

  const MockChart = vi.fn().mockImplementation(() => mockChartInstance);
  (MockChart as any).register = vi.fn();

  return {
    Chart: MockChart,
    registerables: [],
  };
});

const createMockService = (events = []) => ({
  eventsSignal: signal(events),
});

describe('Charts Component', () => {
  let component: Charts;
  let mockService: ReturnType<typeof createMockService>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockService = createMockService();

    await TestBed.configureTestingModule({
      imports: [Charts],
      providers: [{ provide: CalendarService, useValue: mockService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Charts);
    component = fixture.componentInstance;

    (component as any).barChartInstance = {
      data: { datasets: [{ data: [] }] },
      update: vi.fn(),
    };
    (component as any).lineChartInstance = {
      data: { datasets: [{ data: [] }] },
      update: vi.fn(),
    };
    (component as any).chartsReady.set(true);
  });

  describe('updateCharts', () => {
    it('should return all zeros when there are no events', () => {
      mockService.eventsSignal.set([]);
      (component as any).updateCharts();

      expect((component as any).data).toEqual(Array(12).fill(0));
    });

    it('should count a single event in the correct month', () => {
      mockService.eventsSignal.set([{ date: '2025-03-15' }] as any);
      (component as any).updateCharts();

      const data: number[] = (component as any).data;
      expect(data[2]).toBe(1);
      expect(data.filter((v) => v > 0).length).toBe(1);
    });

    it('should count multiple events in the same month', () => {
      mockService.eventsSignal.set([
        { date: '2025-06-01' },
        { date: '2025-06-15' },
        { date: '2025-06-30' },
      ] as any);
      (component as any).updateCharts();

      expect((component as any).data[5]).toBe(3);
    });

    it('should count events spread across different months', () => {
      mockService.eventsSignal.set([
        { date: '2025-01-10' },
        { date: '2025-06-20' },
        { date: '2025-12-25' },
      ] as any);
      (component as any).updateCharts();

      const data: number[] = (component as any).data;
      expect(data[0]).toBe(1);
      expect(data[5]).toBe(1);
      expect(data[11]).toBe(1);
    });

    it('should call update() on both chart instances', () => {
      mockService.eventsSignal.set([{ date: '2025-04-10' }] as any);
      (component as any).updateCharts();

      expect((component as any).barChartInstance.update).toHaveBeenCalled();
      expect((component as any).lineChartInstance.update).toHaveBeenCalled();
    });

    it('should update datasets data on both chart instances', () => {
      mockService.eventsSignal.set([{ date: '2025-09-05' }] as any);
      (component as any).updateCharts();

      const expected = (component as any).data;
      expect((component as any).barChartInstance.data.datasets[0].data).toEqual(expected);
      expect((component as any).lineChartInstance.data.datasets[0].data).toEqual(expected);
    });

    it('should handle events on the first and last day of the year', () => {
      mockService.eventsSignal.set([{ date: '2025-01-01' }, { date: '2025-12-31' }] as any);
      (component as any).updateCharts();

      const data: number[] = (component as any).data;
      expect(data[0]).toBe(1);
      expect(data[11]).toBe(1);
    });

    it('should handle events from multiple years grouped by month', () => {
      mockService.eventsSignal.set([{ date: '2024-03-10' }, { date: '2025-03-20' }] as any);
      (component as any).updateCharts();

      expect((component as any).data[2]).toBe(2);
    });
  });
});
