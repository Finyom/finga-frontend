import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  shopId: number;
  shopName: string;
  price: number;
  quantity: number;
  lineTotal: number;
  photoPath: string | null;
}

export interface CartResponse {
  id: number;
  items: CartItem[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/shops';

  getCart(shopId: number): Observable<CartResponse> {
    return this.http.get<CartResponse>(
      `${this.apiUrl}/${shopId}/cart`
    );
  }

  addItem(
    shopId: number,
    productId: number,
    quantity: number
  ): Observable<CartResponse> {
    return this.http.post<CartResponse>(
      `${this.apiUrl}/${shopId}/cart/items`,
      { productId, quantity }
    );
  }

  updateQuantity(
    shopId: number,
    productId: number,
    quantity: number
  ): Observable<CartResponse> {
    return this.http.put<CartResponse>(
      `${this.apiUrl}/${shopId}/cart/items/${productId}`,
      { quantity }
    );
  }

  removeItem(
    shopId: number,
    productId: number,
    quantity: number
  ): Observable<CartResponse> {
    const params = new HttpParams()
      .set('quantity', quantity);

    return this.http.delete<CartResponse>(
      `${this.apiUrl}/${shopId}/cart/items/${productId}`,
      { params }
    );
  }
}
