import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Shop } from '../models/shop';

@Injectable({
  providedIn: 'root'
})
export class ShopService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:8080/api/shops';

  getShops(): Observable<Shop[]> {
    return this.http.get<Shop[]>(this.apiUrl);
  }

  getShop(id: number): Observable<Shop> {
    return this.http.get<Shop>(
      `${this.apiUrl}/${id}`
    );
  }

  createShop(shop: CreateShopRequest): Observable<Shop> {
    return this.http.post<Shop>(
      this.apiUrl,
      shop
    );
  }

  updateShop(id: number, shop: CreateShopRequest): Observable<Shop> {

    return this.http.put<Shop>(
        `${this.apiUrl}/${id}`,
        shop
    );
 }

  deleteShop(shopId: number): Observable<void> {
    return this.http.delete<void>(
        `${this.apiUrl}/${shopId}`
    );
 }
 
 uploadShopPhoto(
    shopId: number,
    file: File
    ): Observable<void> {

    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<void>(
        `${this.apiUrl}/${shopId}/photo`,
        formData
    );
 }

    
}

export interface CreateShopRequest {
  name: string;
  description: string;
  address: string;
}