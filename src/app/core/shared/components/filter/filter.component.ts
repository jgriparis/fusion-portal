import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DataService } from '../../services/data.service';
import { ClientService } from 'src/app/core/clients/services/client.service';
const PouchDB = require('pouchdb').default;
import { SharedService } from '../../services/shared.service';
import { AuthService } from '../../services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit, OnDestroy {
  pouchdb: any;
  ngDestroy$ = new Subject();
  dropdownSettings = {};
  subscription: Subscription;
  filterForm: FormGroup;
  listOfMediaSource = [];
  listOfBrand: string[] = [];
  listOfMediaType: string[] = [];
  listOfCategory: string[] = [];
  listOfSubCategory: string[] = [];
  listOfAdvertType: string[] = [];
  listOfLanguage: string[] = [];
  listOfLocation: string[] = [];
  listOfType: string[] = [];
  listOfSentiment: string[] = [];
  listOfAuthor: string[] = [];
  listOfCountry: string[] = [];
  listOfTopic: string[] = [];
  isVisibleTop = false;
  selectedBrand = [];

  listOfSelectedValue = [];
  selectedItemsCountry = [];
  selectedItemsTopic = [];
  selectedItemsAuthor = [];
  selectedItemsSentiment = [];
  selectedItemsType = [];
  selectedItemsSource = [];
  selectedItemsLocation = [];
  selectedItemsLanguage = [];
  selectedItemsAdvertType = [];
  selectedItemsSubCategory = [];
  selectedItemsCategory = [];
  selectedItemsBrand = [];
  selectedItemsMediaType = [];

  radioValue = 'A';
  style = {
    display: 'block',
    height: '30px',
    lineHeight: '30px'
  };

  constructor(
    private data: DataService,
    private fb: FormBuilder,
    private readonly clientService: ClientService,
    private readonly sharedService: SharedService,
    private readonly authService: AuthService
  ) {
    this.pouchdb = new PouchDB('analysisStore');

    this.subscription = this.data
      .getFilters()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((filt) => {
        const clientId = sessionStorage.getItem('clientId');
        const storeId = sessionStorage.getItem('storekeyId');
        this.loadData(clientId, storeId);
      });

    this.subscription = this.data
      .getDateChange()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((key) => {
        const clientId = sessionStorage.getItem('clientId');
        this.loadData(clientId, key);
      });

    this.subscription = this.data
      .getResetFilter()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((key) => {
        const clientId = sessionStorage.getItem('clientId');
        const storeId = sessionStorage.getItem('storekeyId');
        this.loadData(clientId, storeId);
        this.loadFilters();
      });

    this.filterForm = this.fb.group({
      txtSearch: [null],
      drpMediaSource: [null],
      drpMediaType: [null],
      drpBrand: [null],
      drpCategory: [null],
      drpSubCategory: [null],
      drpAdvertType: [null],
      drpLanguage: [null],
      drpLocation: [null],
      drpType: [null],
      drpSentiment: [null],
      drpAuthor: [null],
      drpTopic: [null],
      drpCountry: [null]
    });
  }

  ngOnInit(): void {
    this.dropdownSettings = {
      singleSelection: false,
      primaryKey: 'id',
      labelKey: 'itemName',
      filterSelectAllText: 'Select All',
      filterUnSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      enableCheckAll: true,
      enableFilterSelectAll: true,
      text: 'Please select one/many',
      maxHeight: 250,
      lazyLoading: true
    };

    const userFilter = JSON.parse(sessionStorage.getItem('clientFilter'));
    const clientId = sessionStorage.getItem('clientId');
    const storeId = sessionStorage.getItem('storekeyId');

    this.loadData(clientId, storeId);
  }

  loadFilters() {
    const currFilter = JSON.parse(sessionStorage.getItem('userFilter'));
    let arrVal = [];

    currFilter.brand.forEach((b) => {
      arrVal.push({ id: b.id, itemName: b.itemName });
    });

    this.selectedItemsBrand = arrVal;
    arrVal = [];

    currFilter.country.forEach((b) => {
      arrVal.push({ id: b.id, itemName: b.itemName });
    });

    this.selectedItemsCountry = arrVal;
    arrVal = [];

    currFilter.topic.forEach((b) => {
      arrVal.push({ id: b.id, itemName: b.itemName });
    });

    this.selectedItemsTopic = arrVal;
    arrVal = [];

    currFilter.author.forEach((b) => {
      arrVal.push({ id: b.id, itemName: b.itemName });
    });

    this.selectedItemsAuthor = arrVal;
    arrVal = [];

    currFilter.sentiment.forEach((b) => {
      arrVal.push({ id: b.id, itemName: b.itemName });
    });

    this.selectedItemsSentiment = arrVal;
    arrVal = [];

    currFilter.type.forEach((b) => {
      arrVal.push({ id: b.id, itemName: b.itemName });
    });

    this.selectedItemsType = arrVal;
    arrVal = [];

    currFilter.source.forEach((b) => {
      arrVal.push({ id: b.id, itemName: b.itemName });
    });

    this.selectedItemsSource = arrVal;
    arrVal = [];

    currFilter.location.forEach((b) => {
      arrVal.push({ id: b.id, itemName: b.itemName });
    });

    this.selectedItemsLocation = arrVal;
    arrVal = [];

    currFilter.language.forEach((b) => {
      arrVal.push({ id: b.id, itemName: b.itemName });
    });

    this.selectedItemsLanguage = arrVal;
    arrVal = [];

    currFilter.adverttype.forEach((b) => {
      arrVal.push({ id: b.id, itemName: b.itemName });
    });

    this.selectedItemsAdvertType = arrVal;
    arrVal = [];

    currFilter.subcategory.forEach((b) => {
      arrVal.push({ id: b.id, itemName: b.itemName });
    });

    this.selectedItemsSubCategory = arrVal;
    arrVal = [];

    currFilter.category.forEach((b) => {
      arrVal.push({ id: b.id, itemName: b.itemName });
    });

    this.selectedItemsCategory = arrVal;
    arrVal = [];

    currFilter.mediatype.forEach((b) => {
      arrVal.push({ id: b.id, itemName: b.itemName });
    });

    this.selectedItemsMediaType = arrVal;
    arrVal = [];
  }

  loadData = (clientId, storeId) => {
    this.resetForm();

    this.clientService
      .getClient(clientId)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res) => {
        const aTypes = [];
        const aCountries = [];
        const aMediaTypes = [];
        const aBrands = [];
        const aCategories = [];
        const aSubCategories = [];
        const aTopics = [];

        res[0].clienttypes.forEach((d) => {
          aTypes.push({ id: d.type.id, itemName: d.type.typeName });

          d.clientcountries.forEach((c) => {
            aCountries.push({ id: c.country.id, itemName: c.country.countryName });

            c.clientmediatypes.forEach((m) => {
              aMediaTypes.push({ id: m.mediatype.id, itemName: m.mediatype.mediatypeName });
            });

            c.clientbrands.forEach((m) => {
              aBrands.push({ id: m.brand.id, itemName: m.brand.brandName });
            });

            c.clientcategories.forEach((m) => {
              aCategories.push({ id: m.category.id, itemName: m.category.categoryName });
            });

            c.clientsubcategories.forEach((m) => {
              aSubCategories.push({ id: m.subcategory.id, itemName: m.subcategory.subcategoryName });
            });

            c.clienttopics.forEach((m) => {
              aTopics.push({ id: m.topic.id, itemName: m.topic.topicName });
            });
          });
        });

        this.listOfType = [...new Set(aTypes)];
        this.listOfCountry = [...new Set(aCountries)];
        this.listOfMediaType = [...new Set(aMediaTypes)];
        this.listOfBrand = [...new Set(aBrands)];
        this.listOfCategory = [...new Set(aCategories)];
        this.listOfSubCategory = [...new Set(aSubCategories)];
        this.listOfTopic = [...new Set(aTopics)];
      });

    this.pouchdb.get(storeId).then((res) => {
      const lms = [];
      const arrMediaSource = this.groupBy(res.data, 'source');
      for (const key of Object.keys(arrMediaSource)) {
        lms.push({ itemName: key });
      }
      this.listOfMediaSource = lms;

      const lang = [];
      const arrLanguage = this.groupBy(res.data, 'language');
      for (const key of Object.keys(arrLanguage)) {
        lang.push({ itemName: key });
      }
      this.listOfLanguage = lang;

      const adtype = [];
      const arrAdtypes = this.groupBy(res.data, 'advertisingtype');
      for (const key of Object.keys(arrAdtypes)) {
        adtype.push({ itemName: key });
      }
      this.listOfAdvertType = adtype;

      const loc = [];
      const arrLocation = this.groupBy(res.data, 'region');
      for (const key of Object.keys(arrLocation)) {
        loc.push({ itemName: key });
      }
      this.listOfLocation = loc;

      const sent = [];
      const arrSentiment = this.groupBy(res.data, 'sentiment');
      for (const key of Object.keys(arrSentiment)) {
        sent.push({ itemName: key });
      }
      this.listOfSentiment = sent;

      const auth = [];
      const arrAuthor = this.groupBy(res.data, 'author');
      for (const key of Object.keys(arrAuthor)) {
        auth.push({ itemName: key });
      }
      this.listOfAuthor = auth;
    });
  };

  groupBy = (arr, key) => {
    return arr.reduce((result, currentValue) => {
      (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);

      return result;
    }, {}); // empty object is the initial value for result object
  };

  submitForm(): void {
    const filter = JSON.parse(sessionStorage.getItem('userFilter'));
    filter.brand = this.filterForm.get('drpBrand').value;
    filter.source =
      this.filterForm.get('drpMediaSource').value == null ? [] : this.filterForm.get('drpMediaSource').value;
    filter.mediatype =
      this.filterForm.get('drpMediaType').value == null ? [] : this.filterForm.get('drpMediaType').value;
    filter.category = this.filterForm.get('drpCategory').value == null ? [] : this.filterForm.get('drpCategory').value;
    filter.subcategory =
      this.filterForm.get('drpSubCategory').value == null ? [] : this.filterForm.get('drpSubCategory').value;
    filter.adverttype =
      this.filterForm.get('drpAdvertType').value == null ? [] : this.filterForm.get('drpAdvertType').value;
    filter.language = this.filterForm.get('drpLanguage').value == null ? [] : this.filterForm.get('drpLanguage').value;
    filter.location = this.filterForm.get('drpLocation').value == null ? [] : this.filterForm.get('drpLocation').value;
    filter.type = this.filterForm.get('drpType').value == null ? [] : this.filterForm.get('drpType').value;
    filter.sentiment =
      this.filterForm.get('drpSentiment').value == null ? [] : this.filterForm.get('drpSentiment').value;
    filter.author = this.filterForm.get('drpAuthor').value == null ? [] : this.filterForm.get('drpAuthor').value;
    filter.topic = this.filterForm.get('drpTopic').value == null ? [] : this.filterForm.get('drpTopic').value;
    filter.country = this.filterForm.get('drpCountry').value == null ? [] : this.filterForm.get('drpCountry').value;

    this.sharedService.createActivity(this.authService.userValue.id, 5, null, null, JSON.stringify(filter));

    sessionStorage.setItem('userFilter', JSON.stringify(filter));
    this.data.changeFilters(true);

    this.data.changeModalVisible(false);
  }

  resetForm(): void {
    this.selectedItemsCountry = [];
    this.selectedItemsTopic = [];
    this.selectedItemsAuthor = [];
    this.selectedItemsSentiment = [];
    this.selectedItemsType = [];
    this.selectedItemsSource = [];
    this.selectedItemsLocation = [];
    this.selectedItemsLanguage = [];
    this.selectedItemsAdvertType = [];
    this.selectedItemsSubCategory = [];
    this.selectedItemsCategory = [];
    this.selectedItemsBrand = [];
    this.selectedItemsMediaType = [];
  }

  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}
