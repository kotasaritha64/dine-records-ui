import { Component } from '@angular/core';
import { AppSettings } from '../../../service/app-settings.service';

@Component({
  selector: 'page-gallery',
  templateUrl: './page-gallery.html'
})

export class GalleryPage {
	constructor(private appSettings: AppSettings) {
    this.appSettings.appSidebarMinified = true;
    this.appSettings.appContentClass = 'p-0';
    this.appSettings.appContentFullHeight = true;
  }
  
  ngOnDestroy() {
    this.appSettings.appSidebarMinified = false;
    this.appSettings.appContentClass = '';
    this.appSettings.appContentFullHeight = false;
  }
}
