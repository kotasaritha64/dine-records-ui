import { Component, OnInit } from '@angular/core';
import { AppMenuService } from '../../service/app-menus.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AppSettings } from '../../service/app-settings.service';

declare var slideToggle: any;
declare var slideUp: any;

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html'
})

export class SidebarComponent implements OnInit {
	menus: any[] = [];
	appSidebarFloatSubMenu: any;
	appSidebarFloatSubMenuHide: any;
	appSidebarFloatSubMenuHideTime: any = 250;
	appSidebarFloatSubMenuTop: any;
	appSidebarFloatSubMenuLeft: any = '60px';
	appSidebarFloatSubMenuRight: any;
  appSidebarFloatSubMenuBottom: any;
  appSidebarFloatSubMenuOffset: any;
	
	constructor(public appSettings: AppSettings, private appMenuService: AppMenuService, private router: Router) { }
	
	ngOnInit() {
		this.menus = this.appMenuService.getAppMenus();
	}
	
	isActive(path: string) {
		return this.router.url === path;
	}
	
	isChildActive(menus: any) {
		var active = false;
		if (menus.length > 0) {
			for (let menu of menus) {
				if (this.router.url === menu.path) {
					active = true;
				}
			}
		}
		return active;
	}
	
	handleExpandSubmenu(event: MouseEvent) {
		event.preventDefault();
		var targetMenuLinkElm = event.target as HTMLElement;
		var targetMenuItemElm = targetMenuLinkElm.closest('.menu-item');
		
		if (targetMenuItemElm) {
			var targetSubmenu = targetMenuItemElm.querySelector('.menu-submenu');
			var targetSubmenuElm = targetSubmenu as HTMLElement;
			var hassubMenuLinkList = [].slice.call(document.querySelectorAll('.app-sidebar .menu > .menu-item.has-sub > .menu-link'));
			
			if (hassubMenuLinkList) {
				hassubMenuLinkList.map(function(menuLink) {
					var menuLinkElm = menuLink as HTMLElement;
					var menuItemElm = menuLinkElm.closest('.menu-item');
					
					if (menuItemElm) {
						var submenu = menuItemElm.querySelector('.menu-submenu');
						var submenuElm = submenu as HTMLElement;
					
						if (submenuElm != targetSubmenuElm) {
							slideUp(submenuElm, 300);
						}
					}
				});
			}
			
			slideToggle(targetSubmenuElm, 300);
		}
	}
	
	calculateAppSidebarFloatSubMenuPosition() {
		var targetTop = this.appSidebarFloatSubMenuOffset.top;
    var direction = document.body.style.direction;
    var windowHeight = window.innerHeight;

    setTimeout(() => {
      let targetElm = <HTMLElement> document.querySelector('.app-float-submenu');
      let targetSidebar = <HTMLElement> document.querySelector('.app-sidebar');
      var targetHeight = targetElm.offsetHeight;
      this.appSidebarFloatSubMenuRight = 'auto';
      this.appSidebarFloatSubMenuLeft = (60 + targetSidebar.offsetLeft) + 'px';

      if ((windowHeight - targetTop) > targetHeight) {
        this.appSidebarFloatSubMenuTop = this.appSidebarFloatSubMenuOffset.top + 'px';
        this.appSidebarFloatSubMenuBottom = 'auto';
      } else {
        this.appSidebarFloatSubMenuTop = 'auto';
        this.appSidebarFloatSubMenuBottom = '0';
      }
    }, 0);
	}

	showAppSidebarFloatSubMenu(menu, e) {
	  if (this.appSettings.appSidebarMinified) {
      clearTimeout(this.appSidebarFloatSubMenuHide);

      this.appSidebarFloatSubMenu = menu;
      this.appSidebarFloatSubMenuOffset = e.target.getBoundingClientRect();
      this.calculateAppSidebarFloatSubMenuPosition();
    }
	}

	hideAppSidebarFloatSubMenu() {
	  this.appSidebarFloatSubMenuHide = setTimeout(() => {
	    this.appSidebarFloatSubMenu = '';
	  }, this.appSidebarFloatSubMenuHideTime);
	}

	remainAppSidebarFloatSubMenu() {
		clearTimeout(this.appSidebarFloatSubMenuHide);
	}
	
	toggleAppSidebarMobile() {
		this.appSettings.appSidebarMobileToggled = !this.appSettings.appSidebarMobileToggled;
	}
}
