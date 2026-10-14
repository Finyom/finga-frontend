import {
  Component,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import {
  FormsModule,
  NgForm
} from '@angular/forms';

import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import {
  ShopService,
  CreateShopRequest
} from '../services/shop';

@Component({
  selector: 'app-shop-create',
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './shop-create.html',
  styleUrl: './shop-create.scss'
})
export class ShopCreate {

  private readonly shopService = inject(ShopService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  shop: CreateShopRequest = {
    name: '',
    description: '',
    address: ''
  };

  // Ausgewählte Bilddatei
  selectedFile?: File;

  // Vorschau des Bildes
  photoPreview?: string;

  errorMessage = '';
  isSaving = false;

  /**
   * Foto auswählen
   */
  onFileSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    // Nur JPG, PNG und WebP erlauben
    if (
      file.type !== 'image/jpeg' &&
      file.type !== 'image/png' &&
      file.type !== 'image/webp'
    ) {

      this.errorMessage =
        'Nur JPG, PNG und WebP sind erlaubt.';

      input.value = '';

      return;
    }

    this.errorMessage = '';

    // Datei speichern
    this.selectedFile = file;

    // Vorschau erzeugen
    this.photoPreview =
      URL.createObjectURL(file);

    this.cdr.detectChanges();
  }

  /**
   * Shop erstellen
   *
   * 1. Shop-Daten speichern
   * 2. Shop-ID erhalten
   * 3. Foto hochladen
   * 4. Zur Shop-Liste wechseln
   */
  createShop(form: NgForm): void {

    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    // Zuerst den Shop erstellen
    this.shopService
      .createShop(this.shop)
      .subscribe({

        next: (createdShop) => {

          console.log(
            'Shop erfolgreich erstellt:',
            createdShop
          );

          /*
           * Kein Foto ausgewählt.
           * Direkt zur Shop-Liste.
           */
          if (!this.selectedFile) {

            this.router.navigate(['/shops']);

            return;
          }

          /*
           * Foto hochladen.
           *
           * Die ID kommt vom gerade erstellten Shop.
           */
          this.shopService
            .uploadShopPhoto(
              createdShop.id,
              this.selectedFile
            )
            .subscribe({

              next: () => {

                console.log(
                  'Shop und Foto erfolgreich gespeichert.'
                );

                this.isSaving = false;

                this.router.navigate(['/shops']);
              },

              error: (error: unknown) => {

                console.error(
                  'Fehler beim Hochladen des Shop-Fotos:',
                  error
                );

                /*
                 * Der Shop wurde bereits erstellt,
                 * aber das Foto konnte nicht hochgeladen werden.
                 */
                this.errorMessage =
                  'Der Shop wurde erstellt, aber das Foto konnte nicht hochgeladen werden.';

                this.isSaving = false;

                this.cdr.detectChanges();
              }

            });
        },

        error: (error: any) => {

          console.error(
            'Fehler beim Erstellen des Shops:',
            error
          );

          if (error.status === 403) {

            this.errorMessage =
              'Sie haben keine Berechtigung, einen Shop zu erstellen.';

          } else {

            this.errorMessage =
              'Der Shop konnte nicht erstellt werden.';
          }

          this.isSaving = false;

          this.cdr.detectChanges();
        }

      });
  }

  /**
   * Erstellung abbrechen
   */
  cancel(): void {

    this.router.navigate(['/shops']);
  }
}