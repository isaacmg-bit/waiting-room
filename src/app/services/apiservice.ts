import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);

  get<T>(url: string): Observable<T> {
    return this.http.get<T>(url);
  }

  post<T, B = unknown>(url: string, body: B): Observable<T> {
    return this.http.post<T>(url, body);
  }

  put<T, B = unknown>(url: string, body: B): Observable<T> {
    return this.http.put<T>(url, body);
  }

  patch<T, B = unknown>(url: string, body: B): Observable<T> {
    return this.http.patch<T>(url, body);
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(url);
  }
}
