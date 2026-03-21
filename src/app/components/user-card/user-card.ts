import { Component, Input, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { User } from '../../models/User';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-user-card',
  imports: [RouterLink],
  templateUrl: './user-card.html',
  styleUrl: './user-card.css',
})
export class UserCard implements OnInit {
  private readonly userService = inject(UserService);

  @Input() user: any;
  @Input() randomUser: any;

  readonly userSignal = signal<User | null>(null);

  ngOnInit(): void {
    if (this.user?.id) {
      this.userService.getUserById(this.user.id).subscribe({
        next: (userData) => this.userSignal.set(userData),
        error: (err) => console.error('Card fetch failed:', err),
      });
    }
  }
}
