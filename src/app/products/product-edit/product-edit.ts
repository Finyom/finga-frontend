
import {
  Component,
  inject,
  OnInit,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HttpErrorResponse } from '@angular/common/http';

import { ProductService } from '../services/product';

import { environment } from '../../../environments/environment';

import {
  Product,
  UpdateProductRequest
} from '../models/product';

@Component({
  selector: 'app-product-edit',
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './product-edit.html',
  styleUrl: './product-edit.scss'
})
export class ProductEdit implements OnInit, OnDestroy {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly apiUrl = `${environment.apiUrl}/uploads`;

  shopId!: number;
  productId!: number;

  product: Product = {
    id: 0,
    name: '',
    description: '',
    price: 0,
    stock: 0,
    shopId: 0,
    photoPath: '',
    createdAt: '',
    updatedAt: ''
  };

  loading = true;
  saving = false;

  selectedFiles: File[] = [];

  // URLs für vorhandene und neu ausgewählte Fotos.
  photoPreviews: string[] = [];

  // Object-URLs der neu ausgewählten Dateien freigeben.
  private objectUrls: string[] = [];

  errorMessage = '';

  ngOnInit(): void {
    this.shopId = Number(
      this.route.snapshot.paramMap.get('shopId')
    );

    this.productId = Number(
      this.route.snapshot.paramMap.get('productId')
    );

    this.loadProduct();
  }

  ngOnDestroy(): void {
    this.objectUrls.forEach(url => URL.revokeObjectURL(url));
  }

  /**
   * Produkt vom Backend laden.
   */
  loadProduct(): void {
    this.productService
      .getProduct(this.shopId, this.productId)
      .subscribe({
        next: (product: Product) => {
          this.product = product;

          // Das bisherige Datenmodell enthält nur photoPath.
          // Deshalb kann hier nur ein vorhandenes Foto angezeigt werden.
          if (product.photoPath) {
            this.photoPreviews = [
              `this.apiUrl}/${product.photoPath}`
            ];
          }

          this.loading = false;
          this.cdr.detectChanges();
        },

        error: (error: unknown) => {
          console.error(
            'Fehler beim Laden des Produkts:',
            error
          );

          this.errorMessage =
            'Das Produkt konnte nicht geladen werden.';

          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Bis zu vier Fotos auswählen.
   */
  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    // Vorhandene Fotos zählen ebenfalls zum Limit.
    const remaining = 4 - this.photoPreviews.length;

    this.errorMessage = '';

    if (remaining <= 0) {
      this.errorMessage =
        'Sie können maximal vier Fotos haben.';
      input.value = '';
      return;
    }

    for (const file of files) {
      if (this.photoPreviews.length >= 4) {
        this.errorMessage =
          'Sie können maximal vier Fotos haben.';
        break;
      }

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        this.errorMessage =
          'Bitte wählen Sie nur JPG-, PNG- oder WebP-Bilder aus.';
        continue;
      }

      this.selectedFiles.push(file);

      const previewUrl = URL.createObjectURL(file);
      this.objectUrls.push(previewUrl);
      this.photoPreviews.push(previewUrl);
    }

    this.cdr.detectChanges();
    input.value = '';
  }

  currentPhotoIndex = 0;

  previousPhoto(): void {
    if (this.photoPreviews.length <= 1) return;

    this.currentPhotoIndex =
      (this.currentPhotoIndex - 1 + this.photoPreviews.length)
      % this.photoPreviews.length;
  }

  nextPhoto(): void {
    if (this.photoPreviews.length <= 1) return;

    this.currentPhotoIndex =
      (this.currentPhotoIndex + 1) % this.photoPreviews.length;
  }

  /**
   * Produktdaten aktualisieren und neue Fotos hochladen.
   */
  updateProduct(): void {
    if (this.saving) {
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const request: UpdateProductRequest = {
      name: this.product.name,
      description: this.product.description,
      price: this.product.price,
      stock: this.product.stock
    };

    this.productService
      .updateProduct(this.shopId, this.productId, request)
      .subscribe({
        next: () => {
          if (this.selectedFiles.length === 0) {
            this.navigateToProduct();
            return;
          }

          this.uploadPhotosSequentially(0);
        },

        error: (error: unknown) => {
          console.error(
            'Fehler beim Aktualisieren des Produkts:',
            error
          );

          this.errorMessage =
            'Die Produktdaten konnten nicht aktualisiert werden.';

          this.saving = false;
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Neue Fotos nacheinander hochladen.
   */
  private uploadPhotosSequentially(index: number): void {
    if (index >= this.selectedFiles.length) {
      this.navigateToProduct();
      return;
    }

    this.productService
      .uploadProductPhoto(
        this.shopId,
        this.productId,
        this.selectedFiles[index]
      )
      .subscribe({
        next: () => {
          this.uploadPhotosSequentially(index + 1);
        },

          error: (error: HttpErrorResponse) => {
          console.error(
            `Fehler beim Hochladen von Foto ${index + 1}:`,
            error
          );

          console.error('HTTP-Status:', error.status);
          console.error('Backend-Fehlerdetails:', error.error);
          console.error('Fehlermeldung:', error.message);

          this.errorMessage =
            error.error?.message ??
            `Foto ${index + 1} konnte nicht hochgeladen werden.`;

          this.saving = false;
          this.cdr.detectChanges();
        }
      });
  }

  private navigateToProduct(): void {
    this.saving = false;

    this.router.navigate([
      '/shops',
      this.shopId,
      'products',
      this.productId
    ]);
  }

  cancel(): void {
    this.router.navigate([
      '/shops',
      this.shopId,
      'products',
      this.productId
    ]);
  }
}