import { Component } from '@angular/core';

@Component({
  selector: 'app-menu-configuration',
  templateUrl: './menu-configuration.component.html',
  styleUrl: './menu-configuration.component.scss'
})
export class MenuConfigurationComponent {

  currentComponent: string = 'items'; // Default component to show

    showComponent(component: string): void {
      this.currentComponent = component; // Update the current component
    }
}
