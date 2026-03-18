import { Component, inject, effect, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserPresenceService } from '../../services/user-presence-service';
import { SocialLinkHandle } from '../../models/SocialLinkHandle';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-presence',
  imports: [ReactiveFormsModule],
  templateUrl: './user-presence.html',
})
export class UserPresence implements OnDestroy {
  private fb = inject(FormBuilder);
  public presenceService = inject(UserPresenceService);
  private formSub?: Subscription;

  form = this.fb.group({
    social_links: this.fb.array([]),
  });

  get links(): FormArray {
    return this.form.get('social_links') as FormArray;
  }

  constructor() {
    effect(() => {
      const links = this.presenceService.pendingLinks();
      if (links.length !== this.links.length) {
        this.populateForm(links);
      }
    });

    this.formSub = this.form.valueChanges.subscribe((val) => {
      const currentValues = (val.social_links || []) as SocialLinkHandle[];
      this.presenceService.pendingLinks.set(currentValues);
    });
  }

  private populateForm(links: SocialLinkHandle[]) {
    this.links.clear({ emitEvent: false });
    links.forEach((l) =>
      this.links.push(this.createGroup(l.platform, l.url), { emitEvent: false }),
    );
  }

  private createGroup(platform = 'instagram', url = ''): FormGroup {
    return this.fb.group({
      platform: [platform, Validators.required],
      url: [url, Validators.required],
    });
  }

  addLink() {
    this.presenceService.addPendingLink();
  }

  removeLink(index: number) {
    this.presenceService.deleteLink(index);
  }

  ngOnDestroy() {
    this.formSub?.unsubscribe();
  }
}
