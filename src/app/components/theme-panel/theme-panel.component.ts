import { Component, Output, HostBinding, AfterViewInit, EventEmitter } 		 from '@angular/core';
import { AppVariablesService } from '../../service/app-variables.service';
import { AppSettings } from '../../service/app-settings.service';

declare var bootstrap: any;

@Component({
  selector: 'theme-panel',
  templateUrl: './theme-panel.component.html',
  host: {
  	'class': 'theme-panel'
  }
})

export class ThemePanelComponent implements AfterViewInit {
	@HostBinding('class.active') get hostClasses() { return this.active; }
	@Output() appDarkModeChanged = new EventEmitter<boolean>();
	@Output() appThemeChanged = new EventEmitter<boolean>();
	
	active: boolean = false;
	appVariables = this.appVariablesService.getAppVariables();
	appThemeDarkModeCheckbox: boolean = false;
	
	themeList = [
	 { name: 'Pink', bgClass: 'bg-pink', themeClass: 'theme-pink' },
	 { name: 'Red', bgClass: 'bg-red', themeClass: 'theme-red' },
	 { name: 'Orange', bgClass: 'bg-warning', themeClass: 'theme-warning' },
	 { name: 'Yellow', bgClass: 'bg-yellow', themeClass: 'theme-yellow' },
	 { name: 'Lime', bgClass: 'bg-lime', themeClass: 'theme-lime' },
	 { name: 'Green', bgClass: 'bg-green', themeClass: 'theme-green' },
	 { name: 'Default', bgClass: 'bg-teal', themeClass: 'theme-teal' },
	 { name: 'Cyan', bgClass: 'bg-info', themeClass: 'theme-info' },
	 { name: 'Blue', bgClass: 'bg-primary', themeClass: 'theme-primary' },
	 { name: 'Purple', bgClass: 'bg-purple', themeClass: 'theme-purple' },
	 { name: 'Indigo', bgClass: 'bg-indigo', themeClass: 'theme-indigo' },
	 { name: 'Gray', bgClass: 'bg-gray-200', themeClass: 'theme-gray-200' }
	];
	
	coverList = [
		{ name: 'Default', coverThumbImage: '/assets/img/cover/cover-thumb-1.jpg', coverClass: 'bg-cover-1'},
		{ name: 'Cover 2', coverThumbImage: '/assets/img/cover/cover-thumb-2.jpg', coverClass: 'bg-cover-2'},
		{ name: 'Cover 3', coverThumbImage: '/assets/img/cover/cover-thumb-3.jpg', coverClass: 'bg-cover-3'},
		{ name: 'Cover 4', coverThumbImage: '/assets/img/cover/cover-thumb-4.jpg', coverClass: 'bg-cover-4'},
		{ name: 'Cover 5', coverThumbImage: '/assets/img/cover/cover-thumb-5.jpg', coverClass: 'bg-cover-5'},
		{ name: 'Cover 6', coverThumbImage: '/assets/img/cover/cover-thumb-6.jpg', coverClass: 'bg-cover-6'},
		{ name: 'Cover 7', coverThumbImage: '/assets/img/cover/cover-thumb-7.jpg', coverClass: 'bg-cover-7'},
		{ name: 'Cover 8', coverThumbImage: '/assets/img/cover/cover-thumb-8.jpg', coverClass: 'bg-cover-8'},
		{ name: 'Cover 9', coverThumbImage: '/assets/img/cover/cover-thumb-9.jpg', coverClass: 'bg-cover-9'}
	];
	
	constructor(public appSettings: AppSettings, private appVariablesService: AppVariablesService) { }
	
	ngAfterViewInit() {
		var elm = document.querySelectorAll('[data-bs-toggle="tooltip"]');
		
		for (var i = 0; i < elm.length; i++) {
			new bootstrap.Tooltip(elm[i]);
		}
		if (localStorage) {
			if (localStorage['appDarkMode'] && localStorage['appDarkMode'] === 'true') {
				this.appThemeDarkModeCheckbox = true;
				this.appDarkModeChanged.emit(true);
			}
			if (localStorage['appTheme']) {
				this.handleSetTheme(localStorage['appTheme']);
			}
			if (localStorage['appThemePanelActive']) {
				this.active = (localStorage['appThemePanelActive'] == 'true') ? true : false;
			}
		}
	}
	
	handleToggleThemePanel(event: MouseEvent) {
		event.preventDefault();
		
		if (localStorage) {
			localStorage['appThemePanelActive'] = !this.active;
		}
		this.active = !this.active;
	}
	
	handleToggleTheme(event: MouseEvent, themeClass: string) {
		event.preventDefault();
		this.handleSetTheme(themeClass);
	}
	
	
	handleToggleDarkMode(e) {
		this.appSettings.appDarkMode = e.srcElement.checked;
		this.appDarkModeChanged.emit(true);
		if (localStorage) {
			localStorage['appDarkMode'] = e.srcElement.checked;
		}
	}

	handleSetTheme(themeClass: string) {
		this.appSettings.appTheme = themeClass;
		if (localStorage) {
			localStorage['appTheme'] = themeClass;
		}
		for (var x = 0; x < document.body.classList.length; x++) {
			var targetClass = document.body.classList[x];
			if (targetClass.search('theme-') > -1) {
				document.body.classList.remove(targetClass);
			}
		}
	
		document.body.classList.add(themeClass);
		this.appVariables = this.appVariablesService.getAppVariables();
		this.appVariablesService.variablesReload.emit();
	}
}
