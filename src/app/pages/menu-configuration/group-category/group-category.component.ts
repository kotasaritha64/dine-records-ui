import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { MenuApiService } from '../../../service/api-services/menu-api.service';
import { Store } from '@ngrx/store';
import { selectRestaurantId } from '../../../store/restaurant.selectors';
import { ToastService } from '../../../service//toast.service';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { SharedService } from './../../../service/shared.service';

@Component({
  selector: 'app-group-category',
  templateUrl: './group-category.component.html',
  styleUrl: './group-category.component.scss'
})
export class GroupCategoryComponent implements OnInit {

  @Input() groupCategoryId: string | null = null; // Add input property for group category ID
  @Output() closeGroupCategory = new EventEmitter<string>();
  groupCategoryForm: FormGroup;
  restaurantID: string | null = null;
  status: boolean = false;
  logoImage: File | null = null;
  categories: any[] = [];
  parentCategories: any[] = [];

  existingImages = {
    logo: '',
    kiosk: '',
  };
  newImages = {
    logo: null,
    kiosk: null
  };

  constructor(private fb: FormBuilder, private menuApiService: MenuApiService, private store: Store, private shared: SharedService, private toastService: ToastService) {
    this.groupCategoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]], // Mandatory field
      sacCode: [''], // Optional field
      restaurantName: [''], // Optional field
      status: [true],
      headerText: [''],
      footerText: [''],
      categories: this.fb.array([]) // Initialize as an empty array
    });

    // Get restaurantID from NgRx store
    this.store.select(selectRestaurantId).subscribe(id => {
      this.restaurantID = id;
      this.loadCategories(id);
      this.loadParentCategories(id);
    });
  }

  ngOnInit() {
    if (this.groupCategoryId) {
      this.loadGroupCategory(this.groupCategoryId);
    } else {
      const groupCategoryEdit = this.shared.getGroupCategories();
      if (groupCategoryEdit) {
        this.groupCategoryId = groupCategoryEdit.id;
        this.loadGroupCategory(this.groupCategoryId);
      } else {
        this.resetForm(); // Reset the form if no existing data is provided
      }
    }
  }

  resetForm() {
    this.groupCategoryForm.reset({
      name: '',
      sacCode: '',
      parentCategoryId: '',
      restaurantName: '',
      status: true,
      headerText: '',
      footerText: '',
      categories: this.fb.array(this.categories.map(() => new FormControl(false)))
    });
    this.logoImage = null;
    this.existingImages = { logo: '', kiosk: '' };
    this.newImages = { logo: null, kiosk: null };
  }

  loadCategories(restaurantID: string) {
    if (restaurantID) {
      this.menuApiService.getCategories(restaurantID).subscribe((categories) => {
        this.categories = categories;
        console.log('Loaded Categories: ', this.categories); // Debug log
        this.groupCategoryForm.setControl('categories',
          this.fb.array(this.categories.map(() => new FormControl(false)))
        );
      });
    }
  }

  loadParentCategories(restaurantID: string) {
    if (restaurantID) {
      this.menuApiService.getParentCategories(restaurantID).subscribe((parentCategories) => {
        this.parentCategories = parentCategories;
        console.log(this.parentCategories);
      });
    }
  }

  loadGroupCategory(groupCategoryId: string) {
    this.menuApiService.getGroupCategory(groupCategoryId).subscribe((groupCategory) => {
      this.groupCategoryForm.patchValue({
        name: groupCategory.name,
        sacCode: groupCategory.sacCode,
        restaurantName: groupCategory.restaurantName,
        status: groupCategory.active,
        headerText: groupCategory.headerText,
        footerText: groupCategory.footerText
      });

      // Set existing images
      this.existingImages.logo = groupCategory.logoURL;

      // Wait for categories to load before setting selected categories
      if (this.categories.length > 0) {
        this.setSelectedCategories(groupCategory.categoryIds || []);
      } else {
        // If categories are not yet loaded, wait for them to load
        const categoriesSubscription = this.menuApiService.getCategories(this.restaurantID!).subscribe((categories) => {
          this.categories = categories;
          this.groupCategoryForm.setControl('categories',
            this.fb.array(this.categories.map(() => new FormControl(false)))
          );
          this.setSelectedCategories(groupCategory.categoryIds || []);
          categoriesSubscription.unsubscribe(); // Unsubscribe after loading categories
        });
      }
    });
  }

  setSelectedCategories(selectedCategoryIds: string[]) {
    const categoriesArray = this.groupCategoryForm.get('categories') as FormArray;
    categoriesArray.clear(); // Clear the FormArray before patching

    this.categories.forEach((category) => {
      const isSelected = selectedCategoryIds.includes(category.categoryId);
      categoriesArray.push(new FormControl(isSelected)); // Add FormControl with true/false based on selection
    });
  }

  onCancel() {
    this.closeGroupCategory.emit('grouping'); // Emit the correct tab name
  }

  onSaveGroupCategory() {
    if (this.groupCategoryForm.valid) {
      const formValues = this.groupCategoryForm.value;

      // Get selected category IDs as an array
      const selectedCategories = this.categories
        .filter((_, index) => this.groupCategoryForm.controls['categories'].value[index])
        .map(category => category.categoryId);

      const processRequest = (logoBase64: string | null) => {
        const requestBody = {
          ...formValues,
          logoURL: logoBase64, // Include the logo image as Base64 or null if deleted
          active: formValues.status,
          categoryIds: selectedCategories,
          restaurantID: this.restaurantID
        };

        if (this.groupCategoryId) {
          // Update existing group category
          this.menuApiService.updateGroupCategory(this.groupCategoryId, requestBody).subscribe({
            next: () => {
              this.toastService.showToast('Success', 'Grouping Category updated successfully!', true, 'success');
            },
            error: () => {
              this.toastService.showToast('Error', 'Failed to update Grouping Category!', true, 'error');
            }
          });
        } else {
          // Create new group category
          this.menuApiService.createGroupCategory(requestBody).subscribe({
            next: () => {
              this.toastService.showToast('Success', 'Grouping Category created successfully!', true, 'success');
              this.resetForm(); // Reset the form after successful creation
            },
            error: () => {
              this.toastService.showToast('Error', 'Failed to create Grouping Category!', true, 'error');
            }
          });
        }
      };

      if (this.logoImage) {
        const reader = new FileReader();
        reader.onload = () => {
          let logoBase64 = reader.result as string;
          if (logoBase64.startsWith('data:image/')) {
            logoBase64 = logoBase64.split(',')[1]; // Remove the prefix
          }
          processRequest(logoBase64);
        };
        reader.readAsDataURL(this.logoImage);
      } else if (this.existingImages.logo) {
        // Convert the existing logo URL to Base64
        this.convertImageUrlToBase64(this.existingImages.logo).then((base64) => {
          if (base64.startsWith('data:image/')) {
            base64 = base64.split(',')[1]; // Remove the prefix
          }
          processRequest(base64);
        }).catch(() => {
          this.toastService.showToast('Error', 'Failed to process existing logo image.', true, 'error');
        });
      } else {
        processRequest(null); // Indicate that the logo image is deleted
      }
    } else {
      this.toastService.showToast('Error', 'Please fill in all required fields.', true, 'error');
    }
  }

  convertImageUrlToBase64(imageUrl: string): Promise<string> {
    return fetch(imageUrl)
      .then(response => response.blob())
      .then(blob => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      });
  }

  onLogoImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e: any) => {
        img.src = e.target.result;
        img.onload = () => {
          if (img.width < 400 || img.height < 400) {
            this.toastService.showToast('Error', 'Image resolution should be more than 400x400.', true, 'error');
            return;
          }
          this.logoImage = file;
          this.newImages.logo = e.target.result; // Preview the image
        };
      };
      reader.readAsDataURL(file);
    }
  }

  clearImage(imageType: string) {
    if (imageType === 'logo') {
      this.logoImage = null;
      this.newImages.logo = null;
      this.existingImages.logo = ''; // Indicate that the logo image is deleted
      const logoFileInput = document.getElementById('logoFile') as HTMLInputElement;
      if (logoFileInput) logoFileInput.value = ''; // Reset the file input
    }
  }

  checkUniqueGroupCategoryName() {
    const groupName = this.groupCategoryForm.get('name')?.value.trim();
    if (!groupName) return;

    this.menuApiService.getGroupCategories(this.restaurantID!).subscribe((groupCategories) => {
      const isDuplicate = groupCategories.some(group =>
        group.name.toLowerCase() === groupName.toLowerCase() &&
        group.id !== this.groupCategoryId
      );

      if (isDuplicate) {
        this.groupCategoryForm.get('name')?.setErrors({ duplicate: true });
      } else {
        this.groupCategoryForm.get('name')?.setErrors(null);
      }
    });
  }

  areAllCategoriesSelected(): boolean {
    const categoriesArray = this.groupCategoryForm.get('categories') as FormArray;
    return categoriesArray.controls.every(control => control.value);
  }

  toggleSelectAllCategories(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const categoriesArray = this.groupCategoryForm.get('categories') as FormArray;
    categoriesArray.controls.forEach(control => control.setValue(isChecked));
  }
}