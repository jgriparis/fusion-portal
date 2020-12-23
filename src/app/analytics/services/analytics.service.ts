import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Portal } from '../interfaces/portal.interface';
import { Cacheable } from 'ts-cacheable';
import { Analytics, AnalyticStack } from '../interfaces';
import { environment } from '@environments/environment';
import { Filters } from 'src/app/core/shared/interfaces';

interface PortalDataResults {
  data: Portal[];
}

interface AnalyticsResults {
  data: Analytics[];
}

interface AnalyticStackResults {
  data: AnalyticStack[];
}

interface FilterResults {
  data: Filters[];
}

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: 'my-auth-token'
  })
};

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  constructor(private readonly http: HttpClient) {}

  @Cacheable()
  public getData(strFilter) {
    return this.http.post<PortalDataResults>(`${environment.apiUrl}/analytics/getData`, strFilter).pipe(
      map((results: PortalDataResults) => results.data),
      catchError(this.handleError)
    );
  }

  public getAnalytics(strFilter, strGroupBy) {
    return this.http
      .post<AnalyticsResults>(`${environment.apiUrl}/analytics/getAnalytics/${strGroupBy}`, strFilter)
      .pipe(
        map((results: AnalyticsResults) => results.data),
        catchError(this.handleError)
      );
  }

  public getAnalyticStack(strFilter, strGroupBy, strStackBy) {
    return this.http
      .post<AnalyticStackResults>(
        `${environment.apiUrl}/analytics/getAnalyticStack/${strGroupBy}/${strStackBy}`,
        strFilter
      )
      .pipe(
        map((results: AnalyticStackResults) => results.data),
        catchError(this.handleError)
      );
  }

  public getFilter(strFilter, strFilterField) {
    return this.http.post<FilterResults>(`${environment.apiUrl}/analytics/getFilter/${strFilterField}`, strFilter).pipe(
      map((results: FilterResults) => results.data),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occuflip. Handle it accordingly
      console.error('An error occured:', error.error.message);
    } else {
      // The backend returned an unsuccessful respone code.
      // The response body may contain clues as to what was wrong
      console.log(`Backend returned code ${error.status}, body was: ${error.status}`);
    }
    // return an observable wuth a user-facing error message
    return throwError('Something bad happened; please try again later.');
  }
}
