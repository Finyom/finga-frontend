import {
  Component,
  inject,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import {
  FormsModule,
  NgForm
} from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ProductService } from '../services/product';

import { CreateProductRequest } from '../models/product';

@Component({
  selector: 'app-product-create',
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './product-create.html',
  styleUrl: './product-create.scss'
})
export class ProductCreate implements OnInit {

  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  shopId!: number;

  product: CreateProductRequest = {
    name: '',
    description: '',
    price: 0,
    stock: 0
  };

  // Ausgewählte Bilddateien
  selectedPhotos: File[] = [];

  // Vorschau der Bildern
  photoPreviews: string[] = [];

  errorMessage = '';
  isSaving = false;

   // Index des aktuell angezeigten Fotos
  currentPhotoIndex = 0;

  ngOnInit(): void {

    this.shopId = Number(
      this.route.snapshot.paramMap.get('shopId')
    );

    console.log('Shop-ID:', this.shopId);
  }

  /**
   * Wird aufgerufen, wenn der Benutzer
   * ein Produktfoto auswählt.
   */
  
  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    const remaining = 4 - this.selectedPhotos.length;

    this.errorMessage = '';

    // Prüfen, ob noch Fotos hinzugefügt werden dürfen.
    if (remaining <= 0) {
      this.errorMessage =
        'Sie können maximal vier Fotos auswählen.';
      input.value = '';
      return;
    }

    // Nur so viele Dateien berücksichtigen, wie noch erlaubt sind.
    const filesToProcess = files.slice(0, remaining);

    if (files.length > remaining) {
      this.errorMessage =
        'Sie können maximal vier Fotos auswählen.';
    }

    for (const file of filesToProcess) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        this.errorMessage =
          'Bitte wählen Sie nur JPG-, PNG- oder WebP-Bilder aus.';
        continue;
      }

      this.selectedPhotos.push(file);

      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          this.photoPreviews.push(reader.result);
          this.cdr.detectChanges();
        }
      };

      reader.onerror = () => {
        this.errorMessage =
          'Ein Foto konnte nicht gelesen werden.';

        this.selectedPhotos =
          this.selectedPhotos.filter(selected => selected !== file);

        this.cdr.detectChanges();
      };

      reader.readAsDataURL(file);
    }

    input.value = '';
  }


  // Zum vorherigen Foto wechseln
  previousPhoto(): void {
    if (this.photoPreviews.length <= 1) return;

    this.currentPhotoIndex =
      (this.currentPhotoIndex - 1 + this.photoPreviews.length)
      % this.photoPreviews.length;
  }

  // Zum nächsten Foto wechseln
  nextPhoto(): void {
    if (this.photoPreviews.length <= 1) return;

    this.currentPhotoIndex =
      (this.currentPhotoIndex + 1) % this.photoPreviews.length;
  }

  // Aktuelles Foto entfernen
  removeCurrentPhoto(): void {
    if (this.photoPreviews.length === 0) return;

    this.removePhoto(this.currentPhotoIndex);

    if (this.photoPreviews.length === 0) {
      this.currentPhotoIndex = 0;
    } else if (this.currentPhotoIndex >= this.photoPreviews.length) {
      this.currentPhotoIndex = this.photoPreviews.length - 1;
    }
  }

  removePhoto(index: number): void {
    this.selectedPhotos.splice(index, 1);
    this.photoPreviews.splice(index, 1);
  }

  /**
   * Produkt erstellen.
   *
   * Zuerst wird das Produkt erstellt.
   * Danach wird das Foto mit der neu erzeugten
   * Produkt-ID hochgeladen.
   */
  
  createProduct(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    // Zuerst das Produkt erstellen.
    this.productService
      .createProduct(this.shopId, this.product)
      .subscribe({
        next: (createdProduct) => {
          console.log('Produkt erstellt:', createdProduct);
          console.log('Neue Produkt-ID:', createdProduct.id);

          // Wenn keine Fotos ausgewählt wurden,
          // direkt zur Produktliste navigieren.
          if (this.selectedPhotos.length === 0) {
            this.isSaving = false;

            this.router.navigate([
              '/shops',
              this.shopId,
              'products'
            ]);

            return;
          }

          // Alle ausgewählten Fotos nacheinander hochladen.
          this.uploadPhotos(
            createdProduct.id,
            this.selectedPhotos
          );
        },

        error: (error: any) => {
          console.error('Fehler beim Erstellen:', error);

          if (error.status === 409) {
            this.errorMessage =
              'Dieses Produkt existiert bereits in diesem Shop.';
          } else if (error.status === 403) {
            this.errorMessage =
              'Sie haben keine Berechtigung, ein Produkt in diesem Shop anzulegen.';
          } else {
            this.errorMessage =
              'Das Produkt konnte nicht erstellt werden.';
          }

          this.isSaving = false;
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Erstellung abbrechen.
   */
  cancel(): void {

    this.router.navigate([
      '/shops',
      this.shopId,
      'products'
    ]);
  }

  private uploadPhotos(
    productId: number,
    photos: File[],
    index = 0
  ): void {
    // Alle Fotos wurden erfolgreich hochgeladen.
    if (index >= photos.length) {
      this.isSaving = false;

      this.router.navigate([
        '/shops',
        this.shopId,
        'products'
      ]);

      return;
    }

    this.productService
      .uploadProductPhoto(
        this.shopId,
        productId,
        photos[index]
      )
      .subscribe({
        next: () => {
          // Erst das nächste Foto hochladen,
          // wenn das aktuelle erfolgreich war.
          this.uploadPhotos(productId, photos, index + 1);
        },
        error: (error) => {
          console.error(
            `Fehler beim Hochladen von Foto ${index + 1}:`,
            error
          );

          this.errorMessage =
            `Foto ${index + 1} konnte nicht hochgeladen werden. Das Produkt wurde bereits erstellt.`;

          this.isSaving = false;
          this.cdr.detectChanges();
        }
      });
  }
}