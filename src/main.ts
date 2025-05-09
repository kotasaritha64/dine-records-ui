import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { bootstrapApplication } from '@angular/platform-browser';

if (environment.production) {
  enableProdMode();
}

// bootstrapApplication(AppComponent, appConfig)
//   .catch(err => console.error(err));
  
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
