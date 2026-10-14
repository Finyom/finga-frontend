import { Routes } from '@angular/router';

import { Login } from './auth/login/login';
import { authGuard } from './auth/auth.guard';

import { ShopList } from './shops/shop-list/shop-list';
import { ShopCreate } from './shops/shop-create/shop-create';
import { ShopEdit } from './shops/shop-edit/shop-edit';

import { ProductList } from './products/product-list/product-list';
import { ProductCreate } from './products/product-create/product-create';
import { ProductDetail } from './products/product-detail/product-detail';
import { ProductEdit } from './products/product-edit/product-edit';
import { UserList } from './users/user-list/user-list';
import { adminGuard } from './auth/admin-guard';
import { CartComponent } from './cart/cart';


export const routes: Routes = [

  // ==========================================
  // LOGIN
  // ==========================================

  {
    path: 'login',
    component: Login
  },


  // ==========================================
  // ÖFFENTLICH
  // Gast darf Shops ansehen
  // ==========================================

  {
    path: 'shops',
    component: ShopList
  },


  // ==========================================
  // GESCHÜTZT
  // Shop erstellen
  // ==========================================

  {
    path: 'shops/create',
    component: ShopCreate,
    canActivate: [authGuard]
  },


  // ==========================================
  // GESCHÜTZT
  // Shop bearbeiten
  // ==========================================

  {
    path: 'shops/:shopId/edit',
    component: ShopEdit,
    canActivate: [authGuard]
  },


  // ==========================================
  // ÖFFENTLICH
  // Produkte eines Shops ansehen
  // ==========================================

  {
    path: 'shops/:shopId/products',
    component: ProductList
  },

  {
    path: 'shops/:shopId/cart',
    component: CartComponent
  },

  // ==========================================
  // GESCHÜTZT
  // Produkt erstellen
  // ==========================================

  {
    path: 'shops/:shopId/products/create',
    component: ProductCreate,
    canActivate: [authGuard]
  },

  // ==========================================
  // ÖFFENTLICH
  // Produktdetails ansehen
  // ==========================================

  {
    path: 'shops/:shopId/products/:productId',
    component: ProductDetail,
  },


  // ==========================================
  // GESCHÜTZT
  // Produkt bearbeiten
  // ==========================================

  {
    path: 'shops/:shopId/products/:productId/edit',
    component: ProductEdit,
    canActivate: [authGuard]
  },

  // ==========================================
  // GESCHÜTZT
  // ADMIN-BEREICH
  // ==========================================

  {
    path: 'users',
    component: UserList,
    canActivate: [adminGuard]
  },

  // ==========================================
  // STARTSEITE
  // ==========================================

  {
    path: '',
    redirectTo: 'shops',
    pathMatch: 'full'
  }

];

