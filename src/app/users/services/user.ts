import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { User } from '../models/user';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/users`;


  /**
   * Get all users.
   * Only ADMIN is allowed by the backend.
   */
  getUsers(): Observable<User[]> {

    return this.http.get<User[]>(
      this.apiUrl
    );
  }


  /**
   * Assign a shop to a USER_ADMIN.
   */
  assignShop(
    userId: number,
    shopId: number
  ): Observable<void> {

    return this.http.post<void>(
      `${this.apiUrl}/${userId}/shops/${shopId}`,
      {}
    );
  }


  /**
   * Remove a shop from a USER_ADMIN.
   */
  removeShop(
    userId: number,
    shopId: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${userId}/shops/${shopId}`
    );
  }


  /**
   * Change the role to USER_ADMIN.
   */
  changeRoleToUserAdmin(
    userId: number
  ): Observable<void> {

    return this.http.put<void>(
      `${this.apiUrl}/${userId}/role/user-admin`,
      {}
    );
  }


  /**
   * Change the role to USER.
   */
  changeRoleToUser(
    userId: number
  ): Observable<void> {

    return this.http.put<void>(
      `${this.apiUrl}/${userId}/role/user`,
      {}
    );
  }

  deleteUser(userId: number): Observable<void> {
        return this.http.delete<void>(
            `${this.apiUrl}/${userId}`
        );
    }

}