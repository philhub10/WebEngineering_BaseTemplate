import { Injectable, signal } from '@angular/core';
import type { Credentials, User } from './auth';
import { loadCurrentUser, login, logout } from './auth';

// Who is logged in, shared by the navigation and the login page.
// Only a mirror of the server's session: the API decides on every request.
@Injectable({ providedIn: 'root' })
export class AuthState {
  private readonly current = signal<User | null>(null);
  readonly user = this.current.asReadonly();

  async refresh(): Promise<void> {
    this.current.set(await loadCurrentUser());
  }

  async login(credentials: Credentials): Promise<User> {
    const user = await login(credentials);
    this.current.set(user);
    return user;
  }

  async logout(): Promise<void> {
    await logout();
    this.current.set(null);
  }
}
