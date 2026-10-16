import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../services/auth';
import { ShopService } from '../../shops/services/shop';

import { RegisterRequest } from '../models/register-request';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  private readonly authService = inject(AuthService);
  private readonly shopService = inject(ShopService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);


  // Login
  login = '';
  password = '';

  // Registrierung
  username = '';
  email = '';
  registerPassword = '';
  successMessage = '';
  errorMessage = '';

  // Login oder Registrierung anzeigen
  isRegisterMode = false;

  onLogin(): void {

    const request = {
      login: this.login,
      password: this.password
    };

    this.authService.login(request).subscribe({
      next: (response) => {
        console.log('Login erfolgreich');
        console.log('JWT:', response.token);

        localStorage.setItem('token', response.token);

        this.router.navigate(['/shops']);
      },
      error: (error) => {
        console.error('Login fehlgeschlagen', error);
      }
    });
  }

  onRegister(): void {

    const request: RegisterRequest = {
      username: this.username,
      email: this.email,
      password: this.registerPassword
    };

    console.log('Username:', request.username);
    console.log('E-Mail:', request.email);

    this.authService.register(request).subscribe({
      
      
      next: () => {
        // Erfolgsmeldung anzeigen
        this.successMessage = 'Registrierung erfolgreich! Bitte melden Sie sich an.';

        // Nach 2 Sekunden zur Login-Seite weiterleiten
        setTimeout(() => {
          this.router.navigate(['/login'], {
            state: { successMessage: this.successMessage }
          });
        }, 1000);
        this.showLogin();
      },
      error: (error) => {
        console.error('Registrierung fehlgeschlagen:', error);

        if (error.status === 409) {
          this.errorMessage =
            'Dieser Username oder diese E-Mail-Adresse ist bereits registriert.';
        } else {
          this.errorMessage =
            'Die Registrierung ist fehlgeschlagen. Bitte versuchen Sie es erneut.';
        }

        this.cdr.detectChanges();
      }


    });
  }

  showRegister(): void {
    this.isRegisterMode = true;
  }

  showLogin(): void {
    this.isRegisterMode = false;
  }

  testShops(): void {

    this.shopService.getShops().subscribe({
      next: (shops) => {
        console.log('Shops:', shops);
      },
      error: (error) => {
        console.error('Shops Fehler:', error);
      }
    });
  }
}