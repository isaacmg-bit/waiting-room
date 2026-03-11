import { Component, signal, inject, OnInit, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserTheoryService } from '../../services/theory-service';

@Component({
  selector: 'app-user-theory',
  imports: [FormsModule],
  templateUrl: './user-theory.html',
  styleUrl: './user-theory.css',
})
export class UserTheory implements OnInit {
  private readonly userTheoryService = inject(UserTheoryService);

  knowsTheory = signal(false);
  selectedTheoryLevel = signal<string | null>(null);
  theoryLevels = ['Basic', 'Composition', 'Advanced Orchestration'];
  userTheory = this.userTheoryService.userTheorySignal;

  constructor() {
    effect(() => {
      const theory = this.userTheory();
      if (theory) {
        this.knowsTheory.set(theory.knows_theory);
        this.selectedTheoryLevel.set(theory.theory_level);
      }
    });
  }

  ngOnInit() {
    this.userTheoryService.loadUserTheory();
  }

  private updateTheory() {
    this.userTheoryService.updateUserTheory(this.knowsTheory(), this.selectedTheoryLevel());
  }

  onTheoryChange() {
    if (!this.knowsTheory()) {
      this.selectedTheoryLevel.set(null);
    }
    this.updateTheory();
  }

  onTheoryLevelChange() {
    this.updateTheory();
  }
}
