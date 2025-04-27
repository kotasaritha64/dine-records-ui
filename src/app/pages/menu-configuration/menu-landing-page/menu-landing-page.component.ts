import { Component } from '@angular/core';

@Component({
  selector: 'app-menu-landing-page',
  templateUrl: './menu-landing-page.component.html',
  styleUrl: './menu-landing-page.component.scss'
})
export class MenuLandingPageComponent {

  currentComponent: string = '';

  showComponent(component: string): void {
    this.currentComponent = component;
  }
}
