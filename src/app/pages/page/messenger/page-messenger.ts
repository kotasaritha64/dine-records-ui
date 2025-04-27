import { Component } from '@angular/core';
import { AppSettings } from '../../../service/app-settings.service';

@Component({
  selector: 'page-messenger',
  templateUrl: './page-messenger.html'
})

export class MessengerPage {
	constructor(private appSettings: AppSettings) {
    this.appSettings.appContentClass = 'p-0';
    this.appSettings.appContentFullHeight = true;
  }
  
  ngOnDestroy() {
    this.appSettings.appContentClass = '';
    this.appSettings.appContentFullHeight = false;
  }
}
