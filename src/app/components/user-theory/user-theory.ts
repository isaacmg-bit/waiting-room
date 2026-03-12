import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserTheoryService } from '../../services/theory-service';

@Component({
  selector: 'app-user-theory',
  imports: [FormsModule],
  templateUrl: './user-theory.html',
  styleUrl: './user-theory.css',
})
export class UserTheory implements OnInit {
  readonly userTheoryService = inject(UserTheoryService);

  ngOnInit() {
    this.userTheoryService.loadUserTheory();
  }

  onTheoryChange() {
    this.userTheoryService.onTheoryChange();
  }

  onTheoryLevelChange() {
    this.userTheoryService.onTheoryLevelChange();
  }
}
