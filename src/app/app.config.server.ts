import {ApplicationConfig, mergeApplicationConfig} from '@angular/core';
import {provideServerRendering, withRoutes} from '@angular/ssr';
import {HttpInterceptorFn, provideHttpClient, withInterceptors} from '@angular/common/http';
import {appConfig} from './app.config';
import {serverRoutes} from './app.routes.server';

const serverInterceptor: HttpInterceptorFn = (req, next) => {
  // If the request points to our API, reroute it to localhost to bypass network loopback issues in SSR container
  let url = req.url;
  if (url.startsWith('/api/') || url.includes('.run.app')) {
    const port = process.env['PORT'] || 4000;
    const path = url.startsWith('/') ? url : new URL(url).pathname;
    url = `http://127.0.0.1:${port}${path}`;
    const newReq = req.clone({ url });
    return next(newReq);
  }
  return next(req);
};

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    provideHttpClient(withInterceptors([serverInterceptor]))
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
