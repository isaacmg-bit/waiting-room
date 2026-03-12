import { Component, inject } from '@angular/core';
import { UserBandsService } from '../../services/user-bands';
import { OnInit } from '@angular/core';
import { Band } from '../../models/Band';

@Component({
  selector: 'app-user-bands',
  imports: [],
  templateUrl: './user-bands.html',
  styleUrl: './user-bands.css',
})
export class UserBands implements OnInit {
  readonly userBandsService = inject(UserBandsService);

  ngOnInit() {
    this.userBandsService.loadUserBands();
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.userBandsService.onSearch(query);
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
