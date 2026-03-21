import { Component, inject, OnInit } from '@angular/core';
import { UserTheoryService } from '../../services/theory-service';

@Component({
  selector: 'app-user-theory',
  imports: [],
  templateUrl: './user-theory.html',
  styleUrl: './user-theory.css',
})
export class UserTheory implements OnInit {
  protected readonly userTheoryService = inject(UserTheoryService);

  ngOnInit(): void {
    this.userTheoryService.loadUserTheory();
  }

  selectTheory(): void {
    this.userTheoryService.onTheoryChange();
  }

  updateTheoryLevel(level: string): void {
    this.userTheoryService.onTheoryLevelChange(level);
  }
}
