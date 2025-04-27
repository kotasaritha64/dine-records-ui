import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppSettings {
	public appTheme: string = '';
	public appDarkMode: boolean = false;
	
	public appThemePanelNone: boolean = false;
	public appBoxedLayout: boolean = false;
  public appHeaderNone: boolean = false;
  public appTopNav: boolean = false;
  public appFooter: boolean = false;
  
  public appSidebarNone: boolean = false;
  public appSidebarMinified: boolean = true;
  public appSidebarMobileToggled: boolean = false;
  
  public appContentClass: string = '';
  public appContentFullHeight: boolean = false;
  public appContentFullWidth: boolean = false;

  public setLayoutForPage(page: string): void {
    if (page.includes('welcomepage')) {
      // Hide header, sidebar, and footer for the welcome page
      this.appHeaderNone = true;
      this.appSidebarNone = true;
      this.appFooter = false;
    } else {
      // Default layout for other pages
      this.appHeaderNone = false;
      this.appSidebarNone = false;
      this.appFooter = true;
    }
  }
  
}