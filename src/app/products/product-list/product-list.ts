import {
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
  ChangeDetectorRef
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ProductService } from '../services/product';
import { Product } from '../models/product';
import { AuthService } from '../../auth/services/auth';
import { Router } from '@angular/router';
import { CurrentUser } from '../../auth/models/current-user';
import { PageEvent } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CartService } from '../../cart/services/cart.service';
import { environment } from '../../../environments/environment.prod';


@Component({
  selector: 'app-product-list',
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductList implements OnInit {

  private readonly productService = inject(ProductService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly apiUrl = `${environment.apiUrl}/uploads`;

  cartMessage = '';
  cartError = '';
  addingProductId: number | null = null;

  currentUser?: CurrentUser;
  isAssignedToShop = false;

  products: Product[] = [];

  shopId!: number;

  isUser_Admin = false;
  isAdmin = false;

  searchText = '';

  pageSize = 10;
  currentPage = 0;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.shopId = Number(
      this.route.snapshot.paramMap.get('shopId')
    );

    this.isUser_Admin = this.authService.isUser_Admin();
    this.isAdmin = this.authService.isAdmin();

    this.authService.getCurrentUser()
      .subscribe({
        next: (user) => {
          this.currentUser = user;

          this.isAssignedToShop =
            user.shopIds.includes(this.shopId);

          this.cdr.detectChanges();
        },
        error: (error: unknown) => {
          console.error(
            'Fehler beim Laden des aktuellen Benutzers:',
            error
          );

          this.isAssignedToShop = false;
          this.cdr.detectChanges();
        }
      });

    this.loadProducts();
  }


  loadProducts(): void {

    this.productService
      .getProducts(this.shopId)
      .subscribe({

        next: (products: Product[]) => {

          this.products = products;

          console.log(
            'Anzahl Produkte:',
            this.products.length
          );

          console.log(
            'Produkte:',
            this.products
          );

          this.cdr.detectChanges();
        },

        error: (error: unknown) => {

          console.error(
            'Fehler beim Laden der Produkte:',
            error
          );
        }

      });
  }

  get filteredProducts(): Product[] {
  const search = this.searchText.toLowerCase().trim();

  if (!search) {
    return this.products;
  }

  return this.products.filter(product =>
    product.name.toLowerCase().includes(search) ||
    product.description.toLowerCase().includes(search)
  );
}

  addProduct(): void {

    this.router.navigate([
      '/shops',
      this.shopId,
      'products',
      'create'
    ]);

  }

  canAddProduct(): boolean {
    return this.isAdmin ||
          (this.isUser_Admin && this.isAssignedToShop);
  }

  openProduct(productId: number): void {
    this.router.navigate([
      '/shops',
      this.shopId,
      'products',
      productId
    ]);
  }

  photoUrl(product: Product): string {

    if (!product.photoPath) {
      return 'assets/default-product.jpg';
    }

    return `this.apiUrl}/${product.photoPath}?t=${product.updatedAt}`;
  }

  get paginatedProducts(): Product[] {

    const startIndex = this.currentPage * this.pageSize;

    return this.filteredProducts.slice(
      startIndex,
      startIndex + this.pageSize
    );
  }

  onPageChange(event: PageEvent): void {

    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  goBack(): void {
    this.router.navigate(['/shops']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  openCart(): void {
    console.log('Warenkorb geklickt. Shop-ID:', this.shopId);

    this.router.navigate(['/shops', this.shopId, 'cart'])
      .then((success) => {
        console.log('Navigation erfolgreich:', success);
      })
      .catch((error) => {
        console.error('Navigationsfehler:', error);
      });
  }

  addToCart(productId: number): void {
    if (!this.shopId || this.shopId <= 0) {
      this.cartError = 'Ungültiger Shop.';
      return;
    }

    this.cartMessage = '';
    this.cartError = '';
    this.addingProductId = productId;

    this.cartService.addItem(this.shopId, productId, 1).subscribe({
      next: () => {
        this.cartMessage = 'Produkt wurde in den Warenkorb gelegt.';
        this.addingProductId = null;

        // Produktliste neu laden, damit der Lagerbestand aktuell ist
        this.loadProducts();
      },
      error: (error) => {
        this.addingProductId = null;

        if (error.status === 401) {
          this.cartError =
            'Bitte registrieren Sie sich oder melden Sie sich an, um Produkte in den Warenkorb zu legen.';
        } else {
          this.cartError =
            error.error?.message ??
            'Das Produkt konnte nicht hinzugefügt werden.';
        }
      }
    });
  }

}