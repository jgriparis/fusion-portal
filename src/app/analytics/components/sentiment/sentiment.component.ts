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
  selector: 'app-sentiment',
  templateUrl: './sentiment.component.html',
  styleUrls: ['./sentiment.component.css']
})
export class SentimentComponent implements OnDestroy {
  pouchdb: any;
  ngDestroy$ = new Subject();
  public chartOption: EChartOption;
  private chartType: string;
  radio: string;
  subscription: Subscription;
  private groupByDate: any;
  isVisibleTop = false;
  @Input() heading: string;
  userPackage: string;
  isSuperUser: boolean;
  groupAxis: any;

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
      .getDateChange()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((key) => {
        this.getGraph(key);
      });

    this.subscription = this.data
      .getFilters()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((filt) => {
        const storeId = sessionStorage.getItem('storekeyId');
        this.getGraph(storeId);
      });

    this.data.changeReportName('Sentiment');
    this.data.changeNav('Sentiment');
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
    selection.push({ name: evt.seriesName, series: evt.name });
    this.data.ChangeChartSelection(selection);
    this.isVisibleTop = true;
  }

  get isMedium() {
    return sessionStorage.getItem('clientSubscription') == 'MEDIUM';
  }

  getGraph(storeId) {
    const filter = sessionStorage.getItem('userFilter');

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

    if (storeId == 0) return;

    const graphData = [];

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

      switch (this.radio) {
        case 'CountPerDay':
          const dtad = groupObj.group(userData, 'appearancedate');

          for (const key of Object.keys(dtad)) {
            const arr = key.split('_');
            graphData.push({
              date: moment(new Date(arr[0])).format('YYYY-MM-DD'),
              data: this.extractData(this.groupBy(dtad[key], 'sentiment'))
            });
          }

          this.groupAxis = graphData.map((d) => moment(d.date).format('YYYY-MM-DD'));

          this.generateGraph(graphData);
          break;
        case 'CountPerWeek':
          const dtaw = groupObj.group(userData, 'weeknumber');

          for (const key of Object.keys(dtaw)) {
            const arr = key.split('_');
            graphData.push({
              date: arr[0],
              data: this.extractData(this.groupBy(dtaw[key], 'sentiment'))
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
              data: this.extractData(this.groupBy(dta[key], 'sentiment'))
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
    const positive = [];
    const positiveData = [];
    const neutral = [];
    const neutralData = [];
    const negative = [];
    const negativeData = [];

    graphData.map((d) => {
      let hasPositive = false;
      let hasNegative = false;
      let hasNeutral = false;
      d.data.forEach((a) => {
        if (a.sentiment === 'POSITIVE') {
          positiveData.push(a.count);
          hasPositive = true;
        }

        if (a.sentiment === 'NEUTRAL') {
          neutralData.push(a.count);
          hasNeutral = true;
        }

        if (a.sentiment === 'NEGATIVE') {
          negativeData.push(a.count);
          hasNegative = true;
        }
      });
      if (!hasPositive) {
        positiveData.push(0);
      }
      if (!hasNeutral) {
        neutralData.push(0);
      }
      if (!hasNegative) {
        negativeData.push(0);
      }
    });

    positive.push({
      name: 'POSITIVE',
      type: 'bar',
      stack: 'Total',
      color: '#33FF5D',
      data: positiveData
    });

    neutral.push({
      name: 'NEUTRAL',
      type: 'bar',
      stack: 'Total',
      color: '#33CFFF',
      data: neutralData
    });

    negative.push({
      name: 'NEGATIVE',
      type: 'bar',
      stack: 'Total',
      color: '#FF3333',
      data: negativeData
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
      legend: {
        data: ['Positive', 'Neutral', 'Negative'],
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
      series: [positive[0], neutral[0], negative[0]]
    };
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
      dta.push({ sentiment: arr[0].sentiment, count: arr.length });
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
