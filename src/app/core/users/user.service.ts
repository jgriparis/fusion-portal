import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@environments/environment';
import { map } from 'rxjs/operators';
import { User } from '../shared/models/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<User[]>(`${environment.apiUrl}/users`);
  }

  getById(id: number) {
    return this.http.get<User>(`${environment.apiUrl}/users/${id}`);
  }

  createUser(user: User) {
    return this.http
      .post<any>(`${environment.apiUrl}/users`, {
        user: {
          username: user.username,
          password: user.password,
          first_name: user.firstName,
          last_name: user.lastName,
          role: user.role,
          enabled: user.enabled,
          internal: user.internal
        }
      })
      .pipe(
        map((newuser) => {
          return newuser.user;
        })
      );
  }

  updateUser(user: User) {
    return this.http
      .put<any>(`${environment.apiUrl}/users`, {
        user: {
          id: user.id,
          first_name: user.firstName,
          last_name: user.lastName,
          role: user.role,
          enabled: user.enabled,
          internal: user.internal
        }
      })
      .pipe(
        map((newuser) => {
          return newuser.user;
        })
      );
  }

  assignUserToClient(userId: number, clients: any) {
    return this.http.post<any>(`${environment.apiUrl}/users/userclient/${userId}`, clients).pipe(
      map((newuser) => {
        return newuser;
      })
    );
  }

  // removeClientFromUser(userId: number, clientId: number) {
  //   return this.http
  //     .post<any>(`${environment.apiUrl}/users/removeuserclient`, { userId, clientId })
  //     .pipe(
  //       map((newuser) => {
  //         return newuser;
  //       })
  //     );
  // }
}
