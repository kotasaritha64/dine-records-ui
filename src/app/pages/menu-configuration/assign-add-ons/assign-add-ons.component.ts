import { Component, OnInit, ChangeDetectorRef ,  Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { MenuApiService } from '../../../service/api-services/menu-api.service';
import { selectRestaurantId } from '../../../store/restaurant.selectors';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../../../service/toast.service';

interface MenuItem {
  itemId: number;
  itemName: string;
  selected: boolean;
  departmentId: number;
}

interface Category {
  categoryId: number;
  categoryName: string;
  selected: boolean;
  expanded: boolean;
  items: MenuItem[];
}

interface AddOnRequest {
  departmentId: number;
  allowAddons: string;
  min: number;
  max: number;
  addonItemIds: number[];
  menuItemIds: number[];
  categoryIds: number[];
}

@Component({
  selector: 'app-assign-add-ons',
  templateUrl: './assign-add-ons.component.html',
  styleUrl: './assign-add-ons.component.scss',
  host: {
    'class': 'd-flex flex-column h-100'
  }
})
export class AssignAddOnsComponent implements OnInit {

  restaurantID: string | null = null;
  addons: any[] = [];
  categories: Category[] = [];
  selectAll: boolean = false;
  expandedDepartments: number[] = [];
  mobileSidebarToggled: boolean = false;
  addOnRequestMap = new Map<number, any>();
  @Output() closeAssignAddon: EventEmitter<boolean> = new EventEmitter<boolean>();

  toggleMobileSidebar(): void {
    this.mobileSidebarToggled = !this.mobileSidebarToggled;
  }

  constructor(private store: Store, private menuApiService: MenuApiService, private fb: FormBuilder, private toastService: ToastService, private cdr: ChangeDetectorRef) {
    // Get the restaurant ID from the store
    this.store.select(selectRestaurantId).subscribe(id => {
      this.restaurantID = id;
      if (this.restaurantID) {
        this.getAddonsByRestaurant();
        this.fetchGroupedMenuItems();
      }
    });

  }

  ngOnInit(): void {
    // Fetch the addons based on restaurant ID
    this.getAddonsByRestaurant();

    var fileHasSubNodes = document.querySelectorAll(".file-node.has-sub");
    fileHasSubNodes.forEach(node => {
      var fileArrow = node.querySelector(".file-link > .file-arrow");
      if (fileArrow) {
        fileArrow.addEventListener("click", function (event) {
          event.preventDefault();
          node.classList.toggle("expand");
        });
      }
    });

    var fileInfoNodes = document.querySelectorAll(".file-node");
    fileInfoNodes.forEach(node => {
      var fileInfo = node.querySelector(".file-link > .file-info");
      if (fileInfo) {
        fileInfo.addEventListener("click", function (event) {
          event.preventDefault();
          fileInfoNodes.forEach(otherNode => {
            if (otherNode !== node) {
              otherNode.classList.remove("selected");
            }
          });
          node.classList.add("expand");
          node.classList.add("selected");
        });
      }
    });

    this.initializeFileNodeBehavior();

  }

  // Fetch addons from the API
  getAddonsByRestaurant() {
    this.toastService.showLoader();
    this.menuApiService.getAddonsByRestaurantId(+this.restaurantID).subscribe(
      (data) => {
        this.toastService.hideLoader();
        this.addons = data;
        console.log(data)
        data.map((obj: any) => {
          this.addOnRequestMap.set(obj.id, {
            departmentId: obj.id,
            allowAddons: 'Allow Single Selection',
            min: 0,
            max: 0,
            addonItemIds: obj.addonGroupItems.map((item: any) => item.id) || [],
            categoryIds: [],
            menuItemIds: []
          });
        })
      },
      (error) => {
        this.toastService.hideLoader();
        console.error('Error fetching addons:', error);
      }
    );
  }

  fetchGroupedMenuItems() {
    this.toastService.showLoader();
    this.menuApiService.getGroupedMenuItems(+this.restaurantID).subscribe(
      (data: any[]) => {
        this.toastService.hideLoader();
        this.categories = data.map((category: any) => ({
          categoryId: category.categoryId,
          categoryName: category.categoryName,
          selected: false,
          expanded: false,
          items: category.items.map((item: any) => ({
            itemId: item.itemId,
            itemName: item.itemName,
            selected: false
          }))
        }));
      },
      (error) => {
        this.toastService.hideLoader();
        console.error('Error fetching grouped menu items:', error);
      }
    );
  }

  initializeFileNodeBehavior() {
    const fileHasSubNodes = document.querySelectorAll(".file-node.has-sub");
    fileHasSubNodes.forEach(node => {
      const fileArrow = node.querySelector(".file-link > .file-arrow");
      if (fileArrow) {
        fileArrow.addEventListener("click", function (event) {
          event.preventDefault();
          node.classList.toggle("expand");
        });
      }
    });

    const fileInfoNodes = document.querySelectorAll(".file-node");
    fileInfoNodes.forEach(node => {
      const fileInfo = node.querySelector(".file-link > .file-info");
      if (fileInfo) {
        fileInfo.addEventListener("click", function (event) {
          event.preventDefault();
          fileInfoNodes.forEach(otherNode => {
            if (otherNode !== node) {
              otherNode.classList.remove("selected");
            }
          });
          node.classList.add("expand");
          node.classList.add("selected");
        });
      }
    });
  }


  toggleExpand(departmentId: number) {
    const index = this.expandedDepartments.indexOf(departmentId);
    if (index > -1) {
      this.expandedDepartments.splice(index, 1);
    } else {
      this.expandedDepartments.push(departmentId);
    }
  }

  allowSelection(id: any, event: any) {
    const slct = this.addOnRequestMap.get(id);
    if (slct) {
      slct.allowAddons = event.target.value;
      this.addOnRequestMap.set(id, slct);
    }
  }

  minMaxchange(type: string, event: any, id: any , size : any) {
    const slct = this.addOnRequestMap.get(id);
    let value = Number(event.target.value);
    if (type == 'min' && slct) {
      slct.min = (value > size) ? 1 : value;
      this.addOnRequestMap.set(id, slct);
    } else if (type == 'max' && slct) {
      slct.max = (value > size) ? size : value;
      this.addOnRequestMap.set(id, slct);
    }
    event.target.value = type === 'min' ? slct.min : slct.max;
  }

  addonGroupItems(id: any, itemId: any) {
    const slct = this.addOnRequestMap.get(id);
    const index = slct.addonItemIds.indexOf(itemId);
    if (index !== -1) {
      slct.addonItemIds.splice(index, 1);
      this.addOnRequestMap.set(id, slct);
    } else {
      slct.addonItemIds.push(itemId)
      this.addOnRequestMap.set(id, slct);
    }
  }

  selectAllItems(id: any, event: any): void {
    const slct = this.addOnRequestMap.get(id);
    if (slct) {
      if (event.target.checked) {
        slct.categoryIds = this.categories.map((obj: any) => obj.categoryId);
        // this.categories.forEach((category: any) => {
        //   category.items.forEach((item: any) => {
        //     item.selected = true;
        //   });
        // });
      } else {
        slct.categoryIds = [];
        slct.addonItemIds = [];
        // this.categories.forEach((category: any) => {
        //   category.items.forEach((item: any) => {
        //     item.selected = false;
        //   });
        // });
      }
      this.addOnRequestMap.set(id, slct);
    }
  }

  onCategoryChange(id: any, categoryId: any) {
    const slct = this.addOnRequestMap.get(id);
    const index = slct.categoryIds.indexOf(categoryId);
    if (index !== -1) {
      const category = this.categories.find((category: any) => category.categoryId === categoryId);
      const catitems = category.items.map(item => item.itemId);
      slct.menuItemIds = slct.menuItemIds.filter(item => item !== catitems.includes(item));
      slct.categoryIds = slct.categoryIds.filter(item => item !== categoryId);
      this.addOnRequestMap.set(id, slct);
    } else {
      const category = this.categories.find((category: any) => category.categoryId === categoryId);
      const catitems = category.items.map(item => item.itemId);
      slct.menuItemIds = slct.menuItemIds.filter(item => item !== catitems.includes(item));
      slct.categoryIds.push(categoryId);
      this.addOnRequestMap.set(id, slct);
    }
  }

  onMenuIemChange(id: any, categoryId: any, itemId: any, event: any) {
    debugger;
    const slct = this.addOnRequestMap.get(id);
    const index = slct.menuItemIds.indexOf(itemId);
    const indCat = slct.categoryIds.indexOf(categoryId);
    if (index !== -1) {
      slct.menuItemIds = slct.menuItemIds.filter(item => item.itemId !== itemId);
      if (indCat !== -1) {
        slct.categoryIds = slct.categoryIds.filter(item => item !== categoryId);
      }
      this.addOnRequestMap.set(id, slct);
    } else {
      if (event.target.checked) {
        slct.menuItemIds.push(itemId);
        const category = this.categories.find((category: any) => category.categoryId === categoryId);
        if (category.items.every((item: any) => slct.menuItemIds.includes(item.itemId))) {
          slct.categoryIds.push(categoryId);
          slct.menuItemIds = [];
        }
        this.addOnRequestMap.set(id, slct);
      } else{
        if (indCat !== -1) {
          const category = this.categories.find((category: any) => category.categoryId === categoryId);
          slct.menuItemIds = slct.menuItemIds.filter(item => item.itemId !== itemId);
          const catitems = category.items.filter(item => item.itemId != itemId).map(item => item.itemId);
          slct.menuItemIds = [...slct.menuItemIds , ...catitems];
          slct.categoryIds = slct.categoryIds.filter(item => item !== categoryId);
          this.addOnRequestMap.set(id, slct);
        }
        
        
      }
    }
    this.cdr.detectChanges();
  }


  onSubmit () : void {
    this.toastService.showLoader();
    let resultArray: any[] = [];

    this.addOnRequestMap.forEach((value: any, key: any) => {
      if (value.categoryIds.length > 0 || value.menuItemIds.length > 0) {
        resultArray.push(value);
      }
    });

    const payload = {
      restaurantId : this.restaurantID,
      addOnRequests : resultArray
    }
    this.menuApiService.assignAddons(payload).subscribe((resp : any) => {
      this.toastService.hideLoader();
      this.toastService.showToast('Success', 'Assign Addons Save successful!', true, 'success');
      this.closeAddon();
    },(error) => {
      this.toastService.hideLoader();
      this.toastService.showToast('Error', 'Something went wrong!', false, 'error');
    })
  }

  closeAddon() {
    this.closeAssignAddon.emit(true);  // Emit true when closing
  }
}
