import {
  Component,
  inject,
  OnInit,
  afterNextRender,
  ChangeDetectorRef
} from '@angular/core';

import {
  Router,
  RouterLink,
  RouterOutlet,
  NavigationEnd
} from '@angular/router';

import { filter } from 'rxjs/operators';

import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../auth/services/auth';
import { CurrentUser } from '../auth/models/current-user';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { Header } from './header/header';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    Header,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class LayoutComponent {
  
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  currentUser?: CurrentUser;

  // Diese Werte bleiben während der SSR-Hydration
  // zunächst false.
  isAuthenticated = false;
  isAdminUser = false;

  constructor() {

    // Erst nachdem Angular die Hydration abgeschlossen hat,
    // greifen wir auf localStorage zu.
    afterNextRender(() => {
      this.updateAuthState();
    });
  }

  ngOnInit(): void {

    // Nach einer Navigation erneut prüfen.
    // Das ist wichtig für Login und Logout.
    this.router.events
      .pipe(
        filter(
          event => event instanceof NavigationEnd
        )
      )
      .subscribe(() => {

        this.updateAuthState();
        this.cdr.detectChanges();

      });
  }

  private updateAuthState(): void {

    this.isAuthenticated =
      this.authService.isLoggedIn();

    this.isAdminUser =
      this.authService.isAdmin();

    if (!this.isAuthenticated) {

      this.currentUser = undefined;

      return;
    }

    this.authService
      .getCurrentUser()
      .subscribe({
        next: (user: CurrentUser) => {

          console.log(
            'Aktueller Benutzer:',
            user
          );

          this.currentUser = user;
          this.cdr.detectChanges();
        },

        error: (error: unknown) => {

          console.error(
            'Fehler beim Laden des aktuellen Benutzers:',
            error
          );

          this.currentUser = undefined;
          this.cdr.detectChanges();
        }
      });
  }

  login(): void {

    this.router.navigate(['/login']);

  }

  logout(): void {

    localStorage.removeItem('token');

    this.isAuthenticated = false;
    this.isAdminUser = false;
    this.currentUser = undefined;

    this.router.navigate(['/login']);

  }
}
