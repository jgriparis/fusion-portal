import { Component, OnDestroy } from '@angular/core';
import { DataService } from 'src/app/core/shared/services/data.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
const PouchDB = require('pouchdb').default;
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnDestroy {
  pouchdb: any;
  ngDestroy$ = new Subject();
  public aveValue: number;
  aveText: string;
  dateFrom: string;
  dateTo: string;
  subscription: Subscription;

  constructor(private router: Router, private data: DataService) {
    this.pouchdb = new PouchDB('analysisStore');

    this.subscription = this.data
      .getFilters()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((filt) => {
        const storeId = sessionStorage.getItem('storekeyId');
        this.getAVE(storeId);
      });

    this.subscription = this.data
      .getDateChange()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((key) => {
        this.getAVE(key);
      });

    const storeId = sessionStorage.getItem('storekeyId');
    this.getAVE(storeId);
  }

  getAVE(storeId) {
    const filter = sessionStorage.getItem('clientFilter');
    const jfilter = JSON.parse(filter);

    this.dateFrom = jfilter.dateFrom;
    this.dateTo = jfilter.dateTo;
    this.aveValue = 0;

    if (storeId == 0) return;

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

      userData.forEach((a) => {
        this.aveValue += a.ratecard == null ? 0 : Number(a.ratecard.replace(',', '.'));
      });
      this.aveText = this.aveValue.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
    });
  }

  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}
