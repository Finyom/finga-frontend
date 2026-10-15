import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  CartService,
  CartResponse,
  CartItem
} from './services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class CartComponent implements OnInit {

  private readonly cartService = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  // Shop-ID wird automatisch aus der URL gelesen
  shopId!: number;

  cart: CartResponse | null = null;

  // Ausgewählte Menge, die entfernt werden soll
  removeQuantities: Record<number, number> = {};

  loading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    const shopIdParam = this.route.snapshot.paramMap.get('shopId');
    const parsedShopId = Number(shopIdParam);

    if (
      shopIdParam === null ||
      !Number.isInteger(parsedShopId) ||
      parsedShopId <= 0
    ) {
      this.errorMessage = 'Ungültige Shop-ID.';
      return;
    }

    this.shopId = parsedShopId;
    this.loadCart();
  }

  // Warenkorb laden 
  loadCart(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    console.log('Lade Warenkorb für Shop:', this.shopId);

    this.cartService.getCart(this.shopId).subscribe({
      next: (response: CartResponse) => {
        console.log('Warenkorb erhalten:', response);

        this.cart = response;
        this.loading = false;

        for (const item of response.items ?? []) {
          const selected = this.removeQuantities[item.productId] ?? 1;

          this.removeQuantities[item.productId] =
            Math.min(selected, item.quantity);
        }
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Fehler beim Laden des Warenkorbs:', error);

        this.loading = false;
        this.cart = null;

        if (error.status === 401) {
          this.errorMessage =
            'Bitte melden Sie sich an, um Ihren Warenkorb anzusehen.';

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else if (error.status === 403) {
          this.errorMessage =
            'Sie haben keine Berechtigung, diesen Warenkorb anzusehen.';
        } else {
          this.errorMessage =
            error.error?.message ??
            'Der Warenkorb konnte nicht geladen werden.';
        }
      }
    });
  }

  // Entfernbare Menge ändern
  setRemoveQuantity(
    productId: number,
    quantity: number
  ): void {
    this.removeQuantities[productId] = quantity;
    this.errorMessage = '';
  }

  goBack(): void {
    this.router.navigate([
      '/shops',
      this.shopId,
      'products'
    ]);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  // Ausgewählte Menge entfernen
  removeItem(item: CartItem): void {
    const quantity = this.removeQuantities[item.productId];

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > item.quantity
    ) {
      this.errorMessage =
        'Bitte wähle eine gültige Menge aus.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.cartService
      .removeItem(this.shopId, item.productId, quantity)
      .subscribe({
        next: (response: CartResponse) => {
          this.cart = response;
          this.loading = false;

          this.successMessage =
            quantity === 1
              ? 'Ein Stück wurde entfernt.'
              : `${quantity} Stück wurden entfernt.`;

          // Auswahl an die neue Warenkorbmenge anpassen
          for (const updatedItem of response.items) {
            this.removeQuantities[updatedItem.productId] =
              Math.min(
                this.removeQuantities[updatedItem.productId] ?? 1,
                updatedItem.quantity
              );
          }

          // Auswahl für vollständig entfernte Produkte löschen
          const remainingProductIds = new Set(
            response.items.map(item => item.productId)
          );

          for (const productId of Object.keys(this.removeQuantities)) {
            const id = Number(productId);

            if (!remainingProductIds.has(id)) {
              delete this.removeQuantities[id];
            }
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage =
            error.error?.message ??
            'Das Produkt konnte nicht entfernt werden.';
        }
      });
  }
}
