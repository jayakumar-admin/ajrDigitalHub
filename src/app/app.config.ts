import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideHttpClient, withInterceptors, HttpResponse} from '@angular/common/http';
import {map} from 'rxjs';

import {routes} from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(), 
    provideRouter(routes),
    provideHttpClient(withInterceptors([
      (req, next) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('saas_token') : null;
        const appId = typeof window !== 'undefined' ? localStorage.getItem('saas_active_app_id') : null;
        
        let headers = req.headers;
        if (token) {
          headers = headers.set('Authorization', `Bearer ${token}`);
        }
        if (appId) {
          headers = headers.set('x-saas-api-key', appId);
        }
        
        const authReq = req.clone({ headers });
        return next(authReq).pipe(
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
