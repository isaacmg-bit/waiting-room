import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserTheoryService } from '../../services/theory-service';

@Component({
  selector: 'app-user-theory',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-theory.html',
  styleUrl: './user-theory.css',
})
export class UserTheory implements OnInit {
  readonly userTheoryService = inject(UserTheoryService);

  ngOnInit() {
    this.userTheoryService.loadUserTheory();
  }

  onTheoryChange(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.userTheoryService.knowsTheory.set(checked);
    this.userTheoryService.onTheoryChange();
  }

  onTheoryLevelChange(level: string) {
    this.userTheoryService.selectedTheoryLevel.set(level);
    this.userTheoryService.onTheoryLevelChange();
  }
}
