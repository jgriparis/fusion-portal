import { Component, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { DataService } from 'src/app/core/shared/services/data.service';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import { Module } from '@ag-grid-community/core';
const PouchDB = require('pouchdb').default;
import { SharedService } from 'src/app/core/shared/services/shared.service';
import { AuthService } from 'src/app/core/shared/services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

@Component({
  selector: 'app-datachart',
  templateUrl: './datachart.component.html',
  styleUrls: ['./datachart.component.css']
})
export class DatachartComponent implements OnDestroy {
  pouchdb: any;
  ngDestroy$ = new Subject();
  DataRows: Array<any>;
  cols: any[];
  loading: boolean;
  public MediaTypes: Array<any>;
  public Sources: Array<any>;
  public Brands: Array<any>;
  public Categories: Array<any>;
  public SubCategories: Array<any>;
  public AdvertTypes: Array<any>;
  public Languages: Array<any>;
  public Regions: Array<any>;
  dateFilters: any;
  subscription: Subscription;
  displayResourceDialog: any;
  defaultColDef;
  sideBar;
  canCircle: boolean;
  canExport: boolean;
  isSuperUser: boolean;
  sandbox: Array<any>;
  isPopup: boolean;

  private gridApi;

  public modules: Module[] = [ClientSideRowModelModule, ColumnsToolPanelModule, ExcelExportModule];

  @Input() itemField: string;
  @Input() itemCategory: string;

  constructor(
    private data: DataService,
    private readonly sharedService: SharedService,
    private readonly authService: AuthService
  ) {
    this.pouchdb = new PouchDB('analysisStore');
    this.subscription = this.data
      .getFilters()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(() => {
        const storeId = sessionStorage.getItem('storekeyId');
        this.getData(storeId);
      });

    this.subscription = this.data
      .getDateChange()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((key) => {
        this.getData(key);
      });

    this.subscription = this.data
      .getChartSelection()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((sel) => {
        this.setFilter(sel);
      });

    this.defaultColDef = {
      flex: 1,
      minWidth: 150,
      enableValue: false,
      enableRowGroup: false,
      enablePivot: false,
      filter: true,
      sortable: true,
      resizable: true
    };

    this.sideBar = {
      toolPanels: [
        {
          id: 'columns',
          labelDefault: 'Columns',
          labelKey: 'columns',
          iconKey: 'columns',
          toolPanel: 'agColumnsToolPanel',
          toolPanelParams: {
            suppressRowGroups: true,
            suppressValues: true,
            suppressPivots: true,
            suppressPivotMode: true,
            suppressSideButtons: true,
            suppressColumnFilter: true,
            suppressColumnSelectAll: true,
            suppressColumnExpandAll: true
          }
        }
      ],
      defaultToolPanel: 'columns'
    };

    this.cols = [
      {
        field: 'type',
        headerName: 'Type',
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true
      },
      {
        field: 'mediatype',
        headerName: 'Media Type'
      },
      {
        field: 'url',
        headerName: 'View',
        cellRenderer: function (params) {
          let keyData = params.data.url;
          let imgUrl = '';
          let newLink = '';
          switch (params.data.mediatype) {
            case 'NEWSPAPER':
              imgUrl = '../../../assets/newspaper.jpg';
              newLink = `<a href= ${keyData} target="_blank"><img src=${imgUrl} alt="Newspaper" style="height:30px;"></a>`;
              break;
            case 'RADIO':
              imgUrl = '../../../assets/radio.png';
              newLink = `<a href= ${keyData} target="_blank"><img src=${imgUrl} alt="Radio" style="height:30px;"></a>`;
              break;
            case 'MAGAZINE':
              imgUrl = '../../../assets/magazine.png';
              newLink = `<a href= ${keyData} target="_blank"><img src=${imgUrl} alt="Magazine" style="height:30px;"></a>`;
              break;
            case 'ONLINE':
              imgUrl = '../../../assets/online.png';
              newLink = `<a href= ${keyData} target="_blank"><img src=${imgUrl} alt="Online" style="height:30px;"></a>`;
              break;
            case 'ADVERTISING':
              imgUrl = '../../../assets/advertising.png';
              newLink = `<a href= ${keyData} target="_blank"><img src=${imgUrl} alt="Advertising" style="height:30px;"></a>`;
              break;
            case 'PODCAST':
              imgUrl = '../../../assets/podcast.png';
              newLink = `<a href= ${keyData} target="_blank"><img src=${imgUrl} alt="Podcast" style="height:30px;"></a>`;
              break;
            case 'TELEVISION':
              imgUrl = '../../../assets/television.png';
              newLink = `<a href= ${keyData} target="_blank"><img src=${imgUrl} alt="Television" style="height:30px"></a>`;
              break;
            case 'DIRECT MARKETING':
              imgUrl = '../../../assets/directmarketing.png';
              newLink = `<a href= ${keyData} target="_blank"><img src=${imgUrl} alt="Direct Marketing" style="height:30px;"></a>`;
              break;
            case 'MOBILE':
              imgUrl = '../../../assets/mobile.png';
              newLink = `<a href= ${keyData} target="_blank"><img src=${imgUrl} alt="Mobile" style="height:30px;"></a>`;
              break;
            case 'OUTDOOR':
              imgUrl = '../../../assets/outdoor.png';
              newLink = `<a href= ${keyData} target="_blank"><img src=${imgUrl} alt="Outdoor" style="height:30px;"></a>`;
              break;
            default:
              break;
          }
          return newLink;
        }
      },
      {
        field: 'sentiment',
        headerName: 'Sentiment'
      },
      {
        field: 'appearancedate',
        headerName: 'Appearance Date',
        filter: 'agDateColumnFilter',
        filterParams: {
          inRangeInclusive: true,
          comparator: (filterLocalDateAtMidnight, cellValue) => {
            const dateAsString = moment(cellValue).format('DD/MM/YYYY');
            if (dateAsString == null) {
              return -1;
            }
            const dateParts = dateAsString.split('/');
            const cellDate = new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));
            if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
              return 0;
            }
            if (cellDate < filterLocalDateAtMidnight) {
              return -1;
            }
            if (cellDate > filterLocalDateAtMidnight) {
              return 1;
            }
          }
        }
      },
      {
        field: 'created',
        headerName: 'Created'
      },
      {
        field: 'mediaowner',
        headerName: 'Media Owner'
      },
      {
        field: 'source',
        headerName: 'Source'
      },
      {
        field: 'sourcecategory',
        headerName: 'Source Category'
      },
      {
        field: 'brand',
        headerName: 'Brand'
      },
      {
        field: 'category',
        headerName: 'Category'
      },
      {
        field: 'subcategory',
        headerName: 'Sub Category'
      },
      {
        field: 'topic',
        headerName: 'Topic'
      },
      {
        field: 'headline',
        headerName: 'Headline'
      },
      {
        field: 'author',
        headerName: 'Author'
      },
      {
        field: 'page',
        headerName: 'Page'
      },
      {
        field: 'programme',
        headerName: 'Programme'
      },
      {
        field: 'language',
        headerName: 'Language'
      },
      {
        field: 'country',
        headerName: 'Country'
      },
      {
        field: 'region',
        headerName: 'Region'
      },
      {
        field: 'city',
        headerName: 'City'
      },
      {
        field: 'ratecard',
        headerName: 'Rate Card'
      },
      {
        field: 'circulation',
        headerName: 'Circulation'
      },
      {
        field: 'readership',
        headerName: 'Readership'
      },
      {
        field: 'lsm',
        headerName: 'LSM'
      },
      {
        field: 'sem',
        headerName: 'SEM'
      },
      {
        field: 'time',
        headerName: 'Time'
      },
      {
        field: 'duration',
        headerName: 'Duration'
      },
      {
        field: 'audience',
        headerName: 'Audience'
      },
      {
        field: 'dub',
        headerName: 'DUB'
      },
      {
        field: 'reach',
        headerName: 'Reach'
      },
      {
        field: 'authorid',
        headerName: 'Author ID'
      },
      {
        field: 'size',
        headerName: 'Size'
      },
      {
        field: 'advertisingtype',
        headerName: 'Advertising Type'
      },
      {
        field: 'product',
        headerName: 'Product'
      },
      {
        field: 'flightingcode',
        headerName: 'Flighting Code'
      }
    ];
  }

  onGridReady(params) {
    this.gridApi = params.api;
    const storeId = sessionStorage.getItem('storekeyId');
    this.getData(storeId);
  }

  getData(storeId) {
    if (this.itemField != undefined) {
      this.isPopup = true;
    } else {
      this.isPopup = false;
      this.data.changeReportName('Data');
      this.data.changeNav('Data');
    }

    this.sandbox = JSON.parse(sessionStorage.getItem('sandbox'));
    this.gridApi.closeToolPanel();

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

      this.loading = true;
      this.DataRows = userData as any;
      this.loading = false;
    });
  }

  setFilter(selection) {
    const months = [
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

    const filter = JSON.parse(sessionStorage.getItem('clientFilter'));
    const filtYear = new Date(filter.dateFrom).getFullYear();

    const gridFilter = {};

    gridFilter[this.itemField] = {
      type: 'equals',
      filter: selection[0].name
    };

    const mval: string = selection[0].series;

    if (this.itemCategory !== 'none') {
      if (
        this.itemCategory === 'appearancedate' &&
        !isNaN(selection[0].series) // date range
      ) {
        const startDate = this.getDateOfISOWeek(selection[0].series, filtYear);
        const endDate = this.addDays(startDate, 6);

        gridFilter[this.itemCategory] = {
          type: 'inRange',
          dateFrom: moment(startDate).format('YYYY-MM-DD'),
          dateTo: moment(endDate).format('YYYY-MM-DD')
        };
      } else if (months.includes(mval.toString().trim())) {
        // month name
        const monthNum = this.getMonthFromString(selection[0].series);
        const startDate = new Date(filtYear, monthNum - 1, 1);
        const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

        gridFilter[this.itemCategory] = {
          type: 'inRange',
          dateFrom: moment(startDate).format('YYYY-MM-DD'),
          dateTo: moment(endDate).format('YYYY-MM-DD')
        };
      } else {
        if (this.itemCategory === 'appearancedate') {
          gridFilter[this.itemCategory] = {
            type: 'inRange',
            dateFrom: moment(selection[0].series).format('YYYY-MM-DD'),
            dateTo: moment(selection[0].series).format('YYYY-MM-DD')
          };
        } else {
          gridFilter[this.itemCategory] = {
            type: 'equals',
            filter: selection[0].series
          };
        }
      }
    }

    this.gridApi.setFilterModel(gridFilter);
    this.gridApi.onFilterChanged();
  }

  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  getDateOfISOWeek(w, y) {
    const simple = new Date(y, 0, 1 + (w - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4) {
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    return ISOweekStart;
  }

  getMonthFromString(mon) {
    const d = Date.parse(mon + '1, 2012');
    if (!isNaN(d)) {
      return new Date(d).getMonth() + 1;
    }
    return -1;
  }

  removeFromAnalytics() {
    const currFilter = JSON.parse(sessionStorage.getItem('userFilter'));
    const rows = [];
    const rowSelection = this.gridApi.getSelectedRows();

    this.sandbox = this.sandbox || [];
    rowSelection.forEach((row) => {
      rows.push(row.id);
      this.sandbox.push({
        advertisingtype: row.advertisingtype,
        appearancedate: row.appearancedate,
        audience: row.audience,
        author: row.author,
        authorid: row.authorid,
        authorpic: row.authorpic,
        brand: row.brand,
        category: row.category,
        circulation: row.circulation,
        city: row.city,
        count: row.count,
        country: row.country,
        created: row.created,
        description: row.description,
        dub: row.dub,
        duration: row.duration,
        flightingcode: row.flightingcode,
        headline: row.headline,
        id: row.id,
        language: row.language,
        latitude: row.latitude,
        longitude: row.longitude,
        lsm: row.lsm,
        mediaowner: row.mediaowner,
        mediatype: row.mediatype,
        monthname: row.monthname,
        page: row.page,
        product: row.product,
        programme: row.programme,
        ratecard: row.ratecard,
        reach: row.reach,
        readership: row.readership,
        region: row.region,
        sem: row.sem,
        sentiment: row.sentiment,
        size: row.size,
        source: row.source,
        sourcecategory: row.sourcecategory,
        subcategory: row.subcategory,
        time: row.time,
        topic: row.topic,
        type: row.type,
        view: row.view,
        weeknumber: row.weeknumber,
        workitemid: row.workitemid
      });
    });

    sessionStorage.setItem('sandbox', JSON.stringify(this.sandbox));
    this.data.changeSandboxCount(rowSelection.length);

    currFilter.exclude = rows;

    sessionStorage.setItem('userFilter', JSON.stringify(currFilter));
    this.data.changeFilters(true);
  }

  restoreAnalytics() {
    const currFilter = JSON.parse(sessionStorage.getItem('userFilter'));
    currFilter.exclude = [];
    sessionStorage.setItem('sandbox', JSON.stringify([]));
    sessionStorage.setItem('userFilter', JSON.stringify(currFilter));
    this.data.changeSandboxCount(0);
    this.data.changeFilters(true);
  }

  addToCircle() {}

  onCellClicked(event) {
    if (event.colDef.headerName == 'View')
      this.sharedService.createActivity(
        this.authService.userValue.id,
        7,
        null,
        event.data.workitemid,
        `type: ${event.data.view} url: ${event.data.url}`
      );
  }

  exportExcel() {
    const params = this.getParams();
    if (this.validateSelection(params)) {
      return;
    }
    this.gridApi.exportDataAsExcel(params);
  }

  save(id: {}) {
    this.cols.push(id);
    this.displayResourceDialog = false;
  }

  getParams() {
    return {
      allColumns: true,
      onlySelected: true
    };
  }

  validateSelection(params) {
    let message = '';
    const errorDiv = document.querySelector('.example-error');
    const messageDiv = errorDiv.querySelector('.message');

    if (params.onlySelected || params.onlySelectedAllPages) {
      message += params.onlySelected ? '' : 'onlySelectedAllPages';
      message += ' Please select row/s to export.';

      if (!this.gridApi.getSelectedNodes().length) {
        errorDiv.classList.remove('inactive');
        messageDiv.innerHTML = message;
        window.setTimeout(() => {
          errorDiv.classList.add('inactive');
          messageDiv.innerHTML = '';
        }, 2000);
        return true;
      }
    }
    return false;
  }

  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}
