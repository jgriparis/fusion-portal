import { Component, OnDestroy, Input } from '@angular/core';
import { EChartOption } from 'echarts';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/core/shared/services/data.service';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
const PouchDB = require('pouchdb').default;
import * as groupObj from '@hunters/group-object';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-volume',
  templateUrl: './volume.component.html',
  styleUrls: ['./volume.component.css']
})
export class VolumeComponent implements OnDestroy {
  pouchdb: any;
  ngDestroy$ = new Subject();
  public chartOption: EChartOption;
  private chartType: string;
  radio: string;
  subscription: Subscription;
  private groupByDate: any;
  isVisibleTop = false;
  groupAxis: any;
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

    this.data.changeReportName('Total Media Volume');
    this.data.changeNav('Volume');
    this.radio = 'CountPerDay';

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
    selection.push({
      name: evt.seriesName,
      series: evt.name,
      type: this.radio
    });
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

    const graphData = [];

    if (!storeId) return;

    this.pouchdb.get(storeId).then((res) => {
      let userData = res.data;

      this.heading = `${res.data.length} Items`;

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

      switch (this.radio) {
        case 'CountPerDay':
          const dtaad = groupObj.group(userData, 'appearancedate');

          for (const key of Object.keys(dtaad)) {
            const arr = key.split('_');
            graphData.push({
              date: moment(arr[0]).format('YYYY-MM-DD'),
              data: this.extractData(this.groupBy(dtaad[key], 'mediatype'))
            });
          }

          graphData.sort((a, b) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          });

          this.groupAxis = graphData.map((d) => moment(d.date).format('YYYY-MM-DD'));

          this.generateGraph(graphData);
          break;
        case 'CountPerWeek':
          const dtaw = groupObj.group(userData, 'weeknumber');

          for (const key of Object.keys(dtaw)) {
            const arr = key.split('_');
            graphData.push({
              date: arr[0],
              data: this.extractData(this.groupBy(dtaw[key], 'mediatype'))
            });
          }

          this.groupAxis = graphData.map((d) => d.date);

          this.generateGraph(graphData);
          break;
        case 'CountPerMonth':
          const dta = groupObj.group(userData, 'monthname');

          for (const key of Object.keys(dta)) {
            const arr = key.split('_');
            graphData.push({
              date: arr[0],
              data: this.extractData(this.groupBy(dta[key], 'mediatype'))
            });
          }

          this.groupAxis = graphData
            .map((d) => d.date)
            .sort((a, b) => {
              return allMonths.indexOf(a.trim()) - allMonths.indexOf(b.trim());
            });

          this.generateGraph(graphData);
          break;
        default:
          break;
      }
    });
  }

  generateGraph = (graphData) => {
    const television = [];
    const televisionData = [];
    const radio = [];
    const radioData = [];
    const online = [];
    const onlineData = [];
    const newspaper = [];
    const newspaperData = [];
    const magazine = [];
    const magazineData = [];
    const outdoor = [];
    const outdoorData = [];

    graphData.map((d) => {
      let hasTelevion = false;
      let hasRadio = false;
      let hasOnline = false;
      let hasNewspaper = false;
      let hasMagazine = false;
      let hasOutdoor = false;

      d.data.forEach((a) => {
        if (a.mediatype === 'TELEVISION') {
          televisionData.push(a.count);
          hasTelevion = true;
        }

        if (a.mediatype === 'RADIO') {
          radioData.push(a.count);
          hasRadio = true;
        }

        if (a.mediatype === 'ONLINE') {
          onlineData.push(a.count);
          hasOnline = true;
        }

        if (a.mediatype === 'NEWSPAPER') {
          newspaperData.push(a.count);
          hasNewspaper = true;
        }

        if (a.mediatype === 'MAGAZINE') {
          magazineData.push(a.count);
          hasMagazine = true;
        }

        if (a.mediatype === 'OUTDOOR') {
          outdoorData.push(a.count);
          hasOutdoor = true;
        }
      });
      if (!hasTelevion) {
        televisionData.push(0);
      }
      if (!hasRadio) {
        radioData.push(0);
      }
      if (!hasOnline) {
        onlineData.push(0);
      }
      if (!hasNewspaper) {
        newspaperData.push(0);
      }
      if (!hasMagazine) {
        magazineData.push(0);
      }
      if (!hasOutdoor) {
        outdoorData.push(0);
      }
    });

    television.push({
      name: 'Television',
      type: 'bar',
      stack: 'Total',
      data: televisionData
    });

    radio.push({
      name: 'Radio',
      type: 'bar',
      stack: 'Total',
      data: radioData
    });

    online.push({
      name: 'Online',
      type: 'bar',
      stack: 'Total',
      data: onlineData
    });

    newspaper.push({
      name: 'Newspaper',
      type: 'bar',
      stack: 'Total',
      data: newspaperData
    });

    magazine.push({
      name: 'Magazine',
      type: 'bar',
      stack: 'Total',
      data: magazineData
    });

    outdoor.push({
      name: 'Outdoor',
      type: 'bar',
      stack: 'Total',
      data: outdoorData
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
      legend: {
        data: ['Television', 'Radio', 'Online', 'Newspaper', 'Magazine', 'Outdoor'],
        top: this.heading ? 30 : 0
      },
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
      series: [television[0], radio[0], online[0], newspaper[0], magazine[0], outdoor[0]]
    };
    this.spinner.hide();
  };

  groupBy = (arr, key) => {
    return arr.reduce((result, currentValue) => {
      (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
      return result;
    }, {}); // empty object is the initial value for result object
  };

  extractData = (data) => {
    const dta = [];
    for (const key of Object.keys(data)) {
      const arr = data[key];
      dta.push({ mediatype: arr[0].mediatype, count: arr.length });
    }
    return dta;
  };

  handleOkTop(): void {
    this.isVisibleTop = false;
  }

  handleCancelTop(): void {
    this.isVisibleTop = false;
  }
}
