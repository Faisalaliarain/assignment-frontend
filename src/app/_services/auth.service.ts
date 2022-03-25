import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const AUTH_API = 'http://localhost:3000/api/v1/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  login(credentials): Observable<any> {
    return this.http.post(AUTH_API + 'user/login', {
      email: credentials.email,
      password: credentials.password
    }, httpOptions);
  }
  users(): Observable<any> {
    return this.http.get(AUTH_API + 'user/all');
  }
  searchUser(username): Observable<any> {
    return this.http.post(AUTH_API + 'user/search', {text: username}, httpOptions);
  }


  register(user): Observable<any> {
    return this.http.post(AUTH_API + 'user/register', {
      firstName: user.firstname,
      lastName: user.lastname,
      email: user.email,
      password: user.password
    }, httpOptions);
  }
}
