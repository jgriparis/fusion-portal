import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { DataService } from 'src/app/core/shared/services/data.service';
import { first } from 'rxjs/operators';
import * as moment from 'moment';
import { UserService } from 'src/app/core/users/user.service';
import { ClientService } from 'src/app/core/clients/services/client.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user';
import { SharedService } from '../../services/shared.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  subscription: Subscription;
  navCollapsed: boolean;
  headerHidden: boolean;
  userPackage: string;
  isSuperUser: boolean;
  navHidden: boolean;
  clientHidden: boolean;
  closeHidden: boolean;
  loading = false;
  user: User;
  userFromApi: User;
  singledropdownSettings = {};
  listOfClient = [];
  selectedClient = [];
  userDetail: string;

  constructor(
    private data: DataService,
    private router: Router,
    private userService: UserService,
    private readonly clientService: ClientService,
    private readonly sharedService: SharedService,
    private authenticationService: AuthService
  ) {
    this.user = this.authenticationService.userValue;

    this.subscription = this.data
      .getNav()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((nav) => {
        this.setLayout();
      });
    this.setLayout();
  }

  setLayout() {
    switch (this.router.url) {
      case '/portal/dashboard':
        this.clientHidden = false;
        this.navCollapsed = true;
        this.headerHidden = true;
        this.navHidden = true;
        this.closeHidden = false;
        break;
      case '/portal/users':
        this.clientHidden = true;
        this.navCollapsed = true;
        this.headerHidden = true;
        this.navHidden = false;
        this.closeHidden = true;
        break;
      case '/portal/client':
        this.clientHidden = true;
        this.navCollapsed = true;
        this.headerHidden = true;
        this.navHidden = false;
        this.closeHidden = true;
        break;
      case '/portal/sandbox':
        this.clientHidden = false;
        this.navCollapsed = false;
        this.headerHidden = true;
        this.navHidden = false;
        this.closeHidden = true;
        break;

      default:
        this.clientHidden = false;
        this.navCollapsed = false;
        this.headerHidden = false;
        this.navHidden = false;
        this.closeHidden = true;
        break;
    }
  }

  get isAdmin() {
    return this.user.role == 'Admin';
  }

  ngOnInit(): void {
    this.singledropdownSettings = {
      singleSelection: true,
      primaryKey: 'item_id',
      labelKey: 'item_text',
      enableSearchFilter: true,
      maxHeight: 250,
      lazyLoading: true,
      text: 'Please select one'
    };

    this.userDetail = this.authenticationService.userValue.username;

    const currentUser = JSON.parse(sessionStorage.getItem('user'));

    const arrResult = [];
    const selResult = [];

    if (this.user.internal) {
      this.clientService
        .getClients()
        .pipe(takeUntil(this.ngDestroy$))
        .subscribe((res) => {
          res.forEach((d) => arrResult.push({ item_id: d.id, item_text: d.clientName }));
          selResult.push({ item_id: res[0].id, item_text: res[0].clientName });
          sessionStorage.setItem('clientId', res[0].id.toString());

          this.listOfClient = JSON.parse(JSON.stringify(arrResult));
          this.selectedClient = JSON.parse(JSON.stringify(selResult));
        });
    } else {
      this.userService
        .getById(currentUser.id)
        .pipe(takeUntil(this.ngDestroy$))
        .subscribe((res) => {
          res.user.clients.forEach((d) => arrResult.push({ item_id: d.id, item_text: d.clientName }));
          selResult.push({ item_id: res.user.clients[0].id, item_text: res.user.clients[0].clientName });
          sessionStorage.setItem('clientId', res.user.clients[0].id);

          this.listOfClient = JSON.parse(JSON.stringify(arrResult));
          this.selectedClient = JSON.parse(JSON.stringify(selResult));
        });
    }

    this.loading = true;
    this.userService
      .getById(this.user.id)
      .pipe(first())
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((user) => {
        this.loading = false;
        this.userFromApi = user;
      });
    this.setLayout();
  }

  getClient(event) {
    this.sharedService.createActivity(this.authenticationService.userValue.id, 7, null, null, event.item_text);
    this.authenticationService.getClientData(event.item_id);
    sessionStorage.setItem('clientId', event.item_id);
  }

  Logout(): void {
    sessionStorage.clear();
    this.authenticationService.logout();
  }

  UserManagement() {
    this.router.navigate(['/portal/users']);
  }

  ClientManagement() {
    this.router.navigate(['/portal/client']);
  }

  CloseDashboard(): void {
    this.data.changeNav('Volume');
    this.router.navigate(['/portal/volume']);
  }

  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}
