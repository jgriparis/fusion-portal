import { Component } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { DataService } from 'src/app/core/shared/services/data.service';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import { Module } from '@ag-grid-community/core';

@Component({
  selector: 'app-sandbox',
  templateUrl: './sandbox.component.html',
  styleUrls: ['./sandbox.component.css']
})
export class SandboxComponent {
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

  private gridApi;
  private gridColumnApi;

  public modules: Module[] = [
    ClientSideRowModelModule,
    RowGroupingModule,
    MenuModule,
    SetFilterModule,
    ColumnsToolPanelModule,
    ExcelExportModule
  ];

  constructor(private data: DataService) {
    this.defaultColDef = {
      flex: 1,
      minWidth: 150,
      enableValue: false,
      enableRowGroup: false,
      enablePivot: false,
      sortable: true
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

    this.data.changeReportName('Data Sandbox');
    this.data.changeNav('DataSandbox');

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
        field: 'sentiment',
        headerName: 'Sentiment'
      },
      {
        field: 'appearancedate',
        headerName: 'Appearance Date'
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
    this.gridColumnApi = params.columnApi;
    this.getData();
  }

  getData() {
    this.gridApi.closeToolPanel();
    const sandboxData = JSON.parse(sessionStorage.getItem('sandbox'));
    this.DataRows = sandboxData as any;
  }

  restoreToAnalytics() {
    const currFilter = JSON.parse(sessionStorage.getItem('userFilter'));
    const sandboxData = JSON.parse(sessionStorage.getItem('sandbox'));
    const filtExcl = currFilter.exclude;
    const rowSelection = this.gridApi.getSelectedRows();
    rowSelection.forEach((row) => {
      Object.keys(filtExcl).forEach((key, index) => {
        if (filtExcl[key] === row.id) {
          filtExcl.splice(index, 1);
        }
      });

      sandboxData.forEach((sb, index) => {
        if (sb.id === row.id) {
          sandboxData.splice(index, 1);
        }
      });
    });
    sessionStorage.setItem('sandbox', JSON.stringify(sandboxData));
    sessionStorage.setItem('userFilter', JSON.stringify(currFilter));
    this.data.changeFilters(true);

    this.data.changeSandboxCount(rowSelection.length);

    this.getData();
  }

  exportExcel() {
    this.gridApi.exportDataAsExcel();
  }

  save(id: {}) {
    this.cols.push(id);
    this.displayResourceDialog = false;
  }
}
