import { Component } from '@angular/core';
import { AppVariablesService } from '../../service/app-variables.service';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.html'
})

export class DashboardPage {
  appVariables = this.appVariablesService.getAppVariables();
  
  serverData: any = {};
  chartData: any = {};
  
  getChartData() {
		return {
			series: [{
				data: [
					8107, 8128, 8122, 8165, 8340, 8423, 8423, 8514, 8481, 8487, 
					8506, 8626, 8668, 8602, 8607, 8512, 8496, 8600, 8881, 9340
				]
			}],
			labels: [
				'13 Nov 2024', '14 Nov 2024', '15 Nov 2024', '16 Nov 2024',
				'17 Nov 2024', '20 Nov 2024', '21 Nov 2024', '22 Nov 2024',
				'23 Nov 2024', '24 Nov 2024', '27 Nov 2024', '28 Nov 2024',
				'29 Nov 2024', '30 Nov 2024', '01 Dec 2024', '04 Dec 2024', 
				'05 Dec 2024', '06 Dec 2024', '07 Dec 2024', '08 Dec 2024'
			],
			colors: [this.appVariables.color.primary],
			chart: { type: 'line', toolbar: { show: false }, height: 256 },
			annotations: {
				yaxis: [{
					y: 8200,
					borderColor: this.appVariables.color.indigo,
					label: {
						borderColor: this.appVariables.color.indigo,
						style: {
							color: this.appVariables.color.white,
							background: this.appVariables.color.indigo,
						},
						text: 'Support',
					}
				}, {
					y: 8600,
					y2: 9000,
					borderColor: this.appVariables.color.warning,
					fillColor: this.appVariables.color.warning,
					opacity: 0.1,
					label: {
						borderColor: this.appVariables.color.yellow,
						style: {
							fontSize: '10px',
							color: this.appVariables.color.gray900,
							background: this.appVariables.color.yellow,
						},
						text: 'Earning',
					}
				}],
				xaxis: [{
					x: new Date('23 Nov 2024').getTime(),
					strokeDashArray: 0,
					borderColor: this.appVariables.color.borderColor,
					label: {
						borderColor: this.appVariables.color.bodyColor,
						style: {
							color: this.appVariables.color.bodyBg,
							background: this.appVariables.color.bodyColor,
						},
						text: 'Anno Test',
					}
				}, {
					x: new Date('26 Nov 2024').getTime(),
					x2: new Date('28 Nov 2024').getTime(),
					fillColor: this.appVariables.color.teal,
					opacity: 0.4,
					label: {
						borderColor: this.appVariables.color.teal,
						style: {
							fontSize: '10px',
							color: '#fff',
							background: this.appVariables.color.teal,
						},
						offsetY: -7,
						text: 'X-axis range',
					}
				}],
				points: [{
					x: new Date('01 Dec 2024').getTime(),
					y: 8607.55,
					marker: {
						size: 8,
						fillColor: this.appVariables.color.white,
						strokeColor: this.appVariables.color.pink,
						radius: 2
					},
					label: {
						borderColor: this.appVariables.color.pink,
						offsetY: 0,
						style: {
							color: this.appVariables.color.white,
							background: this.appVariables.color.pink,
						},

						text: 'Point Annotation',
					}
				}]
			},
			dataLabels: { enabled: false },
			stroke: { curve: 'straight' },
			grid: { padding: { right: 30, left: 20 }, borderColor: this.appVariables.color.borderColor },
			xaxis: { type: 'datetime', axisTicks: { show: true, borderType: 'solid', color: this.appVariables.color.borderColor, height: 6, offsetX: 0, offsetY: 0 }, axisBorder: { show: true, color: this.appVariables.color.borderColor, height: 1, width: '100%', offsetX: 0, offsetY: -1 } } 
		};
  }
	
	randomNo() {
		return Math.floor(Math.random() * 60) + 30
	}
	
	ngOnInit() {
		this.chartData = this.getChartData();
	}
	
	constructor(private appVariablesService: AppVariablesService) {
		this.appVariablesService.variablesReload.subscribe(() => {
			this.appVariables = this.appVariablesService.getAppVariables();
			this.chartData = this.getChartData();
		});
	}
}
