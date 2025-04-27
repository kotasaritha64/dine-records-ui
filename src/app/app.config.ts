import {ApplicationConfig, importProvidersFrom} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app-routing.module';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideHttpClient } from '@angular/common/http';
import {getAuth, provideAuth} from '@angular/fire/auth'

const firebaseConfig = {
    apiKey: "AIzaSyBchxDyrIrAHfc1140b71pajsouCvuycRA",
    authDomain: "dine-records.firebaseapp.com",
    projectId: "dine-records",
    storageBucket: "dine-records.appspot.com",
    messagingSenderId: "585022336149",
    appId: "1:585022336149:web:6153ad3752b8791653ff9c",
    measurementId: "G-Z98RG4QE41"
  };

  export const appConfig: ApplicationConfig= {
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        //importProvidersFrom(
            provideFirebaseApp(() => initializeApp(firebaseConfig)),
            provideAuth(() => getAuth())
        //)
      ],
  };