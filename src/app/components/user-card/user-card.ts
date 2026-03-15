import { Component, Input, signal, inject, OnInit } from '@angular/core';
import { User } from '../../models/User';
import { UserService } from '../../services/user-service';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-card',
  imports: [RouterLink],
  templateUrl: './user-card.html',
  styleUrl: './user-card.css',
})
export class UserCard implements OnInit {
  userService = inject(UserService);
  private readonly route = inject(ActivatedRoute);

  @Input() user: any;
  @Input() randomUser: any;

  userSignal = signal<User | null>(null);

  ngOnInit() {
    if (this.user?.id) {
      this.userService.getUserById(this.user.id).subscribe({
        next: (user) => {
          this.userSignal.set(user);
        },
      });
    }
  }
}
