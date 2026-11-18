import { booleanAttribute, ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { OAuthProviderStrategy } from '../../models/auth.model';

@Component({
  selector: 'app-auth-social-buttons',
  templateUrl: './auth-social-buttons.html',
  styleUrl: './auth-social-buttons.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthSocialButtons {
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly selectProvider = output<OAuthProviderStrategy>();

  protected onGoogleClick(): void {
    if (!this.disabled()) {
      this.selectProvider.emit('oauth_google');
    }
  }

  protected onLinkedInClick(): void {
    if (!this.disabled()) {
      this.selectProvider.emit('oauth_linkedin_oidc');
    }
  }
}
