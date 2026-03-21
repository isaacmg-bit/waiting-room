import { Component, inject, effect } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserPresenceService } from '../../services/user-presence-service';
import { SocialLinkHandle } from '../../models/SocialLinkHandle';

@Component({
  selector: 'app-user-presence',
  imports: [ReactiveFormsModule],
  templateUrl: './user-presence.html',
})
export class UserPresence {
  private readonly fb = inject(FormBuilder);
  protected readonly presenceService = inject(UserPresenceService);

  readonly form = this.fb.group({
    social_links: this.fb.array<FormGroup>([]),
  });

  constructor() {
    effect(() => {
      const links = this.presenceService.pendingLinks();

      if (links.length !== this.socialLinksArray.length) {
        this.populateForm(links);
      }
    });

    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe((val) => {
      const currentValues = (val.social_links || []) as SocialLinkHandle[];
      this.presenceService.pendingLinks.set(currentValues);
    });
  }

  get socialLinksArray(): FormArray {
    return this.form.controls.social_links;
  }

  private populateForm(links: SocialLinkHandle[]): void {
    this.socialLinksArray.clear({ emitEvent: false });
    links.forEach((link) => {
      this.socialLinksArray.push(this.createLinkGroup(link.platform, link.url), {
        emitEvent: false,
      });
    });
  }

  private createLinkGroup(platform = 'instagram', url = ''): FormGroup {
    return this.fb.group({
      platform: [platform, Validators.required],
      url: [url, [Validators.required]],
    });
  }

  addLink(): void {
    this.presenceService.addPendingLink();
  }

  removeLink(index: number): void {
    this.socialLinksArray.removeAt(index);
  }
}
