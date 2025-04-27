import { Component, ViewEncapsulation } from '@angular/core';
import { AppSettings } from '../../service/app-settings.service';
import 'lity';

@Component({
  selector: 'profile',
  templateUrl: './profile.html',
  styleUrls: [ './profile.css' ],
  encapsulation: ViewEncapsulation.None
})

export class ProfilePage {
	constructor(private appSettings: AppSettings) {
    this.appSettings.appContentClass = 'p-0';
  }
  
  ngOnDestroy() {
    this.appSettings.appContentClass = '';
  }
}
