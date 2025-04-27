import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../../models/category.model'

@Injectable({
  providedIn: 'root'
})
export class MenuApiService {

  private baseUrl = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) { }


  createCategory(formData: FormData): Observable<HttpResponse<string>> {
    return this.http.post<string>(`${this.baseUrl}/menu-categories/create`, formData, {
      observe: 'response',
      responseType: 'text' as 'json',
    }) as Observable<HttpResponse<string>>;
  }




  getCategories(restaurantId: any): Observable<Category[]> {
    const url = `${this.baseUrl}/menu-categories/restaurant/${restaurantId}?sort=createdDate`;
    return this.http.get<Category[]>(url);
  }
  getParentCategories(restaurantId: any): Observable<Category[]> {
    const url = `${this.baseUrl}/parent-categories/restaurant/${restaurantId}?sort=createdDate`;
    return this.http.get<Category[]>(url);
  }
  getGroupCategories(restaurantId: any): Observable<any[]> {
    const url = `${this.baseUrl}/group-categories/restaurant/${restaurantId}?sort=createdDate`;
    return this.http.get<any[]>(url);
  }
  getParentCategoriesById(parentCategoryId: any): Observable<Category[]> {
    const url = `${this.baseUrl}/parent-categories/${parentCategoryId}?sort=createdDate`;
    return this.http.get<Category[]>(url);
  }
  getGroupCategoriesById(groupCategoryId: any): Observable<Category> {
    const url = `${this.baseUrl}/group-categories/${groupCategoryId}?sort=createdDate`;
    return this.http.get<Category>(url);
  }
  createParentCategory(data: FormData): Observable<HttpResponse<string>> {
    return this.http.post(`${this.baseUrl}/parent-categories`, data, {
      observe: 'response',
      responseType: 'text' as 'json',
    }) as Observable<HttpResponse<string>>;
  }
  updateParentCategory(id: string, formData: FormData) {
    return this.http.put(`${this.baseUrl}/parent-categories/${id}`, formData);
}
  updateCategories(id, formData): Observable<any> {
    return this.http.put(`${this.baseUrl}/menu-categories/${id}`, formData);
  }

  createMenuVariant(menuVariant: any): Observable<HttpResponse<string>> {
    return this.http.post<string>(`${this.baseUrl}/restaurant/variants`, menuVariant, {
      observe: 'response',
      responseType: 'text' as 'json',
    }) as Observable<HttpResponse<string>>;
  }

  getMenuvariants(restaurantId: any): Observable<any> {
    const url = `${this.baseUrl}/restaurant/variants/restaurant/${restaurantId}`;
    return this.http.get<any>(url);
  }

  // Update the createGroupCategory method to accept JSON object
  createGroupCategory(data: any): Observable<HttpResponse<string>> {
    return this.http.post(`${this.baseUrl}/group-categories`, data, {
      observe: 'response',
      responseType: 'text' as 'json',
    }) as Observable<HttpResponse<string>>;
  }

  // Add the getGroupCategory method
  getGroupCategory(groupCategoryId: string): Observable<any> {
    const url = `${this.baseUrl}/group-categories/${groupCategoryId}`;
    return this.http.get<any>(url);
  }

  // Add the updateGroupCategory method
  updateGroupCategory(groupCategoryId: string, data: any): Observable<HttpResponse<string>> {
    return this.http.put(`${this.baseUrl}/group-categories/${groupCategoryId}`, data, {
      observe: 'response',
      responseType: 'text' as 'json',
    }) as Observable<HttpResponse<string>>;
  }

  //Menu
  createMenuItem(formData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      'Accept': 'application/json'
    });
    return this.http.post(`${this.baseUrl}/menu-items/createMenuItem`, formData, { headers });
  }

  updateMenuvariants(id, variant): Observable<any> {
    return this.http.put(`${this.baseUrl}/restaurant/variants/${id}`, variant);
  }

  //Table

  createTable(tableData: any): Observable<HttpResponse<string>> {
    return this.http.post(`${this.baseUrl}/tables`, tableData, {
      headers: { 'Content-Type': 'application/json' },
      observe: 'response',
      responseType: 'text' as 'json',
    }) as Observable<HttpResponse<string>>;
  }

  getTablesByRestaurantId(restaurantId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tables/restaurant/${restaurantId}`);
  }

  //Area
  createArea(areaData: any): Observable<HttpResponse<string>> {
    return this.http.post(`${this.baseUrl}/table-areas`, areaData, {
      headers: { 'Content-Type': 'application/json' },
      observe: 'response',
      responseType: 'text' as 'json',
    }) as Observable<HttpResponse<string>>;
  }

  updateTable(id, table): Observable<any> {
    return this.http.put(`${this.baseUrl}/tables/${id}`, table);
  }

  getAreasByRestaurantId(restaurantId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/table-areas/restaurant/${restaurantId}`);
  }

  //AddOn
  saveAddOnGroup(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/addons`, payload);
  }

  getAddonsByRestaurantId(restaurantId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/addons/restaurant/${restaurantId}`);
  }

  getGroupedMenuItems(restaurantId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/menu-items/restaurant/${restaurantId}/grouped-items`);
  }

  assignAddons(payload: any): Observable<HttpResponse<string>> {
    return this.http.post(`${this.baseUrl}/addons/assign`, payload, {
      headers: { 'Content-Type': 'application/json' },
      observe: 'response',
      responseType: 'text' as 'json',
    }) as Observable<HttpResponse<string>>;
  }
  //Discounts
  saveDiscount(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/discounts`, payload);
  }

  getDiscountsByRestaurantId(restaurantId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/discounts/restaurant/${restaurantId}`);
  }


  updateArea(id, table): Observable<any> {
    return this.http.put(`${this.baseUrl}/table-areas/${id}`, table);
  }
  //Taxes
  getTaxesByRestaurantId(restaurantId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/taxes/restaurant/${restaurantId}`);
  }

  addTax(taxData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/taxes`, taxData);
  }
  //menu item

  addMenuItem(menuItems: any): Observable<HttpResponse<string>> {
    return this.http.post(`${this.baseUrl}/menu-items`, menuItems, {
      headers: { 'Content-Type': 'application/json' },
      observe: 'response',
      responseType: 'text' as 'json',
    }) as Observable<HttpResponse<string>>;
  }

  getMenuItemOnCategories(restaurantId : any , categoryId : any, orderType: string) : Observable<any> {
    return this.http.get(`${this.baseUrl}/menu-items/restaurant/${restaurantId}/category/${categoryId}?orderType=${orderType}`);
  }

  getMenuItems(restaurantId : any) : Observable<any> {
    return this.http.get(`${this.baseUrl}/menu-items/restaurant/${restaurantId}/items`);
  }

  editMenuItems(menuItems : any) : Observable<any> {
    return this.http.put(`${this.baseUrl}/menu-items`, menuItems);
  }

  // get working hours
  getBusinessHoursByRestaurantId(restaurantId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/business-hours/restaurant/${restaurantId}`);
  }

  updateMultipleCategories(categories: any[]): Observable<any> {
    return this.http.put(`${this.baseUrl}/menu-categories/update-multiple`, categories);
  }
}
