import { Component, OnDestroy, Input } from '@angular/core';
import { EChartOption } from 'echarts';
import { Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
const PouchDB = require('pouchdb').default;
import { DataService } from 'src/app/core/shared/services/data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-adverttype',
  templateUrl: './adverttype.component.html',
  styleUrls: ['./adverttype.component.css']
})
export class AdverttypeComponent implements OnDestroy {
  pouchdb: any;
  ngDestroy$ = new Subject();
  public chartOption: EChartOption;
  private chartType: string;
  radio: string;
  subscription: Subscription;
  isVisibleTop = false;
  @Input() heading: string;

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

    this.data.changeReportName('Advert Type');
    this.data.changeNav('AdvertType');
    this.radio = 'ItemCount';
    const storeId = sessionStorage.getItem('storekeyId');
    this.getGraph(storeId);
  }

  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }

  onChartClick(evt) {
    const selection = [];
    selection.push({ name: evt.name, series: evt.seriesName });
    this.data.ChangeChartSelection(selection);
    this.isVisibleTop = true;
  }

  getGraph(storeId) {
    switch (this.radio) {
      case 'ItemCount':
        this.chartType = 'bar';
        break;
      case 'ItemShare':
        this.chartType = 'pie';
        break;
      default:
        break;
    }

    this.pouchdb.get(storeId).then((res) => {
      this.heading = `${res.data.length} Items`;

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

      const graphData = this.groupBy(userData, 'advertisingtype');

      const xAxis = [];
      const yAxis = [];
      const pieDt = [];
      const graphArr = [];

      Object.keys(graphData).map((gd) => {
        let ga = graphData[gd];
        if (ga[0].advertisingtype) graphArr.push({ advertisingtype: ga[0].advertisingtype, count: ga.length });
      });

      graphArr.sort((a, b) => {
        return b.count - a.count;
      });

      graphArr.forEach((g) => {
        xAxis.push(g.advertisingtype);
        yAxis.push(g.count);
        pieDt.push({ name: g.advertisingtype, value: g.count, label: g.advertisingtype });
      });

      const groupAxis = xAxis;
      const dataAxis = yAxis;
      const dAxis = [];

      dataAxis.forEach((a) => {
        dAxis.push({ value: a, itemStyle: { color: this.dynamicColors() } });
      });

      switch (this.chartType) {
        case 'bar':
          this.chartOption = {
            grid: {
              containLabel: true
            },
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
              data: groupAxis,
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
          break;
        case 'pie':
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
              trigger: 'item',
              formatter: '{b}: {c} ({d}%)'
            },
            series: [
              {
                type: 'pie',
                radius: ['50%', '70%'],
                avoidLabelOverlap: true,
                label: {
                  show: true,
                  position: 'outside',
                  formatter: '{b}: ({d}%)'
                },
                emphasis: {
                  itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                  }
                },
                labelLine: {
                  show: true
                },
                data: pieDt
              }
            ]
          };
          break;
        default:
          break;
      }
    });
    this.spinner.hide();
  }

  groupBy = (arr, key) => {
    return arr.reduce((result, currentValue) => {
      (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
      return result;
    }, {}); // empty object is the initial value for result object
  };

  showSpinner() {
    this.spinner.show();
  }

  handleOkTop(): void {
    this.isVisibleTop = false;
  }

  handleCancelTop(): void {
    this.isVisibleTop = false;
  }

  dynamicColors = () => {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  };
}
