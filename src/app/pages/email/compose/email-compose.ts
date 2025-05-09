import { Component, ViewEncapsulation } from '@angular/core';
import { Validators } from '@angular/forms';
import { AppSettings } from '../../../service/app-settings.service';

@Component({
  selector: 'email-compose',
  templateUrl: './email-compose.html',
  styleUrls: [ './email-compose.css' ],
  encapsulation: ViewEncapsulation.None
})

export class EmailComposePage {
	subject!: string;
	
	mailtoTagsInputValue = ['support@seantheme.com'];
  mailtoTagsInputValidator = Validators.required;
  
	mailccTagsInputValue = [];
  mailccTagsInputValidator = Validators.required;
  
	mailbccTagsInputValue = [];
  mailbccTagsInputValidator = Validators.required;
  
	constructor(private appSettings: AppSettings) {
    this.appSettings.appContentClass = 'p-0';
    this.appSettings.appContentFullHeight = true;
  }

  ngOnDestroy() {
    this.appSettings.appContentClass = '';
    this.appSettings.appContentFullHeight = false;
  }
}
