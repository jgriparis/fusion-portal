import { Component, OnDestroy } from '@angular/core';
import { EChartOption } from 'echarts';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/core/shared/services/data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-spokespersons',
  templateUrl: './spokespersons.component.html',
  styleUrls: ['./spokespersons.component.css']
})
export class SpokespersonsComponent implements OnDestroy {
  ngDestroy$ = new Subject();
  public chartOption: EChartOption;
  private chartType: string;
  radio: string;
  subscription: Subscription;
  private groupByDate: any;
  isVisibleTop = false;
  userPackage: string;
  isSuperUser: boolean;

  constructor(private data: DataService) {
    this.subscription = this.data
      .getChange()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((rdo) => {
        if (rdo) {
          this.radio = rdo;
          this.getGraph();
        }
      });

    this.subscription = this.data
      .getFilters()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((filt) => {
        this.getGraph();
      });

    this.data.changeNav('Spokespersons');
    this.data.changeReportName('Top Spokespersons');
    this.radio = 'CountPerDay';
    this.getGraph();
  }

  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }

  onChartClick(evt) {
    this.data.ChangeChartSelection(evt.name);
    this.isVisibleTop = true;
  }

  getGraph() {
    const res = JSON.parse(sessionStorage.getItem('sessionData'));

    const graphData = [];

    this.groupByDate = this.groupBy(res, 'author');

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

    for (const key of Object.keys(this.groupByDate)) {
      graphData.push({
        date: key,
        data: this.extractData(this.groupBy(this.groupByDate[key], 'sentiment'))
      });
    }

    const positive = [];
    const positiveData = [];
    const neutral = [];
    const neutralData = [];
    const negative = [];
    const negativeData = [];

    const groupAxis = graphData.map((d) => d.date);

    graphData.map((d) => {
      let hasPositive = false;
      let hasNegative = false;
      let hasNeutral = false;
      d.data.forEach((a) => {
        if (a.sentiment === 'Postive') {
          positiveData.push(a.count);
          hasPositive = true;
        }

        if (a.sentiment === 'Neutral') {
          neutralData.push(a.count);
          hasNeutral = true;
        }

        if (a.sentiment === 'Negative') {
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
      name: 'Positive',
      type: 'bar',
      stack: 'Total',
      data: positiveData
    });

    neutral.push({
      name: 'Neutral',
      type: 'bar',
      stack: 'Total',
      data: neutralData
    });

    negative.push({
      name: 'Negative',
      type: 'bar',
      stack: 'Total',
      data: negativeData
    });

    this.chartOption = {
      tooltip: {
        show: true
      },
      legend: {
        data: ['Positive', 'Neutral', 'Negative']
      },
      xAxis: {
        type: 'category',
        data: groupAxis
      },
      yAxis: {
        type: 'value'
      },
      series: [positive[0], neutral[0], negative[0]]
    };
  }

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
