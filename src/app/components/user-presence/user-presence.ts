import { Component, inject, signal, computed, effect } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserPresenceService } from '../../services/user-presence-service';
import { SocialLink } from '../../models/SocialLink';
import { SocialLinkHandle } from '../../models/SocialLinkHandle';
// Definimos la estructura del grupo para que Angular no pierda el tipo

@Component({
  selector: 'app-user-presence',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './user-presence.html',
})
export class UserPresence {
  private fb = inject(FormBuilder);
  private presenceService = inject(UserPresenceService);

  // Inicializamos con el tipo explícito para evitar "No overload matches this call"
  form = this.fb.group({
    social_links: this.fb.array<FormGroup<SocialLink>>([]),
  });

  linksSignal = signal<FormArray<FormGroup<SocialLink>>>(this.form.controls.social_links);
  linksForTemplate = computed(() => this.linksSignal().controls);

  constructor() {
    this.presenceService.loadUserPresence();

    // Sincronizamos el Signal del servicio con el FormArray del componente
    effect(() => {
      const links = this.presenceService.socialLinksSignal();
      this.populateForm(links);
    });
  }

  private populateForm(links: SocialLinkHandle[]) {
    const control = this.form.controls.social_links;
    control.clear({ emitEvent: false }); // Evita loops infinitos

    links.forEach((l) => {
      control.push(this.createGroup(l.platform, l.url), { emitEvent: false });
    });

    this.linksSignal.set(control);
  }

  private createGroup(platform = 'instagram', url = ''): FormGroup<SocialLink> {
    return this.fb.group<SocialLink>({
      platform: this.fb.control(platform, { nonNullable: true }),
      url: this.fb.control(url, { nonNullable: true, validators: [Validators.required] }),
    });
  }

  addLink() {
    this.form.controls.social_links.push(this.createGroup());
    this.linksSignal.set(this.form.controls.social_links);
  }

  removeLink(index: number) {
    this.form.controls.social_links.removeAt(index);
    this.linksSignal.set(this.form.controls.social_links);
  }

  async save() {
    if (this.form.invalid) return;
    const values = this.form.getRawValue().social_links;

    try {
      await this.presenceService.savePresence(values);
      this.form.markAsPristine();
      alert('¡Guardado!');
    } catch (error) {
      alert('Error al guardar');
    }
  }
}
