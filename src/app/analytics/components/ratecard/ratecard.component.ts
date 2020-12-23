import { Component, OnDestroy } from '@angular/core';
import { EChartOption } from 'echarts';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/core/shared/services/data.service';
import { forEach } from 'lodash';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
const PouchDB = require('pouchdb').default;
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-ratecard',
  templateUrl: './ratecard.component.html',
  styleUrls: ['./ratecard.component.css']
})
export class RatecardComponent implements OnDestroy {
  pouchdb: any;
  ngDestroy$ = new Subject();
  public chartOption: EChartOption;
  private chartType: string;
  radio: string;
  subscription: Subscription;
  private groupByDate: any;
  isVisibleTop = false;
  groupAxis: any;
  heading: string;

  constructor(private data: DataService, private spinner: NgxSpinnerService) {
    this.pouchdb = new PouchDB('analysisStore');

    this.subscription = this.data
      .getChange()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((rdo) => {
        if (rdo) {
          this.radio = rdo;
          const storeId = sessionStorage.getItem('storekeyId');
          this.getGraph(storeId);
        }
      });

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

    this.radio = 'CountPerDay';
    this.data.changeReportName('Rate Card (AVE)');
    this.data.changeNav('RateCard');

    const storeId = sessionStorage.getItem('storekeyId');
    this.getGraph(storeId);
  }

  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }

  showSpinner() {
    this.spinner.show();
  }

  onChartClick(evt) {
    const selection = [];
    selection.push({ name: evt.name, series: evt.name });
    this.data.ChangeChartSelection(selection);
    this.isVisibleTop = true;
  }

  getGraph(storeId) {
    const allMonths = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];

    this.pouchdb.get(storeId).then((res) => {
      let userData = res.data;

      this.getTotal(userData);

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

      const graphData = [];
      switch (this.radio) {
        case 'CountPerDay':
          this.groupByDate = this.groupBy(userData, 'appearancedate');
          for (const key of Object.keys(this.groupByDate)) {
            graphData.push({
              date: new Date(key),
              data: this.extractData(this.groupByDate[key])
            });
          }

          graphData.sort((a, b) => {
            return a.date - b.date;
          });

          this.groupAxis = graphData.map((d) => moment(d.date).format('YYYY-MM-DD'));

          break;
        case 'CountPerWeek':
          this.groupByDate = this.groupBy(userData, 'weeknumber');
          for (const key of Object.keys(this.groupByDate)) {
            graphData.push({
              date: key,
              data: this.extractData(this.groupByDate[key])
            });
          }

          this.groupAxis = graphData.map((d) => d.date);
          break;
        case 'CountPerMonth':
          this.groupByDate = this.groupBy(userData, 'monthname');
          for (const key of Object.keys(this.groupByDate)) {
            graphData.push({
              date: key,
              data: this.extractData(this.groupByDate[key])
            });
          }

          graphData.sort((a, b) => {
            return allMonths.indexOf(a.date.trim()) - allMonths.indexOf(b.date.trim());
          });

          this.groupAxis = graphData
            .map((d) => d.date)
            .sort((a, b) => {
              return allMonths.indexOf(a.trim()) - allMonths.indexOf(b.trim());
            });

          break;
        default:
          break;
      }

      const dAxis = [];
      const dataAxis = graphData.map((d) => d.data[0].value.toFixed(2));

      dataAxis.forEach((a) => {
        dAxis.push({ value: a, itemStyle: { color: this.dynamicColors() } });
      });

      this.chartOption = {
        title: {
          subtext: this.heading,
          subtextStyle: {
            color: 'rgba(224, 42, 42, 1)',
            fontWeight: 'bold'
          },
          left: '5%'
        },
        tooltip: {
          show: true
        },
        toolbox: {
          show: true,
          feature: {
            dataZoom: {
              yAxisIndex: 'none',
              title: { zoom: 'Select area to Zoom', back: 'Previous Zoom' }
            },
            restore: { title: 'Restore' }
          }
        },
        dataZoom: [
          {
            type: 'inside',
            throttle: 50
          }
        ],
        xAxis: {
          type: 'category',
          data: this.groupAxis,
          axisLabel: {
            rotate: 30
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: dAxis,
            type: 'bar'
          }
        ]
      };
    });
    this.spinner.hide();
  }

  dynamicColors = () => {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  };

  groupBy = (arr, key) => {
    return arr.reduce((result, currentValue) => {
      (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
      return result;
    }, {}); // empty object is the initial value for result object
  };

  getTotal = (data) => {
    const dta = [];
    let val = 0;
    for (const key of Object.keys(data)) {
      const arr = data[key];

      if (arr.ratecard) {
        val = val + Number(arr.ratecard.replace(',', '.'));
      }
    }

    this.heading = `Total Value: ${val
      .toFixed(2)
      .replace(/\d(?=(\d{3})+\.)/g, '$&,')
      .toString()}`;
  };

  extractData = (data) => {
    const dta = [];
    let val = 0;
    for (const key of Object.keys(data)) {
      const arr = data[key];

      if (arr.ratecard) {
        val = val + Number(arr.ratecard.replace(',', '.'));
      }
    }
    dta.push({ value: val });
    return dta;
  };

  handleOkTop(): void {
    this.isVisibleTop = false;
  }

  handleCancelTop(): void {
    this.isVisibleTop = false;
  }
}
