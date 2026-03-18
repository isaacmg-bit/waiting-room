import { Component, inject, OnInit } from '@angular/core';
import { UserTheoryService } from '../../services/theory-service';

@Component({
  selector: 'app-user-theory',
  imports: [],
  templateUrl: './user-theory.html',
  styleUrl: './user-theory.css',
})
export class UserTheory implements OnInit {
  readonly userTheoryService = inject(UserTheoryService);

  ngOnInit() {
    this.userTheoryService.loadUserTheory();
  }

  selectTheory() {
    this.userTheoryService.onTheoryChange();
  }

  updateTheoryLevel(level: string) {
    this.userTheoryService.onTheoryLevelChange(level);
  }
}
