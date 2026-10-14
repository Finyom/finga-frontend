import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'shops/:shopId/edit',
    renderMode: RenderMode.Client
  },
  {
    path: 'shops/:shopId/products',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];