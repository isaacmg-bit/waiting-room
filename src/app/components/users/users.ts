import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/apiservice';
import { User } from '../../models/User';
import { environment } from '../../../environments/environment';
import { toSignal } from '@angular/core/rxjs-interop';
@Component({
  selector: 'app-users',
  imports: [RouterModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users {
  private readonly api = inject(ApiService);

  users = toSignal(this.api.get<User[]>(this.getUsersUrl()), { initialValue: [] });

  private getUsersUrl() {
    return `${environment.apiUrl}/users/`;
  }
}
