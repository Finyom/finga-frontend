import { Component, inject, OnInit, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { MatIconModule } from '@angular/material/icon';

import { Router } from '@angular/router';

import { ShopService } from '../services/shop';
import { AuthService } from '../../auth/services/auth';
import { Shop } from '../models/shop';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-shop-list',
  imports: [
    MatCardModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './shop-list.html',
  styleUrl: './shop-list.scss'
})
export class ShopList implements OnInit {

  private readonly shopService = inject(ShopService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/uploads`;

  isAdmin = false;

  searchText = '';

  shops: Shop[] = [];
  

  ngOnInit(): void {

    // Shops nur im Browser laden
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.isAdmin = this.authService.isAdmin();

    this.loadShops();
    this.cdr.detectChanges();
  }

  loadShops(): void {
    this.shopService.getShops().subscribe({
      next: (shops) => {

        this.shops = shops;

        console.log('Shops geladen:', shops);

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(
          'Fehler beim Laden der Shops:',
          error
        );
      }
    });
  }

  openProducts(shopId: number): void {
    this.router.navigate([
      '/shops',
      shopId,
      'products'
    ]);
  }

  get filteredShops(): Shop[] {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      return this.shops;
    }

    return this.shops.filter(shop =>
      shop.name.toLowerCase().includes(search) ||
      shop.address.toLowerCase().includes(search) ||
      shop.description.toLowerCase().includes(search)
    );
  }

  addShop(): void {
    this.router.navigate(['/shops/create']);
  }

  editShop(shopId: number): void {

    this.router.navigate([
      '/shops',
      shopId,
      'edit'
    ]);

  }

  deleteShop(shopId: number, event: MouseEvent): void {

  event.stopPropagation();

  const confirmed = confirm(
    'Möchten Sie diesen Shop wirklich löschen?'
  );

  if (!confirmed) {
    return;
  }

  this.shopService.deleteShop(shopId)
      .subscribe({
        next: () => {
          this.loadShops();

          this.cdr.detectChanges();
        },
        error: (error: unknown) => {
          console.error(
            'Fehler beim Löschen des Shops:',
            error
          );
        }
      });
  }

  photoUrl(shop: Shop): string {
    if (!shop.photoPath) {
      return 'assets/default-shop.jpg';
    }

    return `${this.apiUrl}/${shop.photoPath}?t=${shop.updatedAt}`;
  }

}