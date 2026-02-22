import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Map } from './map';
import { LocationService } from '../../services/location-service';

vi.mock('leaflet', () => {
  const layerGroup = vi.fn(() => ({
    clearLayers: vi.fn(),
    addTo: vi.fn(),
  }));

  const icon = vi.fn(() => ({}));
  const marker = vi.fn(() => ({ addTo: vi.fn(), bindTooltip: vi.fn(), on: vi.fn() }));
  const map = vi.fn(() => ({
    on: vi.fn(),
    invalidateSize: vi.fn(),
  }));
  const tileLayer = vi.fn(() => ({ addTo: vi.fn() }));
  const DomEvent = { stopPropagation: vi.fn() };

  return {
    default: { layerGroup, icon, marker, map, tileLayer, DomEvent },
    layerGroup,
    icon,
    marker,
    map,
    tileLayer,
    DomEvent,
  };
});

const mockLocationService = {
  locationsSignal: signal([]),
  addLocation: vi.fn(),
  editLocation: vi.fn(),
  deleteLocation: vi.fn(),
};

describe('Map Component', () => {
  let component: Map;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [Map],
      providers: [{ provide: LocationService, useValue: mockLocationService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Map);
    component = fixture.componentInstance;
  });

  describe('toggleFilter', () => {
    it('should remove a category that is already active', () => {
      component.activeFilters.set(['show', 'rehearsalspace']);
      component.toggleFilter('show');
      expect(component.activeFilters()).toEqual(['rehearsalspace']);
    });

    it('should add a category that is not active', () => {
      component.activeFilters.set([]);
      component.toggleFilter('show');
      expect(component.activeFilters()).toContain('show');
    });

    it('should not duplicate a category if toggled twice', () => {
      component.activeFilters.set([]);
      component.toggleFilter('show');
      component.toggleFilter('show');
      expect(component.activeFilters()).not.toContain('show');
    });
  });

  describe('saveLocation', () => {
    it('should call addLocation with correct data when all fields are set', () => {
      (component as any).clickCoordinates.set({ lat: 40.4, lng: -3.7 });
      component.nameInput.set('Venue');
      component.categoryInput.set('show');
      component.descriptionInput.set('Test place');

      component.saveLocation();

      expect(mockLocationService.addLocation).toHaveBeenCalledWith({
        lat: 40.4,
        lng: -3.7,
        name: 'Venue',
        description: 'Test place',
        category: 'show',
      });
    });

    it('should clear the form after saving', () => {
      (component as any).clickCoordinates.set({ lat: 40.4, lng: -3.7 });
      component.nameInput.set('Venue');
      component.categoryInput.set('show');

      component.saveLocation();

      expect(component.nameInput()).toBe('');
      expect(component.categoryInput()).toBe('');
      expect(component.locationModalActive()).toBe(false);
    });

    it('should not call addLocation if coordinates are missing', () => {
      (component as any).clickCoordinates.set(null);
      component.nameInput.set('Venue');
      component.categoryInput.set('show');

      component.saveLocation();

      expect(mockLocationService.addLocation).not.toHaveBeenCalled();
    });

    it('should not call addLocation if name is missing', () => {
      (component as any).clickCoordinates.set({ lat: 40.4, lng: -3.7 });
      component.nameInput.set('');
      component.categoryInput.set('show');

      component.saveLocation();

      expect(mockLocationService.addLocation).not.toHaveBeenCalled();
    });

    it('should not call addLocation if category is missing', () => {
      (component as any).clickCoordinates.set({ lat: 40.4, lng: -3.7 });
      component.nameInput.set('Venue');
      component.categoryInput.set('');

      component.saveLocation();

      expect(mockLocationService.addLocation).not.toHaveBeenCalled();
    });
  });

  describe('editSavedLocation', () => {
    it('should call editLocation with updated data', () => {
      component.selectedLocation.set({
        _id: 'loc1',
        lat: 40.4,
        lng: -3.7,
        name: 'Old',
        description: 'Old desc',
        category: 'show',
      });
      (component as any).clickCoordinates.set({ lat: 41.0, lng: -4.0 });
      component.nameInput.set('New name');
      component.descriptionInput.set('New desc');
      component.categoryInput.set('rehearsalspace');

      component.editSavedLocation();

      expect(mockLocationService.editLocation).toHaveBeenCalledWith({
        _id: 'loc1',
        lat: 41.0,
        lng: -4.0,
        name: 'New name',
        description: 'New desc',
        category: 'rehearsalspace',
      });
    });

    it('should fall back to the original coordinates if clickCoordinates is null', () => {
      component.selectedLocation.set({
        _id: 'loc1',
        lat: 40.4,
        lng: -3.7,
        name: 'Old',
        description: '',
        category: 'show',
      });
      (component as any).clickCoordinates.set(null);
      component.nameInput.set('Updated');
      component.descriptionInput.set('');
      component.categoryInput.set('show');

      component.editSavedLocation();

      expect(mockLocationService.editLocation).toHaveBeenCalledWith(
        expect.objectContaining({ lat: 40.4, lng: -3.7 }),
      );
    });

    it('should not call editLocation if no location is selected', () => {
      component.selectedLocation.set(null);

      component.editSavedLocation();

      expect(mockLocationService.editLocation).not.toHaveBeenCalled();
    });
  });

  describe('deleteLocation', () => {
    it('should call deleteLocation with the correct id', () => {
      component.selectedLocation.set({
        _id: 'loc1',
        lat: 0,
        lng: 0,
        name: '',
        description: '',
        category: '',
      });

      component.deleteLocation();

      expect(mockLocationService.deleteLocation).toHaveBeenCalledWith('loc1');
    });

    it('should clear the form after deleting', () => {
      component.selectedLocation.set({
        _id: 'loc1',
        lat: 0,
        lng: 0,
        name: '',
        description: '',
        category: '',
      });

      component.deleteLocation();

      expect(component.selectedLocation()).toBeNull();
      expect(component.editLocationModalActive()).toBe(false);
    });

    it('should not call deleteLocation if no location is selected', () => {
      component.selectedLocation.set(null);

      component.deleteLocation();

      expect(mockLocationService.deleteLocation).not.toHaveBeenCalled();
    });
  });

  describe('input handlers', () => {
    it('should update nameInput signal', () => {
      const event = { target: { value: 'My venue' } } as unknown as Event;
      component.onNameInput(event);
      expect(component.nameInput()).toBe('My venue');
    });

    it('should update descriptionInput signal', () => {
      const event = { target: { value: 'Some description' } } as unknown as Event;
      component.onDescriptionInput(event);
      expect(component.descriptionInput()).toBe('Some description');
    });

    it('should update categoryInput signal', () => {
      const event = { target: { value: 'rehearsalspace' } } as unknown as Event;
      component.onCategoryChange(event);
      expect(component.categoryInput()).toBe('rehearsalspace');
    });
  });
});
