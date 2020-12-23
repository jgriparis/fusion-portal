import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AdvertisingTypes } from '../interfaces/advertisingtypes.interface';
import { Brands } from '../interfaces/brands.interface';
import { Categories } from '../interfaces/categories.interface';
import { FileResult } from '../interfaces/files.interface';
import { MediaTypes } from '../interfaces/mediatypes.interface';
import { SubCategories } from '../interfaces/subcategories.interface';
import { Topics } from '../interfaces/topics.interface';
import { Types } from '../interfaces/types.interface';
import { UserActivityModel } from '../models/useractivity';

interface TypeResult {
  data: Types[];
}

interface MediaTypeResult {
  data: MediaTypes[];
}

interface AdvertisingTypeResult {
  data: AdvertisingTypes[];
}

interface BrandResult {
  data: Brands[];
}

interface CategoryResult {
  data: Categories[];
}

interface SubCategoryResult {
  data: SubCategories[];
}

interface TopicResult {
  data: Topics[];
}

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  userActivity = new UserActivityModel();

  constructor(private readonly http: HttpClient) {}

  createActivity(userId: number, activityId: number, clientId?: number, workitemId?: string, notes?: string) {
    this.userActivity.userId = userId;
    this.userActivity.activityId = activityId;
    this.userActivity.clientId = clientId;
    this.userActivity.workitemId = workitemId;
    this.userActivity.notes = notes;
    this.sendUserActivity(this.userActivity).subscribe();
  }

  public sendUserActivity(userActivity: UserActivityModel) {
    return this.http
      .post<any>(`${environment.apiUrl}/users/useractivity/${userActivity.userId}`, {
        activityId: userActivity.activityId,
        clientId: userActivity.clientId,
        workitemId: userActivity.workitemId,
        notes: userActivity.notes
      })
      .pipe(
        map((newuser) => {
          return newuser;
        })
      );
  }

  public getTypes() {
    return this.http.get<TypeResult>(`${environment.apiUrl}/shared/types`).pipe(
      map((results: TypeResult) => results.data),
      catchError(this.handleError)
    );
  }

  public getMediaTypes() {
    return this.http.get<MediaTypeResult>(`${environment.apiUrl}/shared/mediatypes`).pipe(
      map((results: MediaTypeResult) => results.data),
      catchError(this.handleError)
    );
  }

  public getAdvertisingTypes() {
    return this.http.get<AdvertisingTypeResult>(`${environment.apiUrl}/shared/advertisingtypes`).pipe(
      map((results: AdvertisingTypeResult) => results.data),
      catchError(this.handleError)
    );
  }

  public getBrands() {
    return this.http.get<BrandResult>(`${environment.apiUrl}/shared/brands`).pipe(
      map((results: BrandResult) => results.data),
      catchError(this.handleError)
    );
  }

  public getCategories() {
    return this.http.get<CategoryResult>(`${environment.apiUrl}/shared/categories`).pipe(
      map((results: CategoryResult) => results.data),
      catchError(this.handleError)
    );
  }

  public getSubcategories() {
    return this.http.get<SubCategoryResult>(`${environment.apiUrl}/shared/subcategories`).pipe(
      map((results: SubCategoryResult) => results.data),
      catchError(this.handleError)
    );
  }

  public getTopics() {
    return this.http.get<TopicResult>(`${environment.apiUrl}/shared/topics`).pipe(
      map((results: TopicResult) => results.data),
      catchError(this.handleError)
    );
  }

  uploadImage(data: FormData): Observable<any> {
    const headers = new HttpHeaders();

    headers.append('Content-Type', 'multipart/form-data');
    const httpOptions = { headers };

    return this.http.post<any>(`${environment.apiUrl}/shared/upload`, data, httpOptions);
  }

  getImage(fileName: string): Observable<Blob> {
    return this.http.get<Blob>(`${environment.apiUrl}/shared/file/${fileName}`, {
      observe: 'body',
      responseType: 'blob' as 'json'
    });
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
