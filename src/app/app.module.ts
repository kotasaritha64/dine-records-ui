// Core Module
import { Router, NavigationEnd, ActivatedRoute, RouterModule }   from '@angular/router';
import { CommonModule, JsonPipe }                  from '@angular/common';
import { HttpClientModule }                        from '@angular/common/http';
import { NgModule }                                from '@angular/core';
import { FormsModule, ReactiveFormsModule }        from '@angular/forms';
import { BrowserModule, Title }                    from '@angular/platform-browser';
import { BrowserAnimationsModule }                 from '@angular/platform-browser/animations';
import { AppRoutingModule, routes }                        from './app-routing.module';
import { environment }                             from './service/environment';
import { AuthService }                             from './service/auth.service';
import { provideFirebaseApp, initializeApp }       from '@angular/fire/app';
import { provideAuth, getAuth }                    from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { DatePipe } from '@angular/common'; 
import { PaymentComponent } from './pages/payment/payment.component';
// Plugins
import { NgScrollbarModule, NG_SCROLLBAR_OPTIONS } from 'ngx-scrollbar';
import { provideHighlightOptions, HighlightAuto }  from 'ngx-highlightjs';
import { FullCalendarModule }                      from '@fullcalendar/angular';
import { NgxMasonryModule }                        from 'ngx-masonry';
import { NgbDatepickerModule, 
         NgbAlertModule,
         NgbTypeaheadModule,
         NgbTimepickerModule }                     from '@ng-bootstrap/ng-bootstrap';
import { ColorSketchModule }                       from 'ngx-color/sketch';
import { TagInputModule }                          from 'ngx-chips';
import { NgxMaskDirective, 
         NgxMaskPipe, 
         provideNgxMask }                          from 'ngx-mask';
import { QuillModule }                             from 'ngx-quill';
import { NgSelectModule }                          from '@ng-select/ng-select';
import { CountdownModule }                         from 'ngx-countdown';
import { NgChartsModule }                          from 'ng2-charts';
import { NgApexchartsModule }                      from 'ng-apexcharts';
import { DragDropModule }                          from '@angular/cdk/drag-drop';


// App Component
import { AppComponent }                    from './app.component';
import { HeaderComponent }                 from './components/header/header.component';
import { TopNavComponent }                 from './components/top-nav/top-nav.component';
import { SidebarComponent }                from './components/sidebar/sidebar.component';
import { SidebarMobileBackdropComponent }  from './components/sidebar-mobile-backdrop/sidebar-mobile-backdrop.component';
import { FloatSubMenuComponent }           from './components/float-sub-menu/float-sub-menu.component';
import { FooterComponent }                 from './components/footer/footer.component';
import { ThemePanelComponent }             from './components/theme-panel/theme-panel.component';
import { NavScrollComponent }              from './components/nav-scroll/nav-scroll.component';
import { CardComponent, 
         CardHeaderComponent, 
         CardBodyComponent, 
         CardFooterComponent, 
         CardImgOverlayComponent, 
         CardGroupComponent,
         CardExpandTogglerComponent }      from './components/card/card.component';

import { DashboardPage }                   from './pages/dashboard/dashboard';

import { AnalyticsPage }                   from './pages/analytics/analytics';
         
import { EmailInboxPage }                  from './pages/email/inbox/email-inbox';
import { EmailComposePage }                from './pages/email/compose/email-compose';
import { EmailDetailPage }                 from './pages/email/detail/email-detail';

import { WidgetsPage }                     from './pages/widgets/widgets';

//POS
import { PosCustomerOrderPage }            from './pages/pos/customer-order/pos-customer-order';
import { PosKitchenOrderPage }             from './pages/pos/kitchen-order/pos-kitchen-order';
import { PosCounterCheckoutPage }          from './pages/pos/counter-checkout/pos-counter-checkout';
import { PosTableBookingPage }             from './pages/pos/table-booking/pos-table-booking';
import { PosMenuStockPage }                from './pages/pos/menu-stock/pos-menu-stock';
import { PosTableDashboardPage }           from  './pages/pos/table-dashboard/table-dashboard.component';
import { TablePageComponent }              from './pages/pos/table-page/table-page.component';
import { OrdersDashboardComponent }         from './pages/pos/orders-dashboard/orders-dashboard.component';

import { UiBootstrapPage }                 from './pages/ui/bootstrap/ui-bootstrap';
import { UiButtonsPage }                   from './pages/ui/buttons/ui-buttons';
import { UiCardPage }                      from './pages/ui/card/ui-card';
import { UiIconsPage }                     from './pages/ui/icons/ui-icons';
import { UiModalNotificationsPage }        from './pages/ui/modal-notifications/ui-modal-notifications';
import { UiTypographyPage }                from './pages/ui/typography/ui-typography';
import { UiTabsAccordionsPage }            from './pages/ui/tabs-accordions/ui-tabs-accordions';

import { FormElementsPage }                from './pages/form/elements/form-elements';
import { FormPluginsPage }                 from './pages/form/plugins/form-plugins';
import { FormWizardsPage }                 from './pages/form/wizards/form-wizards';

import { TableElementsPage }               from './pages/table/elements/table-elements';
import { TablePluginsPage }                from './pages/table/plugins/table-plugins';

import { ChartJsPage }                     from './pages/chart/js/chart-js';
import { ChartApexPage }                   from './pages/chart/apex/chart-apex';

import { MapPage }                         from './pages/map/map';

import { LayoutStarterPage }               from './pages/layout/starter/layout-starter';
import { LayoutFixedFooterPage }           from './pages/layout/fixed-footer/layout-fixed-footer';
import { LayoutFullHeightPage }            from './pages/layout/full-height/layout-full-height';
import { LayoutFullWidthPage }             from './pages/layout/full-width/layout-full-width';
import { LayoutBoxedLayoutPage }           from './pages/layout/boxed-layout/layout-boxed-layout';
import { LayoutMinifiedSidebarPage }      from './pages/layout/minified-sidebar/layout-minified-sidebar';
import { LayoutTopNavPage }                from './pages/layout/top-nav/layout-top-nav';
import { LayoutMixedNavPage }              from './pages/layout/mixed-nav/layout-mixed-nav';
import { LayoutMixedNavBoxedLayoutPage }   from './pages/layout/mixed-nav-boxed-layout/layout-mixed-nav-boxed-layout';

import { ScrumBoardPage }                  from './pages/page/scrum-board/page-scrum-board';
import { ProductsPage }                    from './pages/page/products/page-products';
import { ProductDetailsPage }              from './pages/page/product-details/page-product-details';
import { OrdersPage }                      from './pages/page/orders/page-orders';
import { OrderDetailsPage }                from './pages/page/order-details/page-order-details';
import { GalleryPage }                     from './pages/page/gallery/page-gallery';
import { SearchResultsPage }               from './pages/page/search-results/page-search-results';
import { ComingSoonPage }                  from './pages/page/coming-soon/page-coming-soon';
import { ErrorPage }                       from './pages/page/error/page-error';
import { LoginPage }                       from './pages/page/login/page-login';
import { RegisterPage }                    from './pages/page/register/page-register';
import { MessengerPage }                   from './pages/page/messenger/page-messenger';
import { DataManagementPage }              from './pages/page/data-management/page-data-management';
import { FileManagerPage }                 from './pages/page/file-manager/page-file-manager';
import { PricingPage }                     from './pages/page/pricing/page-pricing';
import { LandingPage }                     from './pages/landing/landing';

import { ProfilePage }                     from './pages/profile/profile';
import { CalendarPage }                    from './pages/calendar/calendar';
import { SettingsPage }                    from './pages/settings/settings';
import { HelperPage }                      from './pages/helper/helper';
import { WelcomeComponent }                from './pages/welcome-page/welcome/welcome.component';
//Menu
import { MenuConfigurationComponent}       from './pages/menu-configuration/menu-configuration/menu-configuration.component';
import { MenuItemsComponent }              from './pages/menu-configuration/menu-items/menu-items.component';
import { AddMenuComponent }                from './pages/menu-configuration/add-menu/add-menu.component';
import { AddCategoryComponent }            from './pages/menu-configuration/add-category/add-category.component';
import { CategoriesComponent}              from './pages/menu-configuration/categories/categories.component';
import { VariantsComponent}                from './pages/menu-configuration/variants/variants.component';
import { MenuLandingPageComponent }        from './pages/menu-configuration/menu-landing-page/menu-landing-page.component';
import { TableAreaComponent }              from './pages/menu-configuration/table-area/table-area.component';
import { EditMenuComponent }               from './pages/menu-configuration/edit-menu/edit-menu.component';
import { AddOnsComponent }                 from './pages/menu-configuration/add-ons/add-ons.component';
import { AssignAddOnsComponent }           from  './pages/menu-configuration/assign-add-ons/assign-add-ons.component';
import { EditAddOnsComponent }             from  './pages/menu-configuration/edit-add-ons/edit-add-ons.component';      
import { DiscountsComponent }              from  './pages/menu-configuration/discounts/discounts.component';
import { AddDiscountsComponent }           from  './pages/menu-configuration/add-discounts/add-discounts.component';
import { TaxesComponent }                  from   './pages/menu-configuration/taxes/taxes.component';
import { AddTaxesComponent }               from   './pages/menu-configuration/add-taxes/add-taxes.component';
import { ParentCategoryComponent }         from  './pages/menu-configuration/parent-category/parent-category.component'; 
import { GroupCategoryComponent}           from  './pages/menu-configuration/group-category/group-category.component';

//Restaurant
import { RestaurantInfoComponent }         from './pages/restaurant-info-page/restaurant-info/restaurant-info.component';
//NgRx
import { StoreModule }                     from '@ngrx/store';
import { StoreDevtoolsModule }             from '@ngrx/store-devtools';
import { StoreRouterConnectingModule }     from '@ngrx/router-store';
import {  metaReducers }                   from '../../src/app/store/restaurant.meta-reducer'
import { restaurantReducer }               from '../../src/app/store/restaurant.reducer';
import {ToastComponent}                    from './toast//toast/toast.component'
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    TopNavComponent,
    SidebarComponent,
    SidebarMobileBackdropComponent,
    FloatSubMenuComponent,
    FooterComponent,
    ThemePanelComponent,
    NavScrollComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    CardFooterComponent,
    CardImgOverlayComponent,
    CardGroupComponent,
    CardExpandTogglerComponent,
    
    DashboardPage,
    
    AnalyticsPage,
    
    EmailInboxPage,
    EmailComposePage,
    EmailDetailPage,
    
    WidgetsPage,
    
    PosCustomerOrderPage,
    PosKitchenOrderPage,
    PosCounterCheckoutPage,
    PosTableBookingPage,
    PosMenuStockPage,
    PosTableDashboardPage,
    TablePageComponent,
    OrdersDashboardComponent,
    //TimeslotBookingComponent,
    
    UiBootstrapPage,
    UiButtonsPage,
    UiCardPage,
    UiIconsPage,
    UiModalNotificationsPage,
    UiTypographyPage,
    UiTabsAccordionsPage,
    
    FormElementsPage,
    FormPluginsPage,
    FormWizardsPage,
    
    TableElementsPage,
    TablePluginsPage,
    
    ChartJsPage,
    ChartApexPage,
    
    MapPage,
    
    LayoutStarterPage,
    LayoutFixedFooterPage,
    LayoutFullHeightPage,
    LayoutFullWidthPage,
    LayoutBoxedLayoutPage,
    LayoutMinifiedSidebarPage,
    LayoutTopNavPage,
    LayoutMixedNavPage,
    LayoutMixedNavBoxedLayoutPage,
    
    ScrumBoardPage,
		ProductsPage,
		ProductDetailsPage,
		OrdersPage,
		OrderDetailsPage,
		GalleryPage,
		SearchResultsPage,
		ComingSoonPage,
		ErrorPage,
		LoginPage,
		RegisterPage,
		MessengerPage,
		DataManagementPage,
		FileManagerPage,
		PricingPage,
		LandingPage,
    
    ProfilePage,
    CalendarPage,
    SettingsPage,
    HelperPage,
    WelcomeComponent,
    AddMenuComponent,
    AddCategoryComponent,
    MenuConfigurationComponent,
    MenuItemsComponent,
    CategoriesComponent,
    RestaurantInfoComponent,
    VariantsComponent,
    MenuLandingPageComponent,
    ToastComponent,
    TableAreaComponent,
    EditMenuComponent,
    AddOnsComponent,
    AssignAddOnsComponent,
    EditAddOnsComponent,
    AddDiscountsComponent,
    DiscountsComponent,
    AddTaxesComponent,
    TaxesComponent,
    ParentCategoryComponent,
    GroupCategoryComponent,
    PaymentComponent
  ],
  imports: [
  	CommonModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
  	HttpClientModule,
  	JsonPipe,
  	
  	NgChartsModule,
    NgScrollbarModule,
  	NgxMasonryModule,
  	NgbDatepickerModule,
  	NgbTimepickerModule,
  	NgbTypeaheadModule,
  	NgxMaskDirective, 
  	NgxMaskPipe,
  	NgSelectModule,
  	NgApexchartsModule,
    HighlightAuto, 
  	FullCalendarModule,
  	ColorSketchModule,
  	CountdownModule,
  	TagInputModule,
    DragDropModule,
  	QuillModule.forRoot(),
    RouterModule.forRoot(routes),  
    AngularFireModule.initializeApp(environment.firebaseConfig), StoreModule.forRoot({}, {}),
    // StoreModule.forRoot({}), // If using root state
    // StoreModule.forFeature('restaurant', restaurantReducer) // Register restaurant feature state
    StoreModule.forRoot({ restaurant: restaurantReducer }, { metaReducers }),  // Updated this line
    StoreDevtoolsModule.instrument({
      maxAge: 25 // Number of states to retain
    }),
    StoreRouterConnectingModule.forRoot()

  ],
  providers: [
    AuthService,
    Title, 
  	provideNgxMask(),
  	provideHighlightOptions({
      fullLibraryLoader: () => import('highlight.js'),
      lineNumbersLoader: () => import('ngx-highlightjs/line-numbers'),
    }),
  	{ 
			provide: NG_SCROLLBAR_OPTIONS,
			useValue: {
				visibility: 'hover'
			}
		},
    DatePipe
	],
  bootstrap: [ AppComponent ]
})

export class AppModule {
	title: string = 'Studio';
	
  constructor(private router: Router, private titleService: Title, private route: ActivatedRoute) {
    router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
      	if (this.route.snapshot.firstChild && this.route.snapshot.firstChild.data['title']) {
      		this.title = 'Studio | '+ this.route.snapshot.firstChild.data['title'];
      	}
        this.titleService.setTitle(this.title);
        
        var elm = document.getElementById('app');
				if (elm) {
					elm.classList.remove('app-sidebar-toggled');
					elm.classList.remove('app-sidebar-mobile-toggled');
				}
      }
    });
  }
}
