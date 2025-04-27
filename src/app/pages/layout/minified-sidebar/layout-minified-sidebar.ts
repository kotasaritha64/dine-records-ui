import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from '../../../service/app-settings.service';

@Component({
  selector: 'layout-minified-sidebar',
  templateUrl: './layout-minified-sidebar.html'
})

export class LayoutMinifiedSidebarPage {
	code1: any;

	constructor(private appSettings: AppSettings, private http: HttpClient) {
    this.appSettings.appSidebarMinified = true;
  }
	
	ngOnInit() {this.http.get('/assets/data/layout-minified-sidebar/code-1.json', { responseType: 'text' }).subscribe(data => {
    	this.code1 = data;
		});
  }

  ngOnDestroy() {
    this.appSettings.appSidebarMinified = false;
  }
}
