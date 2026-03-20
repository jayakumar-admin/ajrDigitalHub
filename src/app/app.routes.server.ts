import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'preview/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'demo/:type',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
