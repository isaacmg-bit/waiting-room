import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderService } from '../../services/header-service';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  readonly headerService = inject(HeaderService);

  isUserMenuOpen = signal(false);

  readonly userId = this.headerService.userId;
  readonly userName = this.headerService.userName;
  readonly userRole = this.headerService.userRole;
  readonly userProfilePic = this.headerService.userProfilePic;

  async logout(): Promise<void> {
    this.headerService.logout();
  }
}
