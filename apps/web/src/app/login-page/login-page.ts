import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthState } from '../auth-state';
import { errorMessage } from '../problem';

@Component({
  selector: 'app-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './login-page.html',
})
export class LoginPage {
  private readonly auth = inject(AuthState);
  private readonly router = inject(Router);

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected onEmailInput(event: Event): void {
    const { target } = event;
    if (!(target instanceof HTMLInputElement)) return;
    this.email.set(target.value);
  }

  protected onPasswordInput(event: Event): void {
    const { target } = event;
    if (!(target instanceof HTMLInputElement)) return;
    this.password.set(target.value);
  }

  protected onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    this.submitting.set(true);
    this.errorMessage.set(null);
    this.auth
      .login({ email: this.email(), password: this.password() })
      .then(async () => await this.router.navigateByUrl('/'))
      .catch((error: unknown) => {
        // eslint-disable-next-line no-console -- the full error helps debugging
        console.error('Login failed:', error);
        this.password.set('');
        this.errorMessage.set(
          `Login failed. ${errorMessage(error, 'Please try again later.')}`
        );
      })
      .finally(() => {
        this.submitting.set(false);
      });
  }
}
