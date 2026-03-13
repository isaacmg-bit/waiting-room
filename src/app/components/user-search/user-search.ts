import { Component } from '@angular/core';
import { UserCard } from '../user-card/user-card';

@Component({
  selector: 'app-user-search',
  imports: [UserCard],
  templateUrl: './user-search.html',
  styleUrl: './user-search.css',
})
export class UserSearch {}
