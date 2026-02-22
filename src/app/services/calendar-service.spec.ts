import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CalendarService } from './calendar-service';
import { ApiService } from './apiservice';
import { environment } from '../../environments/environment';

const baseUrl = `${environment.apiUrl}${environment.apiEventUrl}`;

const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

describe('CalendarService', () => {
  let service: CalendarService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi.get.mockReturnValue(of([]));

    TestBed.configureTestingModule({
      providers: [CalendarService, { provide: ApiService, useValue: mockApi }],
    });

    service = TestBed.inject(CalendarService);
  });

  describe('loadEvents', () => {
    it('should set eventsSignal with the returned events', () => {
      const events = [{ _id: '1', title: 'Concert', date: '2025-06-01', color: 'red' }];
      mockApi.get.mockReturnValue(of(events));

      service.loadEvents();

      expect(service.eventsSignal()).toEqual(events);
    });

    it('should set loadingSignal to false after loading', () => {
      mockApi.get.mockReturnValue(of([]));
      service.loadEvents();
      expect(service.loadingSignal()).toBe(false);
    });

    it('should set loadingSignal to false on error', () => {
      mockApi.get.mockReturnValue(throwError(() => new Error('Network error')));
      service.loadEvents();
      expect(service.loadingSignal()).toBe(false);
    });
  });

  describe('addEvent', () => {
    it('should append the created event to eventsSignal', () => {
      const existing = { _id: '1', title: 'Existing', date: '2025-01-01', color: 'blue' };
      const newEvent = { _id: '2', title: 'New', date: '2025-06-01', color: 'red' };
      service.eventsSignal.set([existing]);
      mockApi.post.mockReturnValue(of(newEvent));

      service.addEvent({ title: 'New', date: '2025-06-01', color: 'red' });

      expect(service.eventsSignal()).toEqual([existing, newEvent]);
    });

    it('should call the api with the correct url and body', () => {
      mockApi.post.mockReturnValue(of({}));
      const body = { title: 'Concert', date: '2025-06-01', color: 'red' };

      service.addEvent(body);

      expect(mockApi.post).toHaveBeenCalledWith(baseUrl, body);
    });
  });

  describe('deleteEvent', () => {
    it('should remove the deleted event from eventsSignal', () => {
      service.eventsSignal.set([
        { _id: '1', title: 'Keep', date: '2025-01-01', color: 'blue' },
        { _id: '2', title: 'Delete me', date: '2025-06-01', color: 'red' },
      ]);
      mockApi.delete.mockReturnValue(of(null));

      service.deleteEvent('2');

      expect(service.eventsSignal()).toEqual([
        { _id: '1', title: 'Keep', date: '2025-01-01', color: 'blue' },
      ]);
    });

    it('should call the api with the correct url', () => {
      mockApi.delete.mockReturnValue(of(null));
      service.deleteEvent('abc123');
      expect(mockApi.delete).toHaveBeenCalledWith(`${baseUrl}abc123`);
    });
  });

  describe('editEvent', () => {
    it('should replace the updated event in eventsSignal', () => {
      const original = { _id: '1', title: 'Old', date: '2025-01-01', color: 'blue' };
      const updated = { _id: '1', title: 'New', date: '2025-01-01', color: 'green' };
      service.eventsSignal.set([original]);
      mockApi.patch.mockReturnValue(of(updated));

      service.editEvent('1', { title: 'New', color: 'green' });

      expect(service.eventsSignal()).toEqual([updated]);
    });

    it('should call the api with the correct url and body', () => {
      mockApi.patch.mockReturnValue(of({}));
      const body = { title: 'Updated' };

      service.editEvent('abc123', body);

      expect(mockApi.patch).toHaveBeenCalledWith(`${baseUrl}abc123`, body);
    });

    it('should not modify other events when editing one', () => {
      service.eventsSignal.set([
        { _id: '1', title: 'First', date: '2025-01-01', color: 'blue' },
        { _id: '2', title: 'Second', date: '2025-02-01', color: 'red' },
      ]);
      const updated = { _id: '1', title: 'Updated', date: '2025-01-01', color: 'green' };
      mockApi.patch.mockReturnValue(of(updated));

      service.editEvent('1', { title: 'Updated', color: 'green' });

      expect(service.eventsSignal()[1]).toEqual({
        _id: '2',
        title: 'Second',
        date: '2025-02-01',
        color: 'red',
      });
    });
  });
});
