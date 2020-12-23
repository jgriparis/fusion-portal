import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import * as navOptions from '../charts.json';
import * as moment from 'moment';
import { DataService } from 'src/app/core/shared/services/data.service';
const PouchDB = require('pouchdb').default;
import { AnalyticsService } from 'src/app/analytics/services/analytics.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  pouchdb: any;
  headerForm: FormGroup;
  radio: string;
  subscription: Subscription;
  NavSelected: string;
  dialog = false;
  radioValue = 'ItemCount';
  brand: string;
  reportName: string;
  dateFrom: string;
  dateTo: string;
  defaultFrom: string;
  defaultTo: string;
  filter: any;
  lm = false;
  ic = false;
  is = false;
  cpd = false;
  cpw = false;
  cpm = false;

  isVisibleTop = false;
  isVisibleMiddle = false;

  navoptions: any = (navOptions as any).default;

  constructor(
    private formBuilder: FormBuilder,
    private data: DataService,
    private readonly analyticsService: AnalyticsService
  ) {
    this.pouchdb = new PouchDB('analysisStore');

    this.subscription = this.data
      .getNav()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((nav) => {
        this.NavSelected = nav;
        this.getVisible(nav);
      });

    this.subscription = this.data
      .getReportName()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((rpt) => {
        this.reportName = rpt;
      });

    this.subscription = this.data
      .getDateChange()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((key) => {
        this.loadData();
      });

    this.subscription = this.data
      .getFilters()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((filt) => {
        this.loadData();
      });

    this.subscription = this.data
      .getModalVisible()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((vis) => {
        this.isVisibleTop = vis;
      });

    this.filter = JSON.parse(sessionStorage.getItem('clientFilter'));
    this.loadData();
  }

  ngOnInit(): void {}

  loadData() {
    this.filter = JSON.parse(sessionStorage.getItem('clientFilter'));
    this.brand = this.filter.brand;
    this.defaultFrom = moment(new Date(this.filter.dateFrom)).format('DD MMM YYYY');
    this.defaultTo = moment(new Date(this.filter.dateTo)).format('DD MMM YYYY');
    this.dateFrom = moment(new Date(this.filter.dateFrom)).format('DD MMM YYYY');
    this.dateTo = moment(new Date(this.filter.dateTo)).format('DD MMM YYYY');
  }

  getVisible(val) {
    this.navoptions.forEach((element) => {
      if (element.navItem === val) {
        this.lm = false;
        this.ic = false;
        this.is = false;
        this.cpd = false;
        this.cpw = false;
        this.cpm = false;
        element.types.forEach((elTy) => {
          switch (elTy.menu) {
            case 'LocationMap':
              this.lm = true;
              break;
            case 'ItemCount':
              this.ic = true;
              this.radioValue = 'ItemCount';
              break;
            case 'ItemShare':
              this.is = true;
              break;
            case 'CountPerDay':
              this.cpd = true;
              this.radioValue = 'CountPerDay';
              break;
            case 'CountPerWeek':
              this.cpw = true;
              break;
            case 'CountPerMonth':
              this.cpm = true;
              break;
            default:
              break;
          }
        });
      }
    });
  }

  onChangeRadio(): void {
    this.data.changeRadio(this.radioValue);
  }

  onChangeFrom(ev): void {
    let filter = JSON.parse(sessionStorage.getItem('clientFilter'));
    let usrfilter = JSON.parse(sessionStorage.getItem('userFilter'));

    filter.dateFrom = moment(new Date(ev)).format('YYYY-MM-DD');
    usrfilter.dateFrom = moment(new Date(ev)).format('YYYY-MM-DD');

    sessionStorage.setItem('clientFilter', JSON.stringify(filter));
    sessionStorage.setItem('userFilter', JSON.stringify(usrfilter));

    this.analyticsService
      .getData(filter)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res) => {
        const storekey = new Date().toISOString();
        this.pouchdb.put({ _id: storekey, data: res });
        sessionStorage.setItem('storekeyId', storekey);
        this.data.ChangeDate(storekey);
      });
  }

  onChangeTo(ev): void {
    let filter = JSON.parse(sessionStorage.getItem('clientFilter'));
    let usrfilter = JSON.parse(sessionStorage.getItem('userFilter'));

    filter.dateTo = moment(new Date(ev)).format('YYYY-MM-DD');
    usrfilter.dateTo = moment(new Date(ev)).format('YYYY-MM-DD');

    sessionStorage.setItem('clientFilter', JSON.stringify(filter));
    sessionStorage.setItem('userFilter', JSON.stringify(usrfilter));

    this.analyticsService
      .getData(filter)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res) => {
        const storekey = new Date().toISOString();
        this.pouchdb.put({ _id: storekey, data: res });
        sessionStorage.setItem('storekeyId', storekey);
        this.data.ChangeDate(storekey);
      });
  }

  showModalTop(): void {
    this.data.resetFilters(true);
    this.isVisibleTop = true;
  }

  handleOkTop(): void {
    this.isVisibleTop = false;
  }

  handleCancelTop(): void {
    this.isVisibleTop = false;
  }

  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}
