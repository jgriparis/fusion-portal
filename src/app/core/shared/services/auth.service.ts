import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user';
import { environment } from '@environments/environment';
import * as moment from 'moment';
const PouchDB = require('pouchdb').default;
import { DataService } from 'src/app/core/shared/services/data.service';
import { AnalyticsService } from 'src/app/analytics/services/analytics.service';
import { ClientService } from '../../clients/services/client.service';
import { UserService } from '../../users/user.service';
import { SharedService } from './shared.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject: BehaviorSubject<User>;
  public user: Observable<User>;
  pouchdb: any;

  constructor(
    private router: Router,
    private http: HttpClient,
    private data: DataService,
    private readonly clientService: ClientService,
    private userService: UserService,
    private readonly analyticsService: AnalyticsService,
    private readonly sharedService: SharedService
  ) {
    this.userSubject = new BehaviorSubject<User>(JSON.parse(sessionStorage.getItem('user')));
    this.user = this.userSubject.asObservable();
    this.pouchdb = new PouchDB('analysisStore');
  }

  public get userValue(): User {
    return this.userSubject.value;
  }

  login(username: string, password: string) {
    return this.http
      .post<any>(`${environment.apiUrl}/users/authenticate`, { user: { username, password } })
      .pipe(
        map((user) => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          this.sharedService.createActivity(user.user.id, 1);

          this.userService.getById(user.user.id).subscribe((res) => {
            this.getClientData(res.user.clients[0].id);
          });

          sessionStorage.setItem('user', JSON.stringify(user.user));
          this.userSubject.next(user.user);
          return user.user;
        })
      );
  }

  getClientData(clientId) {
    const dataFilter = JSON.parse(sessionStorage.getItem('clientFilter'));

    this.clientService.getClient(clientId).subscribe((res) => {
      const aTypes = [];
      const aCountries = [];
      const aMediaTypes = [];
      const aBrands = [];
      const aCategories = [];
      const aSubCategories = [];
      const aTopics = [];

      res[0].clienttypes.forEach((d) => {
        aTypes.push(d.type.typeName);

        d.clientcountries.forEach((c) => {
          aCountries.push(c.country.countryName);

          c.clientmediatypes.forEach((m) => {
            aMediaTypes.push(m.mediatype.mediatypeName);
          });

          c.clientbrands.forEach((m) => {
            aBrands.push(m.brand.brandName);
          });

          c.clientcategories.forEach((m) => {
            aCategories.push(m.category.categoryName);
          });

          c.clientsubcategories.forEach((m) => {
            aSubCategories.push(m.subcategory.subcategoryName);
          });

          c.clienttopics.forEach((m) => {
            aTopics.push(m.topic.topicName);
          });

          sessionStorage.setItem('clientSubscription', c.clientsubscriptions[0].subscription.subscriptionName);
        });
      });
      dataFilter.type = aTypes;
      dataFilter.country = aCountries;
      dataFilter.mediatype = aMediaTypes;
      dataFilter.brand = aBrands;
      dataFilter.category = aCategories;
      dataFilter.subcategory = aSubCategories;
      dataFilter.topic = aTopics;

      sessionStorage.setItem('clientFilter', JSON.stringify(dataFilter));

      this.analyticsService.getData(dataFilter).subscribe((res) => {
        const storekey = new Date().toISOString();
        this.pouchdb.put({ _id: storekey, data: res });
        sessionStorage.setItem('storekeyId', storekey);
        this.data.ChangeDate(storekey);
      });
    });
  }

  logout() {
    // remove user from local storage to log user out
    this.sharedService.createActivity(this.userValue.id, 2);
    sessionStorage.removeItem('user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }
}
