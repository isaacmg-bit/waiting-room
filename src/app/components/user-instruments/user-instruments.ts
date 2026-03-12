import { Component, inject, OnInit } from '@angular/core';
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
  readonly userInstrumentService = inject(UserInstrumentsService);

  ngOnInit() {
    this.userInstrumentService.loadUserInstruments();
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.userInstrumentService.onSearch(query);
  }

  selectInstrument(instrument: Instrument): void {
    this.userInstrumentService.selectInstrument(instrument.id);
  }

  updateInstrumentLevel(userInstrumentId: string, event: Event): void {
    const level = (event.target as HTMLSelectElement).value;
    this.userInstrumentService.updateInstrumentLevel(userInstrumentId, level);
  }

  deleteInstrument(id: string): void {
    this.userInstrumentService.deleteUserInstrument(id);
  }

  openModal(): void {
    this.userInstrumentService.openModal();
  }

  closeModal(): void {
    this.userInstrumentService.closeModal();
  }
}
