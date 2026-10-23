import {
  Component,
  inject,
  OnInit,
  afterNextRender,
  ChangeDetectorRef,
  EventEmitter, 
  Output,
  Input
} from '@angular/core';

import {
  Router,
  RouterLink,
  NavigationEnd
} from '@angular/router';

import { filter } from 'rxjs/operators';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { AuthService } from '../../auth/services/auth';
import { CurrentUser } from '../../auth/models/current-user';



@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit {

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() currentUser?: CurrentUser;
  @Input() isAuthenticated = false;
  @Input() isAdminUser = false;

  @Output() toggleSidenav = new EventEmitter<void>();
  @Output() loginRequested = new EventEmitter<void>();
  @Output() logoutRequested = new EventEmitter<void>();


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