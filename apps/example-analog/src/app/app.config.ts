import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  type ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideFileRouter, withExtraRoutes } from '@analogjs/router';
import HomePage from './pages/index.page';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    // The frame opens index.html. Hydration expects the prerendered "/" route
    // and clears the button, so the client renders that same page instead.
    provideFileRouter(withExtraRoutes([{ path: 'index.html', component: HomePage }])),
    provideHttpClient(withFetch()),
  ],
};
