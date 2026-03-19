import { Component, inject, signal } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideDrum } from '@ng-icons/lucide';
import { HeaderService } from '../../services/header-service';

@Component({
  selector: 'app-header',
  imports: [RouterModule, NgIconComponent],
  providers: [provideIcons({ lucideDrum })],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  readonly headerService = inject(HeaderService);
  private readonly router = inject(Router);

  isUserMenuOpen = signal(false);

  readonly userId = this.headerService.userId;
  readonly userName = this.headerService.userName;
  readonly userRole = this.headerService.userRole;
  readonly userProfilePic = this.headerService.userProfilePic;

  async logout(): Promise<void> {
    await this.headerService.logout();
    this.router.navigate(['/login']);
  }
}
