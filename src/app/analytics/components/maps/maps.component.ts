import { Component, OnDestroy } from '@angular/core';
import * as Highcharts from 'highcharts/highmaps';
import MapModule from 'highcharts/modules/map';
const SouthAfrica = require('@highcharts/map-collection/countries/za/za-all.geo.json');

import { DataService } from 'src/app/core/shared/services/data.service';
import { Subscription } from 'rxjs';
const PouchDB = require('pouchdb').default;
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

MapModule(Highcharts);

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.css']
})
export class MapsComponent implements OnDestroy {
  pouchdb: any;
  ngDestroy$ = new Subject();
  Highcharts: typeof Highcharts = Highcharts;
  chartConstructor = 'mapChart';
  chartOptions: any;
  subscription: Subscription;
  isVisibleTop = false;

  constructor(private data: DataService) {
    this.pouchdb = new PouchDB('analysisStore');

    this.subscription = this.data
      .getFilters()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((filt) => {
        const storeId = sessionStorage.getItem('storekeyId');
        this.getGraph(storeId);
      });

    this.subscription = this.data
      .getDateChange()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((key) => {
        this.getGraph(key);
      });

    const storeId = sessionStorage.getItem('storekeyId');
    this.getGraph(storeId);
  }

  handleOkTop(): void {
    this.isVisibleTop = false;
  }

  handleCancelTop(): void {
    this.isVisibleTop = false;
  }

  getGraph(storeId) {
    const filter = sessionStorage.getItem('userFilter');

    this.pouchdb.get(storeId).then((res) => {
      let userData = res.data;

      const userFilter = JSON.parse(sessionStorage.getItem('userFilter'));

      if (userFilter.brand.length > 0) userData = res.data.filter((item) => userFilter.brand.includes(item.brand));

      if (userFilter.source.length > 0) userData = res.data.filter((item) => userFilter.brand.includes(item.brand));
      if (userFilter.mediatype.length > 0)
        userData = res.data.filter((item) => userFilter.mediatype.includes(item.mediatype));
      if (userFilter.category.length > 0)
        userData = res.data.filter((item) => userFilter.category.includes(item.category));
      if (userFilter.subcategory.length > 0)
        userData = res.data.filter((item) => userFilter.subcategory.includes(item.subcategory));
      if (userFilter.adverttype.length > 0)
        userData = res.data.filter((item) => userFilter.adverttype.includes(item.adverttype));
      if (userFilter.language.length > 0)
        userData = res.data.filter((item) => userFilter.language.includes(item.language));
      if (userFilter.location.length > 0)
        userData = res.data.filter((item) => userFilter.location.includes(item.region));
      if (userFilter.type.length > 0) userData = res.data.filter((item) => userFilter.type.includes(item.type));
      if (userFilter.sentiment.length > 0)
        userData = res.data.filter((item) => userFilter.sentiment.includes(item.sentiment));
      if (userFilter.author.length > 0) userData = res.data.filter((item) => userFilter.author.includes(item.author));
      if (userFilter.topic.length > 0) userData = res.data.filter((item) => userFilter.topic.includes(item.topic));
      if (userFilter.country.length > 0)
        userData = res.data.filter((item) => userFilter.country.includes(item.country));
      if (userFilter.exclude.length > 0) userData = res.data.filter((item) => !userFilter.exclude.includes(item.id));

      const graphData = this.groupBy(userData, 'region');

      const mapData = [];
      let chartSubHeading = '';

      for (const key of Object.keys(graphData)) {
        switch (key) {
          case 'NATIONAL':
            chartSubHeading = `<b>NATIONAL: ${graphData[key].length}</b><br/>`;
            break;
          case 'GAUTENG':
            chartSubHeading += ` Gauteng: ${graphData[key].length}<br/>`;
            mapData.push(['za-gt', graphData[key].length]);
            break;
          case 'KWAZULU NATAL':
            chartSubHeading += ` Kwazulu Natal: ${graphData[key].length}<br/>`;
            mapData.push(['za-nl', graphData[key].length]);
            break;
          case 'WESTERN CAPE':
            chartSubHeading += ` Western Cape: ${graphData[key].length}<br/>`;
            mapData.push(['za-wc', graphData[key].length]);
            break;
          case 'EASTERN CAPE':
            chartSubHeading += ` Eastern Cape: ${graphData[key].length}<br/>`;
            mapData.push(['za-ec', graphData[key].length]);
            break;
          case 'NORTHERN PROVINCE':
            chartSubHeading += ` Northern Province: ${graphData[key].length}<br/>`;
            mapData.push(['za-np', graphData[key].length]);
            break;
          case 'NORTH WEST':
            chartSubHeading += ` North West: ${graphData[key].length}<br/>`;
            mapData.push(['za-nw', graphData[key].length]);
            break;
          case 'FREE STATE':
            chartSubHeading += ` Free State: ${graphData[key].length}<br/>`;
            mapData.push(['za-fs', graphData[key].length]);
            break;
          case 'MPUMALANGA':
            chartSubHeading += ` Mpumalanga: ${graphData[key].length}<br/>`;
            mapData.push(['za-mp', graphData[key].length]);
            break;
          default:
            break;
        }
      }

      this.chartOptions = {
        chart: {
          map: SouthAfrica
        },
        title: {
          text: 'South Africa'
        },
        subtitle: {
          text: chartSubHeading
        },
        colorAxis: {
          min: 0
        },
        plotOptions: {
          series: {
            point: {
              events: {
                click: (e) => {
                  const selection = [];
                  if (e.point.name === 'KwaZulu-Natal') {
                    e.point.name = 'KwaZulu Natal';
                  }
                  if (e.point.name === 'Orange Free State') {
                    e.point.name = 'Free State';
                  }
                  selection.push({ name: e.point.name, series: null });
                  this.data.ChangeChartSelection(selection);
                  this.isVisibleTop = true;
                }
              }
            }
          }
        },
        mapNavigation: {
          enabled: true,
          buttonOptions: {
            alignTo: 'spacingBox'
          }
        },
        series: [
          {
            data: mapData,
            name: 'Coverage',
            states: {
              hover: {
                color: '#BADA55'
              }
            },
            dataLabels: {
              enabled: true,
              format: '{point.name}'
            },
            allAreas: true
          }
        ]
      };
    });
  }

  groupBy = (arr, key) => {
    return arr.reduce((result, currentValue) => {
      (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
      return result;
    }, {}); // empty object is the initial value for result object
  };

  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}
