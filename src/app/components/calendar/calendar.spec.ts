import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Calendar } from './calendar';
import { CalendarService } from '../../services/calendar-service';

vi.mock('@fullcalendar/angular', () => ({
  FullCalendarModule: class {},
  FullCalendarComponent: class {
    getApi() {
      return {
        removeAllEvents: vi.fn(),
        addEvent: vi.fn(),
      };
    }
  },
}));

const mockCalendarService = {
  eventsSignal: signal([]),
  addEvent: vi.fn(),
  editEvent: vi.fn(),
  deleteEvent: vi.fn(),
};

describe('Calendar Component', () => {
  let component: Calendar;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [Calendar],
      providers: [{ provide: CalendarService, useValue: mockCalendarService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Calendar);
    component = fixture.componentInstance;

    (component as any).calendarApi.set({
      removeAllEvents: vi.fn(),
      addEvent: vi.fn(),
    });
  });

  describe('handleDateClick', () => {
    it('should open the modal and store the selected date', () => {
      component.handleDateClick({ dateStr: '2025-06-15' } as any);

      expect(component.calendarModalActive()).toBe(true);
      expect(component.selectedDate()).toBe('2025-06-15');
    });
  });

  describe('handleEventClick', () => {
    it('should open the edit modal and load event data', () => {
      const fakeEvent = {
        event: {
          id: 'abc123',
          title: 'Test event',
          backgroundColor: '#ff0000',
          startStr: '2026-05-18',
        },
      };

      component.handleEventClick(fakeEvent as any);

      expect(component.editCalendarModalActive()).toBe(true);
      expect(component.eventTitle()).toBe('Test event');
      expect(component.eventColor()).toBe('#ff0000');
      expect(component.selectedDate()).toBe('2026-05-18');
      expect(component.selectedEvent()).toBe(fakeEvent.event);
    });

    it('should set an empty string if the event has no backgroundColor', () => {
      const fakeEvent = {
        event: { id: 'x', title: 'Test', backgroundColor: undefined, startStr: '2025-01-01' },
      };

      component.handleEventClick(fakeEvent as any);

      expect(component.eventColor()).toBe('');
    });
  });

  describe('saveEvent', () => {
    it('should call addEvent and clear the form when data is valid', () => {
      component.selectedDate.set('2026-05-18');
      component.eventTitle.set('Show');
      component.eventColor.set('#00ff00');

      component.saveEvent();

      expect(mockCalendarService.addEvent).toHaveBeenCalledWith({
        title: 'Show',
        date: '2026-05-18',
        color: '#00ff00',
      });
      expect(component.calendarModalActive()).toBe(false);
      expect(component.eventTitle()).toBe('');
    });

    it('should not call addEvent if title is missing', () => {
      component.selectedDate.set('2026-05-18');
      component.eventTitle.set('');
      component.eventColor.set('#00ff00');

      component.saveEvent();

      expect(mockCalendarService.addEvent).not.toHaveBeenCalled();
    });

    it('should not call addEvent if color is missing', () => {
      component.selectedDate.set('2026-05-18');
      component.eventTitle.set('Show');
      component.eventColor.set('');

      component.saveEvent();

      expect(mockCalendarService.addEvent).not.toHaveBeenCalled();
    });

    it('should not call addEvent if date is missing', () => {
      component.selectedDate.set('');
      component.eventTitle.set('Show');
      component.eventColor.set('#00ff00');

      component.saveEvent();

      expect(mockCalendarService.addEvent).not.toHaveBeenCalled();
    });
  });

  describe('editEvent', () => {
    it('should call editEvent and clear the form when data is valid', () => {
      component.selectedEvent.set({ id: 'abc123' });
      component.selectedDate.set('2026-05-18');
      component.eventTitle.set('Updated event');
      component.eventColor.set('#0000ff');

      component.editEvent();

      expect(mockCalendarService.editEvent).toHaveBeenCalledWith('abc123', {
        title: 'Updated event',
        date: '2026-05-18',
        color: '#0000ff',
      });
      expect(component.editCalendarModalActive()).toBe(false);
    });

    it('should not call editEvent if no event is selected', () => {
      component.selectedEvent.set(null);
      component.selectedDate.set('2026-05-18');
      component.eventTitle.set('Updated event');
      component.eventColor.set('#0000ff');

      component.editEvent();

      expect(mockCalendarService.editEvent).not.toHaveBeenCalled();
    });

    it('should not call editEvent if fields are empty', () => {
      component.selectedEvent.set({ id: 'abc123' });
      component.eventTitle.set('');
      component.eventColor.set('');
      component.selectedDate.set('');

      component.editEvent();

      expect(mockCalendarService.editEvent).not.toHaveBeenCalled();
    });
  });

  describe('deleteEvent', () => {
    it('should call deleteEvent and clear the form', () => {
      component.selectedEvent.set({ id: 'abc123' });

      component.deleteEvent();

      expect(mockCalendarService.deleteEvent).toHaveBeenCalledWith('abc123');
      expect(component.selectedEvent()).toBeNull();
      expect(component.editCalendarModalActive()).toBe(false);
    });

    it('should not call deleteEvent if no event is selected', () => {
      component.selectedEvent.set(null);

      component.deleteEvent();

      expect(mockCalendarService.deleteEvent).not.toHaveBeenCalled();
    });
  });

  describe('onColorChange and onTitleInput', () => {
    it('should update the color signal', () => {
      const event = { target: { value: '#123456' } } as unknown as Event;
      component.onColorChange(event);
      expect(component.eventColor()).toBe('#123456');
    });

    it('should update the title signal', () => {
      const event = { target: { value: 'New title' } } as unknown as Event;
      component.onTitleInput(event);
      expect(component.eventTitle()).toBe('New title');
    });
  });
});
