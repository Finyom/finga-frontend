import {
  Component,
  inject,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  FormsModule,
  NgForm
} from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import {
  ShopService,
  CreateShopRequest
} from '../services/shop';

@Component({
  selector: 'app-shop-edit',
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './shop-edit.html',
  styleUrl: './shop-edit.scss'
})
export class ShopEdit implements OnInit {

  private readonly shopService = inject(ShopService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  shopId!: number;

  selectedFile?: File;
  photoPreview?: string;

  shop: CreateShopRequest = {
    name: '',
    description: '',
    address: ''
  };

  errorMessage = '';
  isLoading = true;
  isSaving = false;

  ngOnInit(): void {

    this.shopId = Number(
      this.route.snapshot.paramMap.get('shopId')
    );

    this.loadShop();
  }

  loadShop(): void {

    this.shopService
      .getShop(this.shopId)
      .subscribe({

        next: (shop) => {

          this.shop = {
            name: shop.name,
            description: shop.description,
            address: shop.address
          };

          if (shop.photoPath) {
            this.photoPreview =
              `http://localhost:8080/uploads/${shop.photoPath}?t=${shop.updatedAt}`;
          }

          this.isLoading = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Fehler beim Laden des Shops:',
            error
          );

          this.errorMessage =
            'Der Shop konnte nicht geladen werden.';

          this.isLoading = false;

          this.cdr.detectChanges();
        }
      });
  }

  onFileSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    this.selectedFile = file;

    this.photoPreview =
      URL.createObjectURL(file);

    this.cdr.detectChanges();
  }

  updateShop(form: NgForm): void {

    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    // 1. Zuerst Shop-Daten speichern
    this.shopService
      .updateShop(this.shopId, this.shop)
      .subscribe({

        next: (updatedShop) => {

          console.log(
            'Shop aktualisiert:',
            updatedShop
          );

          // 2. Wenn ein neues Foto ausgewählt wurde,
          //    anschließend Foto hochladen
          if (this.selectedFile) {

            this.shopService
              .uploadShopPhoto(
                this.shopId,
                this.selectedFile
              )
              .subscribe({

                next: () => {

                  console.log(
                    'Shop und Foto erfolgreich gespeichert'
                  );

                  this.isSaving = false;

                  this.router.navigate(['/shops']);
                },

                error: (error) => {

                  console.error(
                    'Foto konnte nicht hochgeladen werden:',
                    error
                  );

                  this.errorMessage =
                    'Der Shop wurde gespeichert, aber das Foto konnte nicht hochgeladen werden.';

                  this.isSaving = false;

                  this.cdr.detectChanges();
                }
              });

          } else {

            // Kein neues Foto
            this.isSaving = false;

            this.router.navigate(['/shops']);
          }
        },

        error: (error) => {

          console.error(
            'Fehler beim Aktualisieren:',
            error
          );

          if (error.status === 403) {

            this.errorMessage =
              'Sie haben keine Berechtigung, diesen Shop zu bearbeiten.';

          } else if (error.status === 404) {

            this.errorMessage =
              'Der Shop wurde nicht gefunden.';

          } else {

            this.errorMessage =
              'Der Shop konnte nicht aktualisiert werden.';
          }

          this.isSaving = false;

          this.cdr.detectChanges();
        }
      });
  }

  cancel(): void {

    this.router.navigate(['/shops']);
  }
}