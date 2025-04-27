import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MenuApiService } from '../../../service/api-services/menu-api.service';
import { Store } from '@ngrx/store';
import { selectRestaurantId } from '../../../store/restaurant.selectors';
import { ToastService } from '../../../service//toast.service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedService } from './../../../service/shared.service';

@Component({
  selector: 'app-parent-category',
  templateUrl: './parent-category.component.html',
  styleUrl: './parent-category.component.scss'
})
export class ParentCategoryComponent implements OnInit {

  @Output() closeCreateParentCategory = new EventEmitter<string>();
  parentCategoryForm: FormGroup;

  restaurantID: string | null = null;
  status: boolean = false;
  logoImage: File | null = null;
  scheduleName: string | '';

  onlinePartnerImage: File | null = null;
  existingImages = {
    logo: '',
    onlinePartner: '',
    kiosk: '',
  };
  newImages = {
    logo: null,
    onlinePartner: null,
    kiosk: null
  };
  showDays = false;
  categories: any[] = [];

  timeSlots: { from: string, to: string }[] = [{ from: '00:00', to: '24:00' }];
  timeOptions: string[] = [];

  showSchedule = false;
  allDaysSelected = true;
  showIndividualDays = false;
  buttonText = "Add Schedule";
  parentCategoryId: any = 0;
  errorMessage: string = ''; // Add this line to define the errorMessage property
  isImageResolutionValid: boolean = true; // Flag to track image resolution validation

  constructor(private fb: FormBuilder, private menuApiService: MenuApiService, private store: Store, private shared: SharedService, private toastService: ToastService) {
    // Get restaurantID from NgRx store
    this.store.select(selectRestaurantId).subscribe(id => {
      this.restaurantID = id;
      this.loadCategories(id);
    });

    this.parentCategoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]], // Mandatory field
      onlineDisplayName: [''], // Optional field
      logoImage: [null],
      onlinePartnerImage: [null],
      scheduleName: [''],
      days: this.fb.array([]), // Dynamic list of days
      timeSlots: this.fb.array([]), // Initialize as an empty array
      status: [true],
      categories: this.fb.array(this.categories.map(() => new FormControl(false))) // Initialize all checkboxes as unchecked
    });

    // Ensuring "All Days" is checked by default
    this.toggleAllDays();
  }

  daysOfWeek = [
    { name: 'Mon', selected: false },
    { name: 'Tue', selected: false },
    { name: 'Wed', selected: false },
    { name: 'Thu', selected: false },
    { name: 'Fri', selected: false },
    { name: 'Sat', selected: false },
    { name: 'Sun', selected: false },
  ];

  ngOnInit() {
    this.generateTimeOptions();
  }

  generateTimeOptions() {
    const times: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMin = min.toString().padStart(2, '0');
        times.push(`${formattedHour}:${formattedMin}`);
      }
    }
    this.timeOptions = times;
  }

  loadCategories(restaurantID: string) {
    if (restaurantID) {
      this.menuApiService.getCategories(restaurantID).subscribe((categories) => {
        this.categories = categories;
        console.log(this.categories);
        this.parentCategoryForm.setControl('categories',
          this.fb.array(this.categories.map(() => new FormControl(false)))
        );

        // Patch the form after categories are loaded
        const categoryEdit = this.shared.getParentCategories();
        if (categoryEdit) {
          this.parentCategoryForm.patchValue({
            name: categoryEdit.name,
            onlineDisplayName: categoryEdit.onlineDisplayName,
            status: categoryEdit.active,
          });

          this.existingImages.logo = categoryEdit.logoURL;
          this.existingImages.onlinePartner = categoryEdit.onlinePartnerImageURL;
          this.parentCategoryId = categoryEdit.id;

          // Handle schedule data
          if (categoryEdit.scheduleDTO && categoryEdit.scheduleDTO.days.length > 0) {
            this.scheduleName = categoryEdit.scheduleDTO.scheduleName;
            this.parentCategoryForm.patchValue({ scheduleName: this.scheduleName });

            // Map days
            this.daysOfWeek.forEach(day => {
              day.selected = categoryEdit.scheduleDTO.days.includes(day.name);
            });

            // Map time slots
            const timeSlotsArray = this.parentCategoryForm.get('timeSlots') as FormArray;
            timeSlotsArray.clear();
            categoryEdit.scheduleDTO.timeSlots.forEach((slot: string) => {
              const [from, to] = slot.split('-');
              timeSlotsArray.push(this.fb.group({
                from: [from, Validators.required],
                to: [to, Validators.required]
              }));
            });

            // Enable schedule section
            this.showSchedule = true;
            this.buttonText = "Remove Schedule";
          } else {
            // Disable schedule section if no schedule data exists
            this.resetSchedule();
          }

          // Handle selected categories
          if (categoryEdit.categoryIds && this.categories.length > 0) {
            const categoriesArray = this.parentCategoryForm.get('categories') as FormArray;
            this.categories.forEach((category, index) => {
              if (categoryEdit.categoryIds.includes(category.categoryId)) {
                categoriesArray.at(index).setValue(true);
              }
            });
          }

          // Clear the shared service data
          this.shared.setParentCategories(null);
        }
      });
    }
  }

  onCancel() {
    console.log('onCancel called'); // Debug log to ensure the method is triggered
    this.closeCreateParentCategory.emit('parentcategory'); // Emit the correct tab name
    console.log('Event emitted with tab name: parentcategory'); // Debug log to confirm event emission
  }

  get categoriesArray() {
    return this.parentCategoryForm.get('categories') as FormArray;
  }

  onSaveParentCategory() {
    if (!this.isImageResolutionValid) {
      this.toastService.showToast('Error', 'Please upload valid images with resolution more than 400x400.', true, 'error');
      return; // Prevent saving if image resolution is invalid
    }

    // Validate overlapping time slots
    const timeSlots = this.parentCategoryForm.value.timeSlots;
    if (this.hasOverlappingTimeSlots(timeSlots)) {
        this.toastService.showToast('Error', 'Time slots overlap. Please fix them before saving.', true, 'error');
        return;
    }

    const selectedDays = this.daysOfWeek
      .filter(day => day.selected)
      .map(day => day.name);

    const selectedCategories = this.categories
      .filter((_, index) => this.categoriesArray.controls.length > index && this.categoriesArray.controls[index].value)
      .map(category => category.categoryId)
      .join(","); // Convert to CSV format

    const formValues = this.parentCategoryForm.value;

    const timeSlotsData = formValues.timeSlots
      .filter(slot => slot.from && slot.to)
      .map(slot => ({
        fromTime: slot.from,
        toTime: slot.to
      }));

    const formDataObj = new FormData();
    formDataObj.append('name', formValues.name);
    formDataObj.append('onlineDisplayName', formValues.onlineDisplayName);
    formDataObj.append('active', String(formValues.status)); // Convert boolean to string ("true"/"false")
    formDataObj.append('restaurantID', this.restaurantID);
    selectedDays.forEach(day => formDataObj.append("days", day));
    selectedCategories.split(",").forEach(id => formDataObj.append("categoryIds", id.trim()));
    formDataObj.append('timeSlots', JSON.stringify(timeSlotsData));
    formDataObj.append('scheduleName', formValues.scheduleName);

    if (this.logoImage) {
      formDataObj.append('logoImage', this.logoImage);
    } else if (this.existingImages.logo === '') {
      formDataObj.append('logoImageDeleted', 'true'); // Send a flag
    }

    if (this.onlinePartnerImage) {
      formDataObj.append('onlinePartnerImage', this.onlinePartnerImage);
    } else if (this.existingImages.onlinePartner === '') {
      formDataObj.append('onlinePartnerImageDeleted', 'true'); // Send a flag
    }

    if (this.parentCategoryId) {
      this.menuApiService.updateParentCategory(this.parentCategoryId, formDataObj).subscribe({
        next: () => {
          this.toastService.showToast('Success', 'Parent Category updated successfully!', true, 'success');
        },
        error: (error) => {
          console.error(error);
          this.toastService.showToast('Error', 'Failed to update Parent Category!', true, 'error');
        }
      });
    } else {
      this.menuApiService.createParentCategory(formDataObj).subscribe({
        next: () => {
          this.toastService.hideLoader();
          this.toastService.showToast('Success', 'Parent Category created successfully!', true, 'success');
        },
        error: (error) => {
          console.error(error);
          this.toastService.showToast('Error', 'Failed to create Parent Category!', true, 'error');
        }
      });
    }
  }

  // Add a helper method to check for overlapping time slots
  hasOverlappingTimeSlots(timeSlots: { from: string, to: string }[]): boolean {
    for (let i = 0; i < timeSlots.length; i++) {
        for (let j = i + 1; j < timeSlots.length; j++) {
            const slot1 = timeSlots[i];
            const slot2 = timeSlots[j];
            if (
                (slot1.from < slot2.to && slot1.to > slot2.from) || // Overlap condition
                (slot2.from < slot1.to && slot2.to > slot1.from)
            ) {
                return true;
            }
        }
    }
    return false;
  }

  // Add/Remove Schedule Button Click
  toggleSchedule() {
    this.showSchedule = !this.showSchedule;
    this.buttonText = this.showSchedule ? "Remove Schedule" : "Add Schedule";

    if (this.showSchedule) {
      this.enableAllDays();
      if (this.timeSlotsArray.length === 0) {
        // Add a default time slot when enabling the schedule
        this.timeSlotsArray.push(this.fb.group({
          from: ['00:00', Validators.required],
          to: ['23:30', Validators.required]
        }));
      }
    } else {
      this.resetSchedule();
    }
  }

  // Enable "All Days" by default when adding a schedule
  enableAllDays() {
    this.allDaysSelected = true;
    this.showIndividualDays = false;
    this.daysOfWeek.forEach(day => day.selected = true);
  }

  // Toggle "All Days" Selection
  toggleAllDays() {
    // Explicitly toggle the value
    this.allDaysSelected = !this.allDaysSelected;
    if (this.allDaysSelected) {
      // Check all days & hide individual checkboxes
      this.daysOfWeek.forEach(day => day.selected = true);
      this.showIndividualDays = false;
    } else {
      // Uncheck all days & show individual checkboxes
      this.daysOfWeek.forEach(day => day.selected = false);
      this.showIndividualDays = true;
    }
  }

  // Handle Individual Day Selection
  updateAllDaysStatus() {
    const allSelected = this.daysOfWeek.every(day => day.selected);
    this.allDaysSelected = allSelected;

    // If all days are not selected, show individual checkboxes
    this.showIndividualDays = !allSelected;
  }

  // Reset everything when "Remove Schedule" is clicked
  resetSchedule() {
    this.showSchedule = false;
    this.allDaysSelected = true;
    this.showIndividualDays = false;
    this.daysOfWeek.forEach(day => day.selected = true);
  }

  addTimeSlot() {
    const timeSlotsArray = this.timeSlotsArray;

    if (timeSlotsArray.length >= 3) {
        this.toastService.showToast('Error', 'You cannot add more than 3 slots', true, 'error');
        return;
    }

    const newSlot = this.fb.group({
        from: ['', Validators.required],
        to: ['', Validators.required]
    });

    // Check for overlapping time slots
    const isOverlapping = timeSlotsArray.controls.some(slot => {
        const existingFrom = slot.value.from;
        const existingTo = slot.value.to;

        // Ensure both "from" and "to" values are valid
        if (!existingFrom || !existingTo) {
            return false;
        }

        const newFrom = newSlot.value.from;
        const newTo = newSlot.value.to;

        // Block any overlap
        return (
            (newFrom >= existingFrom && newFrom < existingTo) || // New "from" is within an existing slot
            (newTo > existingFrom && newTo <= existingTo) || // New "to" is within an existing slot
            (newFrom <= existingFrom && newTo >= existingTo) // New slot completely overlaps an existing slot
        );
    });

    if (isOverlapping) {
        this.toastService.showToast('Error', 'The time slot overlaps with an existing time slot.', true, 'error');
        return;
    }

    timeSlotsArray.push(newSlot);
}

  ngOnDestroy(): void {
    this.parentCategoryId = 0;
  }

  removeTimeSlot(index: number) {
    this.timeSlotsArray.removeAt(index);
  }

  toggleDaySelection(index: number) {
    this.daysOfWeek[index].selected = !this.daysOfWeek[index].selected;
    this.updateAllDaysStatus(); // Ensure "All Days" updates accordingly
  }

  get timeSlotsArray() {
    return this.parentCategoryForm.get('timeSlots') as FormArray;
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
            this.isImageResolutionValid = false; // Set flag to false
            return;
          }
          this.isImageResolutionValid = true; // Set flag to true
          this.logoImage = file;
          this.parentCategoryForm.patchValue({ logoImage: file });
          this.parentCategoryForm.get('logoImage').updateValueAndValidity();

          // Preview image
          this.newImages.logo = e.target.result;
        };
      };
      reader.readAsDataURL(file);
    }
  }

  onOnlinePartnerImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e: any) => {
        img.src = e.target.result;
        img.onload = () => {
          if (img.width < 400 || img.height < 400) {
            this.toastService.showToast('Error', 'Image resolution should be more than 400x400.', true, 'error');
            this.isImageResolutionValid = false; // Set flag to false
            return;
          }
          this.isImageResolutionValid = true; // Set flag to true
          this.onlinePartnerImage = file;
          this.parentCategoryForm.patchValue({ onlinePartnerImage: file });
          this.parentCategoryForm.get('onlinePartnerImage').updateValueAndValidity();

          // Preview image
          this.newImages.onlinePartner = e.target.result;
        };
      };
      reader.readAsDataURL(file);
    }
  }

  clearImage(imageType: string) {
    if (imageType === 'logo') {
      this.logoImage = null;
      this.newImages.logo = null;
      // Set a flag to indicate image deletion
      this.existingImages.logo = '';
      // Reset the file input
      const logoFileInput = document.getElementById('logoFile') as HTMLInputElement;
      if (logoFileInput) logoFileInput.value = '';
    } else if (imageType === 'onlinePartner') {
      this.onlinePartnerImage = null;
      this.newImages.onlinePartner = null;
      // Set a flag to indicate image deletion
      this.existingImages.onlinePartner = '';
      // Reset the file input
      const partnerFileInput = document.getElementById('onlinePartnerFile') as HTMLInputElement;
      if (partnerFileInput) partnerFileInput.value = '';
    }
  }

  checkUniqueParentCategoryName() {
    const parentCategoryName = this.parentCategoryForm.get('name')?.value.trim();
    if (!parentCategoryName) return;

    this.menuApiService.getParentCategories(this.restaurantID!).subscribe((parentCategories) => {
        const isDuplicate = parentCategories.some(parentCategory => 
            parentCategory.name.toLowerCase() === parentCategoryName.toLowerCase() && 
            parentCategory.id !== this.parentCategoryId
        );

        if (isDuplicate) {
            this.parentCategoryForm.get('name')?.setErrors({ duplicate: true });
        } else {
            this.parentCategoryForm.get('name')?.setErrors(null);
        }
    });
  }

  areAllCategoriesSelected(): boolean {
    const categoriesArray = this.parentCategoryForm.get('categories') as FormArray;
    return categoriesArray.controls.every(control => control.value);
  }

  toggleSelectAllCategories(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const categoriesArray = this.parentCategoryForm.get('categories') as FormArray;
    categoriesArray.controls.forEach(control => control.setValue(isChecked));
  }

}
