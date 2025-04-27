import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class AppMenuService {
	getAppMenus() {
		return [
			{ 'text': 'Navigation', 'is_header': true },
			{ 'path': '/dashboard', 'icon': 'fa fa-laptop', 'text': 'Dashboard' },
			{ 'path': '/analytics', 'icon': 'fa fa-chart-pie', 'text': 'Analytics' },
			{ 'path': '/email/', 'icon': 'fa fa-envelope', 'text': 'Email', 'label': '6',
				'children': [
					{ 'path': '/email/inbox', 'text': 'Inbox' },
					{ 'path': '/email/compose', 'text': 'Compose' },
					{ 'path': '/email/detail', 'text': 'Detail' }
				]
			},
			{ 'is_divider': true },
			{ 'text': 'Components', 'is_header': true },
			{ 'path': '/widgets', 'icon': 'fa fa-qrcode', 'text': 'Widgets' }, 
			{ 'path': '/pos', 'icon': 'fa fa-wallet', 'text': 'POS System',
				'children': [
					{ 'path': '/pos/customer-order', 'text': 'Customer Order' }, 
					{ 'path': '/pos/kitchen-order', 'text': 'Kitchen Order' }, 
					{ 'path': '/pos/counter-checkout', 'text': 'Counter Checkout' }, 
					{ 'path': '/pos/table-page', 'text': 'Table Booking' }, 
					{ 'path': '/pos/menu-stock', 'text': 'Menu Stock' },
					{ 'path': '/pos/orders-dashboard', 'text': 'Orders Dashboard' }
				]
			},
			{ 'path': '/page/restaurant-info', 'icon': 'fa fa-check-square', 'text': 'Restaurant Info',				
			},
			{ 'path': '/page/menu-configuration', 'icon': 'fa fa-map', 'text': 'Menu Configuration',
				'children': [
					{ 'path': '/page/menu-configuration', 'text': 'Menu Items' }, 
			
				]
			},
			{
				'path': '/ui/', 'icon': 'fa fa-heart', 'text': 'UI Kits',
				'children': [
					{ 'path': '/ui/bootstrap', 'text': 'Bootstrap' },
					{ 'path': '/ui/buttons', 'text': 'Buttons' },
					{ 'path': '/ui/card', 'text': 'Card' },
					{ 'path': '/ui/icons', 'text': 'Icons' },
					{ 'path': '/ui/modal-notifications', 'text': 'Modal & Notifications' },
					{ 'path': '/ui/typography', 'text': 'Typography' },
					{ 'path': '/ui/tabs-accordions', 'text': 'Tabs & Accordions' }
				]
			},
			{
				'path': '/form/', 'icon': 'fa fa-file-alt', 'text': 'Forms',
				'children': [
					{ 'path': '/form/elements', 'text': 'Form Elements' },
					{ 'path': '/form/plugins', 'text': 'Form Plugins' },
					{ 'path': '/form/wizards', 'text': 'Wizards' }
				]
			},
			{ 'path': '/table/', 'icon': 'fa fa-table', 'text': 'Tables',
				'children': [
					{ 'path': '/table/elements', 'text': 'Table Elements' },
					{ 'path': '/table/plugins', 'text': 'Table Plugins' }
				]
			},
			{ 'path': '/chart/', 'icon': 'fa fa-chart-bar', 'text': 'Charts',
				'children': [
					{ 'path': '/chart/js', 'text': 'Chart.js' },
					{ 'path': '/chart/apex', 'text': 'Apexcharts.js' }
				]
			},
			{ 'path': '/map', 'icon': 'fa fa-map-marker-alt', 'text': 'Map' },
			{ 'path': '/layout', 'icon': 'fa fa-code-branch', 'text': 'Layout',
				'children': [
					{ 'path': '/layout/starter', 'text': 'Starter Page' },
					{ 'path': '/layout/fixed-footer', 'text': 'Fixed Footer' },
					{ 'path': '/layout/full-height', 'text': 'Full Height' },
					{ 'path': '/layout/full-width', 'text': 'Full Width' },
					{ 'path': '/layout/boxed-layout', 'text': 'Boxed Layout' },
					{ 'path': '/layout/minified-sidebar', 'text': 'Minified Sidebar' },
					{ 'path': '/layout/top-nav', 'text': 'Top Nav' },
					{ 'path': '/layout/mixed-nav', 'text': 'Mixed Nav' }, 
					{ 'path': '/layout/mixed-nav-boxed-layout', 'text': 'Mixed Nav Boxed Layout' }
				]
			},
			
			{ 'path': '/page/', 'icon': 'fa fa-globe', 'text': 'Pages',
				'children': [
					{ 'path': '/page/scrum-board', 'text': 'Scrum Board' },
					{ 'path': '/page/products', 'text': 'Products' },
					{ 'path': '/page/product-details', 'text': 'Product Details' },
					{ 'path': '/page/orders', 'text': 'Orders' },
					{ 'path': '/page/order-details', 'text': 'Order Details' },
					{ 'path': '/page/gallery', 'text': 'Gallery' },
					{ 'path': '/page/search-results', 'text': 'Search Results' },
					{ 'path': '/page/coming-soon', 'text': 'Coming Soon Page' },
					{ 'path': '/page/error', 'text': 'Error Page' },
					{ 'path': '/page/login', 'text': 'Login' },
					{ 'path': '/page/register', 'text': 'Register'},
					{ 'path': '/page/messenger', 'text': 'Messenger'},
					{ 'path': '/page/data-management', 'text': 'Data Management'},
					{ 'path': '/page/file-manager', 'text': 'File Manager'},
					{ 'path': '/page/pricing', 'text': 'Pricing Page'},
					{ 'path': '/page/welcomepage', 'text': 'WelcomePage'}
				]
			},
			{ 'path': '/landing', 'icon': 'fa fa-crown', 'text': 'Landing Page' },
			{ 'is_divider': true },
			{ 'text': 'Users', 'is_header': true },
			{ 'path': '/profile', 'icon': 'fa fa-user-circle', 'text': 'Profile' },
			{ 'path': '/calendar', 'icon': 'fa fa-calendar', 'text': 'Calendar' },
			{ 'path': '/settings', 'icon': 'fa fa-cog', 'text': 'Settings' },
			{ 'path': '/helper', 'icon': 'fa fa-question-circle', 'text': 'Helper' }
		];
	}
}