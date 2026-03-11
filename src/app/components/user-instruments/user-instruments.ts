import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { InstrumentsService } from '../../services/instruments-service';
import { UserInstrumentsService } from '../../services/user-instruments-service';
import { Instrument } from '../../models/Instrument';
import { UserTheory } from '../user-theory/user-theory';

@Component({
  selector: 'app-user-instruments',
  imports: [UserTheory],
  templateUrl: './user-instruments.html',
  styleUrl: './user-instruments.css',
})
export class UserInstruments implements OnInit {
  private readonly instrumentService = inject(InstrumentsService);
  private readonly userInstrumentService = inject(UserInstrumentsService);
  readonly userInstruments = this.userInstrumentService.userInstrumentSignal;
  readonly isLoading = this.userInstrumentService.loadingSignal;

  isModalOpen = signal(false);
  searchQuery = signal('');

  filteredInstruments = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.instrumentService.instrumentsSignal();
    return this.instrumentService
      .instrumentsSignal()
      .filter((i) => i.instrument_name.toLowerCase().includes(q));
  });

  ngOnInit() {
    this.userInstrumentService.loadUserInstruments();
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  selectInstrument(instrument: Instrument): void {
    this.userInstrumentService.addUserInstrument(instrument.id, 'Beginner');
    this.closeModal();
  }
  updateInstrumentLevel(userInstrumentId: string, event: Event): void {
    const level = (event.target as HTMLSelectElement).value;
    this.userInstrumentService.updateInstrumentLevel(userInstrumentId, level);
  }
  deleteInstrument(id: string): void {
    this.userInstrumentService.deleteUserInstrument(id);
  }

  onLevelChange(id: string, level: string) {
    this.userInstrumentService.updateLevel(id, level);
  }

  openModal() {
    this.searchQuery.set('');
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.searchQuery.set('');
  }
}
