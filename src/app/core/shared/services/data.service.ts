import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class DataService {
  private radioSource = new Subject<any>();
  private navItem = new Subject<any>();
  private filters = new Subject<any>();
  private reportName = new Subject<any>();
  private modalVis = new Subject<any>();
  private resetFilt = new Subject<any>();
  private chartSelect = new Subject<any>();
  private userSelect = new Subject<any>();
  private sandboxCount = new Subject<any>();
  private countrySelect = new Subject<any>();
  private clientSelect = new Subject<any>();
  private dateSelect = new Subject<any>();
  private clientUpdate = new Subject<any>();

  constructor() {}

  changeRadio(radio: string) {
    this.radioSource.next(radio);
  }

  changeSandboxCount(val: number) {
    this.sandboxCount.next(val);
  }

  changeNav(nav: string) {
    this.navItem.next(nav);
  }

  changeFilters(filter: boolean) {
    this.filters.next(filter);
  }

  changeReportName(rpt: string) {
    this.reportName.next(rpt);
  }

  changeModalVisible(vis: boolean) {
    this.modalVis.next(vis);
  }

  resetFilters(rst: boolean) {
    this.resetFilt.next(rst);
  }

  ChangeChartSelection(val: any) {
    this.chartSelect.next(val);
  }

  ChangeCountrySelection(val: any) {
    this.countrySelect.next(val);
  }

  ChangeUserUpdated(val: any) {
    this.userSelect.next(val);
  }

  ChangeClientUpdated(val: any) {
    this.clientUpdate.next(val);
  }

  ChangeClient(val: any): void {
    this.clientSelect.next(val);
  }

  ChangeDate(val: any): void {
    this.dateSelect.next(val);
  }

  getChange(): Observable<any> {
    return this.radioSource.asObservable();
  }

  getNav(): Observable<any> {
    return this.navItem.asObservable();
  }

  getSandboxCount(): Observable<any> {
    return this.sandboxCount.asObservable();
  }

  getFilters(): Observable<any> {
    return this.filters.asObservable();
  }

  getReportName(): Observable<any> {
    return this.reportName.asObservable();
  }

  getModalVisible(): Observable<any> {
    return this.modalVis.asObservable();
  }

  getResetFilter(): Observable<any> {
    return this.resetFilt.asObservable();
  }

  getChartSelection(): Observable<any> {
    return this.chartSelect.asObservable();
  }

  getCountrySelection(): Observable<any> {
    return this.countrySelect.asObservable();
  }

  getUserUpdated(): Observable<any> {
    return this.userSelect.asObservable();
  }

  getClientUpdated(): Observable<any> {
    return this.clientUpdate.asObservable();
  }

  getClient(): Observable<any> {
    return this.clientSelect.asObservable();
  }

  getDateChange(): Observable<any> {
    return this.dateSelect.asObservable();
  }
}
