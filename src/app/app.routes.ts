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
import { LayoutComponent } from './layout/layout';


export const routes: Routes = [
  // Login bleibt ohne Layout
  {
    path: 'login',
    component: Login
  },

  // Alle übrigen Seiten verwenden das gemeinsame Layout
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'shops',
        component: ShopList
      },
      {
        path: 'shops/create',
        component: ShopCreate,
        canActivate: [authGuard]
      },
      {
        path: 'shops/:shopId/edit',
        component: ShopEdit,
        canActivate: [authGuard]
      },
      {
        path: 'shops/:shopId/products',
        component: ProductList
      },
      {
        path: 'shops/:shopId/cart',
        component: CartComponent
      },
      {
        path: 'shops/:shopId/products/create',
        component: ProductCreate,
        canActivate: [authGuard]
      },
      {
        path: 'shops/:shopId/products/:productId/edit',
        component: ProductEdit,
        canActivate: [authGuard]
      },
      {
        path: 'shops/:shopId/products/:productId',
        component: ProductDetail
      },
      {
        path: 'users',
        component: UserList,
        canActivate: [adminGuard]
      },
      {
        path: '',
        redirectTo: 'shops',
        pathMatch: 'full'
      }
    ]
  }
];

