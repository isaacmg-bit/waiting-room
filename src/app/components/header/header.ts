import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderService } from '../../services/header-service';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';

@Component({
  selector: 'app-header',
  imports: [RouterModule, ClickOutsideDirective],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private readonly headerService = inject(HeaderService);

  readonly isUserMenuOpen = signal<boolean>(false);

  readonly userId = this.headerService.userId;
  readonly userName = this.headerService.userName;
  readonly userRole = this.headerService.userRole;
  readonly userProfilePic = this.headerService.userProfilePic;

  async logout(): Promise<void> {
    await this.headerService.logout();
  }
}
