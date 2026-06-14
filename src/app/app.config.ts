import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideHttpClient, withInterceptors} from '@angular/common/http';

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
        return next(authReq);
      }
    ]))
  ],
};
