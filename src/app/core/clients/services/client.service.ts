import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Client } from '../interfaces/client.interface';
import { Clients } from '../interfaces/clients.interface';
import { Countries } from '../interfaces/country.interface';
import { Subscriptions } from 'src/app/core/shared/interfaces/subscription.interface';
import { Types } from 'src/app/core/shared/interfaces/types.interface';
import { MediaTypes } from 'src/app/core/shared/interfaces/mediatypes.interface';
import { ClientModel } from '../../shared/models/client';

interface ClientsResult {
  data: Clients[];
}

interface ClientResult {
  data: Client[];
}

interface SubscriptionResult {
  data: Subscriptions[];
}

interface TypeResult {
  data: Types[];
}

interface CountryResult {
  data: Countries[];
}

interface MediaTypeResult {
  data: MediaTypes[];
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  constructor(private readonly http: HttpClient) {}

  createClient(client: ClientModel) {
    return this.http
      .post<any>(`${environment.apiUrl}/client`, {
        clientName: client.clientName,
        contactName: client.contactName,
        contactJobTitle: client.contactJobTitle,
        contactCompany: client.contactCompany,
        contactEmail: client.contactEmail,
        contactTelephone: client.contactTelephone,
        contactMobile: client.contactMobile,
        telephone: client.telephone,
        logo: client.logo
      })
      .pipe(
        map((newclient) => {
          return newclient;
        })
      );
  }

  updateClient(client: Client) {
    return this.http
      .put<any>(`${environment.apiUrl}/client`, {
        id: client.id,
        clientName: client.clientName,
        contactName: client.contactName,
        contactJobTitle: client.contactJobTitle,
        contactCompany: client.contactCompany,
        contactEmail: client.contactEmail,
        contactTelephone: client.contactTelephone,
        contactMobile: client.contactMobile,
        telephone: client.telephone,
        logo: client.logo
      })
      .pipe(
        map((newuser) => {
          return newuser.user;
        })
      );
  }

  public getClients(): Observable<Clients[]> {
    return this.http.get<ClientsResult>(`${environment.apiUrl}/client`).pipe(
      map((results: ClientsResult) => results.data),
      catchError(this.handleError)
    );
  }

  public getClient(id): Observable<Client[]> {
    return this.http.get<ClientResult>(`${environment.apiUrl}/client/${id}`).pipe(
      map((results: ClientResult) => results.data),
      catchError(this.handleError)
    );
  }

  public getClientTypes(id) {
    return this.http.get<TypeResult>(`${environment.apiUrl}/client/types/${id}`).pipe(
      map((results: TypeResult) => results.data),
      catchError(this.handleError)
    );
  }

  public getTypes() {
    return this.http.get<TypeResult>(`${environment.apiUrl}/shared/types`).pipe(
      map((results: TypeResult) => results.data),
      catchError(this.handleError)
    );
  }

  public getCountries() {
    return this.http.get<CountryResult>(`${environment.apiUrl}/shared/countries`).pipe(
      map((results: CountryResult) => results.data),
      catchError(this.handleError)
    );
  }

  public getSubscriptions() {
    return this.http.get<SubscriptionResult>(`${environment.apiUrl}/client/subscriptions`).pipe(
      map((results: SubscriptionResult) => results.data),
      catchError(this.handleError)
    );
  }

  public getMediaTypesByType(typeId) {
    return this.http.get<MediaTypeResult>(`${environment.apiUrl}/client/mediatypes/${typeId}`).pipe(
      map((results: MediaTypeResult) => results.data),
      catchError(this.handleError)
    );
  }

  assignClientToType(typeData: any) {
    return this.http.post<any>(`${environment.apiUrl}/client/clienttype`, typeData).pipe(
      map((newuser) => {
        return newuser;
      })
    );
  }

  assignClientToCountry(clientId: number, countries: any) {
    return this.http.post<any>(`${environment.apiUrl}/client/clientcountry/${clientId}`, countries).pipe(
      map((newuser) => {
        return newuser;
      })
    );
  }

  removeNodeFromClient(clientId: number, nodeData: any) {
    return this.http.post<any>(`${environment.apiUrl}/client/removeclientnode/${clientId}`, nodeData).pipe(
      map((newuser) => {
        return newuser;
      })
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
