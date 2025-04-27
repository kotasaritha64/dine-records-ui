import { Component, Input, Output, EventEmitter, Renderer2, OnDestroy } from '@angular/core';
import { AppSettings } from '../../service/app-settings.service';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';


declare var slideToggle: any;

interface NotificationData {
  icon: string;
  img: string;
  title: string;
  time: string;
}

@Component({
  selector: 'header',
  templateUrl: './header.component.html',
  host: {
  	class: 'app-header'
  }
})
export class HeaderComponent {
	notificationData : NotificationData[] = [{
		icon: 'fa fa-receipt fa-lg fa-fw text-success',
		img: '',
		title: 'Your store has a new order for 2 items totaling $1,299.00',
		time: 'just now'
	},{
		icon: 'far fa-user-circle fa-lg fa-fw text-muted',
		img: '',
		title: '3 new customer account is created',
		time: '2 minutes ago'
	},{
		icon: '',
		img: '/assets/img/icon/android.svg',
		title: 'Your android application has been approved',
		time: '5 minutes ago'
	},{
		icon: '',
		img: '/assets/img/icon/paypal.svg',
		title: 'Paypal payment method has been enabled for your store',
		time: '10 minutes ago'
	}];
	email:String = localStorage.getItem("email");
	
	constructor(public appSettings: AppSettings, private authService: AuthService, private router: Router) { }
	


	logout() {
		console.log('Logout clicked');  // Check if this is printed

		this.authService.signOut().then(() => {
		}).catch((error) => {
		  console.error('Logout Error:', error);
		  alert('Error logging out. Please try again.');
		});
	  }

	handleToggleSidebarMinify(event: MouseEvent) {
		event.preventDefault();
		
		if (!this.appSettings.appSidebarNone) {
			this.appSettings.appSidebarMinified = !this.appSettings.appSidebarMinified;
		}
	}
	
	handleToggleMobileSidebar(event: MouseEvent) {
		event.preventDefault();
		
		if (!(this.appSettings.appSidebarNone && this.appSettings.appTopNav)) {
			this.appSettings.appSidebarMobileToggled = !this.appSettings.appSidebarMobileToggled;
		} else {
			slideToggle(document.querySelector('.app-top-nav'));
			window.scrollTo(0, 0);
		}
	}
	
	handleAppToggleClass(event: MouseEvent, className: string) {
		event.preventDefault();
		
		var elm = document.getElementById('app');
		if (elm) {
			elm.classList.toggle(className);
		}
	}
}
