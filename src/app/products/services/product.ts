import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Product, UpdateProductRequest, CreateProductRequest} from '../models/product';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/api/shops`;


  // GET: Alle Produkte eines Shops
  getProducts(shopId: number): Observable<Product[]> {

    return this.http.get<Product[]>(
      `${this.apiUrl}/${shopId}/products`
    );
  }


  // GET: Ein bestimmtes Produkt
  getProduct(
    shopId: number,
    productId: number
    ): Observable<Product> {

    return this.http.get<Product>(
        `${this.apiUrl}/${shopId}/products/${productId}`
    );
}


  // POST: Neues Produkt erstellen
  createProduct(
    shopId: number,
    product: CreateProductRequest
  ): Observable<Product> {

    return this.http.post<Product>(
      `${this.apiUrl}/${shopId}/products`,
      product
    );
  }

  updateProduct(
    shopId: number,
    productId: number,
    product: UpdateProductRequest
    ): Observable<Product> {
    return this.http.put<Product>(
        `${this.apiUrl}/${shopId}/products/${productId}`,
        product
    );
 }

 deleteProduct(
    shopId: number,
    productId: number
    ): Observable<void> {
    return this.http.delete<void>(
        `${this.apiUrl}/${shopId}/products/${productId}`
    );
 }

 uploadProductPhoto(
    shopId: number,
    productId: number,
    file: File
    ): Observable<void> {

    const formData = new FormData();

    formData.append('file', file);

    return this.http.post<void>(
        `${this.apiUrl}/${shopId}/products/${productId}/photo`,
        formData
    );
    }
}
