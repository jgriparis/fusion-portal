import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routes } from './portal.routing';

import { AppComponent } from './app.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import * as echarts from 'echarts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';
import { NgZorroAntdModule } from './ng-zorro-antd.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';

import { registerLocaleData } from '@angular/common';

import en from '@angular/common/locales/en';
registerLocaleData(en);
import { NZ_ICONS } from 'ng-zorro-antd/icon';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { IconDefinition } from '@ant-design/icons-angular';
import * as AllIcons from '@ant-design/icons-angular/icons';

import { AgGridModule } from '@ag-grid-community/angular';
import { HighchartsChartModule } from 'highcharts-angular';
import {
  AdverttypeComponent,
  AuthorsComponent,
  BrandComponent,
  CategoryComponent,
  DashboardComponent,
  DatachartComponent,
  LanguageComponent,
  LsmsemComponent,
  MapsComponent,
  MediatypeComponent,
  RatecardComponent,
  RegionComponent,
  ReputationalComponent,
  SandboxComponent,
  SentimentComponent,
  SourceComponent,
  SpokespersonsComponent,
  VolumeComponent,
  WordsComponent
} from './analytics/components';
import { LoginComponent } from './core/users/login/login.component';
import { ClientComponent } from './core/clients/components/client/client.component';
import { AddCountryComponent } from './core/clients/components/add-country/add-country.component';
import { ClientHeaderComponent } from './core/clients/components/client-header/client-header.component';
import { UserHeaderComponent } from './core/users/user-header/user-header.component';
import { UserComponent } from './core/users/user/user.component';
import { FilterComponent } from './core/shared/components/filter/filter.component';
import { SidenavComponent } from './core/shared/components/sidenav/sidenav.component';
import { DataService } from './core/shared/services/data.service';
import { LayoutComponent } from './core/shared/components/layout/layout.component';
import { HeaderComponent } from './core/shared/components/header/header.component';
import { ClientTypeComponent } from './core/clients/components/client-type/client-type.component';

const antDesignIcons = AllIcons as {
  [key: string]: IconDefinition;
};
const icons: IconDefinition[] = Object.keys(antDesignIcons).map((key) => antDesignIcons[key]);

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    HeaderComponent,
    FilterComponent,
    SidenavComponent,
    MediatypeComponent,
    DatachartComponent,
    SourceComponent,
    RegionComponent,
    CategoryComponent,
    LanguageComponent,
    LsmsemComponent,
    RatecardComponent,
    VolumeComponent,
    MapsComponent,
    SentimentComponent,
    SpokespersonsComponent,
    ReputationalComponent,
    AuthorsComponent,
    WordsComponent,
    DashboardComponent,
    LoginComponent,
    BrandComponent,
    AdverttypeComponent,
    SandboxComponent,
    ClientComponent,
    AddCountryComponent,
    ClientHeaderComponent,
    UserComponent,
    UserHeaderComponent,
    ClientTypeComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AngularMultiSelectModule,
    FormsModule,
    RouterModule,
    HttpClientModule,
    RouterModule.forRoot(routes, {
      paramsInheritanceStrategy: 'always',
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
      onSameUrlNavigation: 'reload',
      enableTracing: false
    }),
    NgxEchartsModule.forRoot({
      echarts
    }),
    BrowserAnimationsModule,
    ClarityModule,
    NgZorroAntdModule,
    AgGridModule.withComponents([]),
    HighchartsChartModule,
    NgxSpinnerModule
  ],
  providers: [DataService, { provide: NZ_I18N, useValue: en_US }, { provide: NZ_ICONS, useValue: icons }],
  bootstrap: [AppComponent],
  exports: [LayoutComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
