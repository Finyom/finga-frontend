import { Component, signal } from '@angular/core';
import { LayoutComponent } from './layout/layout';

@Component({
  imports: [LayoutComponent],
  selector: 'app-root',
  standalone: true,
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('finga-frontend');
}
