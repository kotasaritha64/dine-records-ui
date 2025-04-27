import { Component, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, NavigationStart, ActivatedRoute } from '@angular/router';
import { AppVariablesService } from './service/app-variables.service';
import { AppSettings } from './service/app-settings.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent {
	appEvent = new EventEmitter<string>();
	appLoaded: boolean = false;
	appVariables = this.appVariablesService.getAppVariables();
	
	constructor(public appSettings: AppSettings, private cdr: ChangeDetectorRef, private appVariablesService: AppVariablesService) { }

	handleSetMode(mode: string) {
		document.documentElement.setAttribute('data-bs-theme', mode);
		this.appEvent.emit('theme-reload');
	}

	handleSetTheme(themeClass: string) {
		for (var x = 0; x < document.body.classList.length; x++) {
			var targetClass = document.body.classList[x];
			if (targetClass.search('theme-') > -1) {
				document.body.classList.remove(targetClass);
			}
		}
		document.body.classList.add(themeClass);
		this.appEvent.emit('theme-reload');
	}
	
	ngOnInit() {
		var elm = document.body;
		if (elm) {
			elm.classList.add('app-init');
		}
		
		if (this.appSettings.appDarkMode) {
			this.onAppDarkModeChanged(true);
		}
		if (this.appSettings.appTheme) {
			this.handleSetTheme(this.appSettings.appTheme);
		}
		if (localStorage) {
			if (localStorage['appDarkMode']) {
				this.appSettings.appDarkMode = (localStorage['appDarkMode'] === 'true') ? true : false;
				if (this.appSettings.appDarkMode) {
					this.onAppDarkModeChanged(true);
				}
			}
		}
	}
	
	ngAfterViewInit() {
		this.appLoaded = true;
		this.cdr.detectChanges();
	}
	
	onAppDarkModeChanged(val: boolean): void {
		if (this.appSettings.appDarkMode) {
			document.documentElement.setAttribute('data-bs-theme', 'dark');
		} else {
			document.documentElement.removeAttribute('data-bs-theme');
		}
		this.appVariables = this.appVariablesService.getAppVariables();
		this.appVariablesService.variablesReload.emit();
		document.dispatchEvent(new CustomEvent('theme-change'));
	}
	

	onAppThemeChanged(val: boolean): void {
		const newTheme = 'theme-' + this.appSettings.appTheme;
		for (let x = 0; x < document.body.classList.length; x++) {
			if ((document.body.classList[x]).indexOf('theme-') > -1 && document.body.classList[x] !== newTheme) {
				document.body.classList.remove(document.body.classList[x]);
			}
		}
		document.body.classList.add(newTheme);
		this.appVariables = this.appVariablesService.getAppVariables();
		this.appVariablesService.variablesReload.emit();
	}
}
