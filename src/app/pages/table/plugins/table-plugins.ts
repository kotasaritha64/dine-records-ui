import { Component, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs5';
import 'datatables.net-responsive';
import 'datatables.net-responsive-bs5';

@Component({
  selector: 'table-plugins',
  templateUrl: './table-plugins.html',
  styleUrls: [ './table-plugins.css' ],
  encapsulation: ViewEncapsulation.None
})

export class TablePluginsPage {
	code1: any;
	data1: any;
	private dataTable: any;
  private tableOptions: any = {};

	constructor(private http: HttpClient) { }
	
	ngOnInit() {
    this.http.get('/assets/data/table-plugins/code-1.json', { responseType: 'text' }).subscribe(data => {
    	this.code1 = data;
		});
    this.http.get('/assets/data/table-plugins/data-1.json', { responseType: 'json' }).subscribe(data => {
    	this.data1 = data;
		});
  }
  
  ngAfterViewInit() {
  	setTimeout(() => {
			this.tableOptions = {
				dom: "<'row mb-3'<'col-md-4 mb-3 mb-md-0'l><'col-md-8 text-right'<'d-flex justify-content-end'fB>>>t<'row align-items-center mt-3'<'mr-auto col-md-6 mb-3 mb-md-0'i><'mb-0 col-md-6'p>>",
				lengthMenu: [ 10, 20, 30, 40, 50 ],
				responsive: true
			};
			this.dataTable = $('#datatableDefault').DataTable(this.tableOptions);
  	}, 100);
  }
}
