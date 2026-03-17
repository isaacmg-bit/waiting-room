import { FormControl } from '@angular/forms';

export interface SocialLink {
  platform: FormControl<string>;
  url: FormControl<string>;
}

