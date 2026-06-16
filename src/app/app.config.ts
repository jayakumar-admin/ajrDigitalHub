import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  inject
} from '@angular/core';
import {provideRouter, Router} from '@angular/router';
import {provideHttpClient, withInterceptors, HttpResponse} from '@angular/common/http';
import {map, catchError, throwError} from 'rxjs';
import {environment} from '../environments/environment';

import {routes} from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(), 
    provideRouter(routes),
    provideHttpClient(withInterceptors([
      (req, next) => {
        const router = inject(Router);
        const token = typeof window !== 'undefined' ? localStorage.getItem('saas_token') : null;
        const appId = typeof window !== 'undefined' ? localStorage.getItem('saas_active_app_id') : null;
        const externalBaseUrl = typeof window !== 'undefined' ? localStorage.getItem('AJR_EXTERNAL_API_URL') : null;
        
        let headers = req.headers;
        if (token) {
          headers = headers.set('Authorization', `Bearer ${token}`);
        }
        if (appId) {
          headers = headers.set('x-saas-api-key', appId);
        }
        
        // Resolve Target API URL dynamically
        let targetUrl = req.url;
        if (req.url.startsWith('/api') || req.url.startsWith('api')) {
          const base = externalBaseUrl || environment.apiBaseUrl || '/api';
          const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;

          let cleanEndpoint = req.url.startsWith('/') ? req.url : '/' + req.url;
          if (cleanBase.endsWith('/api') && cleanEndpoint.startsWith('/api')) {
            cleanEndpoint = cleanEndpoint.substring(4); // strip duplicate '/api'
          }
          if (!cleanEndpoint.startsWith('/')) {
            cleanEndpoint = '/' + cleanEndpoint;
          }
          targetUrl = `${cleanBase}${cleanEndpoint}`;
        }
        
        const authReq = req.clone({ url: targetUrl, headers });
        return next(authReq).pipe(
          catchError((err) => {
            console.error('API Error Intercepted:', err);
            if (err.status === 401) {
              console.warn('Unauthorized! Redirecting to login page.');
              if (typeof window !== 'undefined') {
                localStorage.removeItem('saas_token');
                localStorage.removeItem('saas_user');
              }
              router.navigate(['/admin/login']);
            } else if (err.status === 500) {
              console.error('Server Internal Error (500):', err.message || err);
            }
            return throwError(() => err);
          }),
          map(event => {
            if (event instanceof HttpResponse && event.body && typeof event.body === 'object') {
              const body = event.body as any;
              if (body.success === true && body.data !== undefined) {
                return event.clone({ body: body.data });
              }
            }
            return event;
          })
        );
      }
    ]))
  ],
};
