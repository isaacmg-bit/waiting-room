import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  imports: [RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  constructor(private http: HttpClient) {}

  testBackend() {
    this.http.get('http://localhost:3000/users/me').subscribe({
      next: (res) => console.log(res),
      error: (err) => console.error(err),
    });
  }
}
