import { Component, inject, signal, effect, OnDestroy } from '@angular/core';
import { UserBandsService } from '../../services/user-bands-service';
import { Band } from '../../models/Band';

@Component({
  selector: 'app-user-bands',
  templateUrl: './user-bands.html',
  styleUrls: ['./user-bands.css'],
})
export class UserBands implements OnDestroy {
  readonly userBandsService = inject(UserBandsService);

  readonly searchInput = signal<string>('');
  private searchTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => {
      const query = this.searchInput().trim();

      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      this.searchTimeout = setTimeout(() => {
        if (query) {
          this.userBandsService.onSearch(query);
        } else {
          this.userBandsService.loadUserBands();
        }
      }, 400);
    });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchInput.set(value);
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

  ngOnDestroy(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }
}
