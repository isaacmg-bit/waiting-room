import { Component } from '@angular/core';
import { Header } from './components/header/header';
import { RouterOutlet } from '@angular/router';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-root',
  imports: [Header, RouterOutlet, Footer],
  templateUrl: './app.html',
})
export class AppComponent {}
