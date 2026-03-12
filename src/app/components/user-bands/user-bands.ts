import { Component, inject, signal, effect } from '@angular/core';
import { UserBandsService } from '../../services/user-bands';
import { Band } from '../../models/Band';

@Component({
  selector: 'app-user-bands',
  templateUrl: './user-bands.html',
  styleUrls: ['./user-bands.css'],
})
export class UserBands {
  readonly userBandsService = inject(UserBandsService);
  readonly searchQuery = signal('');
  private searchTimeout: any;

  private searchEffect = effect(() => {
    const query = this.searchQuery();
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      if (query.trim()) {
        this.userBandsService.onSearch(query);
      } else {
        this.userBandsService.loadUserBands();
      }
    }, 400);
  });

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  selectBand(band: Band): void {
    this.userBandsService.selectBand(band);
  }

  deleteBand(id: string): void {
    this.userBandsService.deleteUserBand(id);
  }

  openModal(): void {
    this.userBandsService.openModal();
  }

  closeModal(): void {
    this.userBandsService.closeModal();
  }
}
