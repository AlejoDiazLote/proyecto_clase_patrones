import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  AuthUser,
  LoginCredentials,
} from '../models/auth.models';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isBrowser: boolean;
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.currentUserSubject.next(this.loadUser());
    }
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((res) => {
          if (this.isBrowser) {
            localStorage.setItem(TOKEN_KEY, res.access_token);
            localStorage.setItem(USER_KEY, JSON.stringify(res.usuario));
          }
          this.currentUserSubject.next(res.usuario);
        }),
      );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem(TOKEN_KEY) : null;
  }

  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    return this.currentUser?.rol === role;
  }

  /** Maneja el callback de Google OAuth: guarda el token y obtiene el perfil del usuario */
  handleOAuthCallback(token: string): Observable<AuthUser> {
    if (this.isBrowser) {
      localStorage.setItem(TOKEN_KEY, token);
    }
    return this.http.get<any>(`${environment.apiUrl}/auth/me`).pipe(
      map(
        (res) =>
          ({
            id: res.id,
            nombre: res.nombre,
            correo: res.correo,
            rol: res.rol?.nombre ?? null,
          }) as AuthUser,
      ),
      tap((user) => {
        if (this.isBrowser) {
          localStorage.setItem(USER_KEY, JSON.stringify(user));
        }
        this.currentUserSubject.next(user);
      }),
    );
  }

  /** Redirige al endpoint de Google OAuth del backend */
  loginWithGoogle(): void {
    window.location.href = `${environment.apiUrl}/auth/google`;
  }

  private loadUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
