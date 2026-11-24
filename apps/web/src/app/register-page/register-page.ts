import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { register } from '../auth';
import { errorMessage } from '../problem';

const MIN_PASSWORD_LENGTH = 12;

@Component({
  selector: 'app-register-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './register-page.html',
})
export class RegisterPage {
  protected readonly minPasswordLength = MIN_PASSWORD_LENGTH;

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  // The e-mail address of the account just created.
  protected readonly registered = signal<string | null>(null);

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
    register({ email: this.email(), password: this.password() })
      .then((user) => {
        this.registered.set(user.email);
        this.password.set('');
      })
      .catch((error: unknown) => {
        // eslint-disable-next-line no-console -- the full error helps debugging
        console.error('Registration failed:', error);
        this.errorMessage.set(
          `Registration failed. ${errorMessage(error, 'Please try again later.')}`
        );
      })
      .finally(() => {
        this.submitting.set(false);
      });
  }
}
