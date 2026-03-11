import { Component } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideDrum } from '@ng-icons/lucide';

@Component({
  selector: 'app-footer',
  imports: [NgIconComponent],
  providers: [provideIcons({ lucideDrum })],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {}
