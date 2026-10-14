import {
  Component,
  inject,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { UserService } from '../services/user';
import { User } from '../models/user';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ShopService } from '../../shops/services/shop';
import { Shop } from '../../shops/models/shop';

@Component({
  selector: 'app-user-list',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss'
})
export class UserList implements OnInit {

  private readonly userService =inject(UserService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly shopService =inject(ShopService);

  shops: Shop[] = [];

  users: User[] = [];

  displayedColumns: string[] = [
    'username',
    'email',
    'role',
    'shops',
    'actions'
  ];


  ngOnInit(): void {
    this.loadUsers();
    this.loadShops();
  }


  private loadShops(): void {

    this.shopService
      .getShops()
      .subscribe({

        next: (shops: Shop[]) => {

          console.log(
            'SHOPS VOM BACKEND:',
            shops
          );

          this.shops = shops;

          this.cdr.detectChanges();
        },

        error: (error: unknown) => {

          console.error(
            'FEHLER BEIM LADEN DER SHOPS:',
            error
          );

        }

      });
  }


  private loadUsers(): void {

    this.userService
      .getUsers()
      .subscribe({

        next: (users: User[]) => {

          console.log(
            'USERS VOM BACKEND:',
            users
          );

          this.users = users;
          this.cdr.detectChanges();
        },

        error: (error: unknown) => {

          console.error(
            'FEHLER BEIM LADEN DER USERS:',
            error
          );

        }

      });
  }

  changeToUserAdmin(user: User): void {

    this.userService
      .changeRoleToUserAdmin(user.id)
      .subscribe({

        next: () => {

          user.role = 'USER_ADMIN';

        },

        error: (error: unknown) => {

          console.error(
            'Fehler beim Ändern der Rolle:',
            error
          );

        }

      });
  }


  changeToUser(user: User): void {

    this.userService
      .changeRoleToUser(user.id)
      .subscribe({

        next: () => {

          user.role = 'USER';

        },

        error: (error: unknown) => {

          console.error(
            'Fehler beim Ändern der Rolle:',
            error
          );

        }

      });
  }

  assignShop(
    user: User,
    shop: Shop
  ): void {

    this.userService
      .assignShop(user.id, shop.id)
      .subscribe({

        next: () => {

          if (!user.shopIds.includes(shop.id)) {
            user.shopIds.push(shop.id);
          }

          this.cdr.detectChanges();
        },

        error: (error: unknown) => {

          console.error(
            'Fehler beim Zuweisen des Shops:',
            error
          );

        }

      });
  }

  removeShop(
    user: User,
    shop: Shop
  ): void {

    this.userService
      .removeShop(user.id, shop.id)
      .subscribe({

        next: () => {

          user.shopIds =
            user.shopIds.filter(
              id => id !== shop.id
            );

          this.cdr.detectChanges();
        },

        error: (error: unknown) => {

          console.error(
            'Fehler beim Entfernen des Shops:',
            error
          );

        }

      });
  }

  deleteUser(user: User): void {
    const confirmed = confirm(
      `Möchtest du den Benutzer "${user.username}" wirklich löschen?`
    );

    if (!confirmed) {
      return;
    }

    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        // Benutzer aus der angezeigten Tabelle entfernen
        this.users = this.users.filter(
          existingUser => existingUser.id !== user.id
        );
      },
      error: (error) => {
        console.error('Fehler beim Löschen des Benutzers:', error);

        alert(
          error.error?.message ??
          'Der Benutzer konnte nicht gelöscht werden.'
        );
      }
    });
  }

}