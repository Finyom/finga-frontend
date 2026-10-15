import {
  Component,
  inject,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

import { ProductService } from '../services/product';
import { Product } from '../models/product';

import { AuthService } from '../../auth/services/auth';
import { CurrentUser } from '../../auth/models/current-user';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../cart/services/cart.service';
import { environment } from '../../../environments/environment';



@Component({
  selector: 'app-product-detail',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss'
})
export class ProductDetail implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly apiUrl = `${environment.apiUrl}/uploads`;
  
  cartMessage = '';
  cartError = '';
  addingProductId: number | null = null;

  currentUser?: CurrentUser;

  product?: Product;

  shopId!: number;
  productId!: number;

  currentPhotoIndex = 0;


  ngOnInit(): void {

    this.shopId = Number(
      this.route.snapshot.paramMap.get('shopId')
    );

    this.productId = Number(
      this.route.snapshot.paramMap.get('productId')
    );

    console.log('Shop ID:', this.shopId);
    console.log('Product ID:', this.productId);

    this.authService.getCurrentUser()
      .subscribe({
        next: (user: CurrentUser) => {
          this.currentUser = user;
        },

        error: (error: unknown) => {
          console.error(
            'Fehler beim Laden des Benutzers:',
            error
          );
        }
      });

    this.loadProduct();
  }

  loadProduct(): void {

    this.productService
      .getProduct(this.shopId, this.productId)
      .subscribe({
        next: (product: Product) => {
          console.log('Produkt geladen:', product);
          this.product = product;
          this.currentPhotoIndex = 0;
          this.cdr.detectChanges();
        },

        error: (error: unknown) => {
          console.error(
            'Fehler beim Laden des Produkts:',
            error
          );
        }
      });
  }

  goBack(): void {
    this.router.navigate([
      '/shops',
      this.shopId,
      'products'
    ]);
  }

  canEditProduct(): boolean {

    if (!this.currentUser) {
      return false;
    }

    if (this.currentUser.role === 'ADMIN') {
      return true;
    }

    if (this.currentUser.role === 'USER_ADMIN') {
      return this.currentUser.shopIds.includes(this.shopId);
    }

    return false;
  }

  editProduct(): void {

    this.router.navigate([
      '/shops',
      this.shopId,
      'products',
      this.productId,
      'edit'
    ]);
  }

  // Alle verfügbaren Produktfotos zurückgeben
  getProductPhotos(): string[] {
    if (this.product?.photoPaths?.length) {
      return this.product.photoPaths;
    }

    if (this.product?.photoPath) {
      return [this.product.photoPath];
    }

    return [];
  }

  // Zum vorherigen Foto wechseln
  previousPhoto(): void {
    const photos = this.getProductPhotos();

    if (photos.length <= 1) return;

    this.currentPhotoIndex =
      (this.currentPhotoIndex - 1 + photos.length) % photos.length;
  }

  // Zum nächsten Foto wechseln
  nextPhoto(): void {
    const photos = this.getProductPhotos();

    if (photos.length <= 1) return;

    this.currentPhotoIndex =
      (this.currentPhotoIndex + 1) % photos.length;
  }

  // URL für das aktuell ausgewählte Foto
  currentPhotoUrl(): string {
    const photos = this.getProductPhotos();

    if (photos.length === 0) {
      return 'assets/default-product.jpg';
    }

    return this.photoUrlFromPath(photos[this.currentPhotoIndex]);
  }

  // URL für ein Produktfoto erstellen – nur einmal definieren!
  photoUrlFromPath(photoPath: string): string {
    if (!photoPath) {
      return 'assets/default-product.jpg';
    }

    return `this.apiUrl}/${photoPath}`;
  }

  // Fallback für ältere Produkte mit nur einem Foto
  photoUrl(product: Product): string {
    if (!product.photoPath) {
      return 'assets/default-product.jpg';
    }

    return `this.apiUrl}/${product.photoPath}?t=${product.updatedAt}`;
  }

  canDeleteProduct(): boolean {
    if (!this.currentUser) {
      return false;
    }

    if (this.currentUser.role === 'ADMIN') {
      return true;
    }

    if (this.currentUser.role === 'USER_ADMIN') {
      return this.currentUser.shopIds.includes(this.shopId);
    }

    return false;
  }

  deleteProduct(
    productId: number,
    event: MouseEvent
  ): void {

    event.stopPropagation();

    const confirmed = confirm(
      'Möchten Sie dieses Produkt wirklich löschen?'
    );

    if (!confirmed) {
      return;
    }

    this.productService
      .deleteProduct(this.shopId, productId)
      .subscribe({
        next: () => {
          this.loadProduct();

          this.cdr.detectChanges();
        },
        error: (error: unknown) => {
          console.error(
            'Fehler beim Löschen des Produkts:',
            error
          );
        }
      });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  addToCart(productId: number): void {
    this.cartMessage = '';
    this.cartError = '';

    if (!this.shopId || this.shopId <= 0) {
      this.cartError = 'Ungültiger Shop.';
      return;
    }

    this.addingProductId = productId;

    this.cartService.addItem(this.shopId, productId, 1).subscribe({
      next: () => {
        this.cartMessage = 'Produkt wurde in den Warenkorb gelegt.';
        this.addingProductId = null;
        this.loadProduct();
      },

      error: (error) => {
        this.addingProductId = null;

        if (error.status === 401) {
          this.cartError =
            'Bitte registrieren Sie sich oder melden Sie sich an, um Produkte in den Warenkorb zu legen.';

          this.cdr.detectChanges();

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);

        } else if (error.status === 403) {
          this.cartError =
            'Sie haben keine Berechtigung für diese Aktion.';
          this.cdr.detectChanges();

        } else {
          this.cartError =
            error.error?.message ??
            'Das Produkt konnte nicht hinzugefügt werden.';
          this.cdr.detectChanges();
        }
      }
    });
  }


}