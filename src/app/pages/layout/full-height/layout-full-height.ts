import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from '../../../service/app-settings.service';

@Component({
  selector: 'layout-full-height',
  templateUrl: './layout-full-height.html'
})

export class LayoutFullHeightPage {
	code1: any;

	constructor(private appSettings: AppSettings, private http: HttpClient) {
    this.appSettings.appContentFullHeight = true;
    this.appSettings.appContentClass = 'p-0';
  }
	
	ngOnInit() {
    this.http.get('/assets/data/layout-full-height/code-1.json', { responseType: 'text' }).subscribe(data => {
    	this.code1 = data;
		});
  }

  ngOnDestroy() {
    this.appSettings.appContentFullHeight = false;
    this.appSettings.appContentClass = '';
  }
}
