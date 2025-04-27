import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from '../../../service/app-settings.service';

@Component({
  selector: 'layout-mixed-nav-boxed-layout',
  templateUrl: './layout-mixed-nav-boxed-layout.html'
})

export class LayoutMixedNavBoxedLayoutPage {
	code1: any;

	constructor(private appSettings: AppSettings, private http: HttpClient) {
    this.appSettings.appTopNav = true;
    this.appSettings.appBoxedLayout = true;
    document.body.classList.add('app-with-bg');
  }
	
	ngOnInit() {this.http.get('/assets/data/layout-mixed-nav-boxed-layout/code-1.json', { responseType: 'text' }).subscribe(data => {
    	this.code1 = data;
		});
  }

  ngOnDestroy() {
    this.appSettings.appTopNav = false;
    this.appSettings.appBoxedLayout = false;
    document.body.classList.remove('app-with-bg');
  }
}
