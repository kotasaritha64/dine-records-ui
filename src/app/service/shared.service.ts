import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private editCatgories: any;
  private editParentCatgories: any;
  private editGroupCatgories: any;
  private groupCategories: any[] = [];
  constructor() {
    this.editCatgories = null
    this.editParentCatgories = null;
  }

  setCategories(value: any): void {
    this.editCatgories = value;
  }

  getCategories(): any {
    return this.editCatgories;
  }
  setParentCategories(value: any): void {
    this.editParentCatgories = value;
  }
  setGroupCategories(value: any): void {
    this.editGroupCatgories = value;
    this.groupCategories = value;
  }

  getParentCategories(): any {
    return this.editParentCatgories;
  }
  getGroupCategories(): any {
    return this.groupCategories;
  }
}
