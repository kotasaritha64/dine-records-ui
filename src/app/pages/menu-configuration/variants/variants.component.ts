import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { selectRestaurantId } from '../../../store/restaurant.selectors';
import { MenuApiService } from '../../../service/api-services/menu-api.service';
import { Store } from '@ngrx/store';
import { ToastService } from '../../../service//toast.service';

@Component({
  selector: 'app-variants',
  templateUrl: './variants.component.html',
  styleUrl: './variants.component.scss'
})
export class VariantsComponent implements OnInit {

  @ViewChild('myButton') myButton!: ElementRef;

  variants: any = [];

  restaurantID: string | null = null;

  variationForm: FormGroup;

  variantId: any = 0;
  searchTerm: string = '';

  constructor(private formBuilder: FormBuilder, private menuApiService: MenuApiService, private store: Store , private toastService: ToastService) {

    this.store.select(selectRestaurantId).subscribe(id => {
      this.restaurantID = id;
    });

    this.variationForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      departmentName: ['', [Validators.required]],
      status: [true]
    });

  }

  ngOnInit(): void {
    this.getMenuvariants()
  }

  onSubmit(): void {
    if (this.variationForm.valid) {
      const variant = {
        "name": this.variationForm.value.name,
        "departmentName": this.variationForm.value.departmentName,
        "status": this.variationForm.value.status,
        "restaurantID": this.restaurantID
      }
      if (this.variantId > 0) {
        this.updateVariant(variant);
        return
      }
      this.menuApiService.createMenuVariant(variant).subscribe((resp) => {
        this.toastService.showToast('Success', 'Variant Save/Edit successful!', true, 'success');
        this.myButton.nativeElement.click();
        this.onClose();
        this.getMenuvariants();
      }, (error) => {
        this.toastService.showToast('Error', 'Something went wrong!', true, 'error');
      })
    }
  }

  getMenuvariants() {
    this.menuApiService.getMenuvariants(this.restaurantID).subscribe((resp) => {
      this.variants = resp;
    }, (error) => {
      console.log(error)
    })
  }

  onClose(): void {
    this.variantId = 0;
    this.variationForm.reset();
  }

  onEdit(variant: any): void {
    this.variantId = variant.id;
    this.variationForm.patchValue({
      name: variant.name,
      departmentName: variant.departmentName,
      status: variant.status
    });
  }

  updateVariant(variant: any) {
    this.toastService.showLoader();
    this.menuApiService.updateMenuvariants(this.variantId, variant).subscribe((resp: any) => {
      this.toastService.showToast('Success', 'Variant Save/Edit successful!', true, 'success');
      this.myButton.nativeElement.click();
      this.onClose();
      this.getMenuvariants();
      this.toastService.hideLoader();
    }, (error) => {
      this.toastService.hideLoader();
      this.toastService.showToast('Error', 'Something went wrong!', true, 'error');
    })
  }

  get filteredVariants() {
    return this.variants.filter(variant => 
      variant.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
