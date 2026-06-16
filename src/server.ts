import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import app from '../server/src/index';
import { seedDatabase } from '../server/src/seed';

const sysPath = process.cwd();
const browserDistFolder = join(sysPath, 'dist/app/browser');

const angularApp = new AngularNodeAppEngine();

// Database initialization is handled in the server start block below

// Integrate our modular Express app into the SSR entry point
// We use the 'app' from /server/src/app.ts for API routes
// The angular app engine handles everything else

/**
 * Serve static files from /browser
 */
// app.use(
//   express.static(browserDistFolder, {
//     maxAge: '1y',
//     index: false,
//     redirect: false,
//   }),
// );

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 3000;
  
  // Await seeding before listening
  seedDatabase().then(() => {
    app.listen(port, () => {
      console.log(`🚀 AJR Digital HUB Unified Server listening on http://localhost:${port}`);
    });
  }).catch(err => {
    console.error('Failed to start server due to seeding error:', err);
    process.exit(1);
  });
}

/**
 * Request handler used by the Angular CLI
 */
export const reqHandler = createNodeRequestHandler(app);
