import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AuthFeatureIconId,
  AuthFeatureItem,
  AuthPanelVariant,
  AuthTabLabel,
  AuthTopActionConfig,
} from '../../models/auth.model';

export const AUTH_PANEL_BACKGROUND_ASSET = '/assets/backgrounds/auth/auth-panel-background.webp';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterLink],
  templateUrl: './auth-layout.html',
  styleUrls: ['./auth-layout.scss', './auth-layout-artwork.scss', './auth-layout-responsive.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayout {
  readonly tabLabel = input.required<AuthTabLabel>();
  readonly panelVariant = input.required<AuthPanelVariant>();
  readonly features = input<readonly AuthFeatureItem[]>([]);
  readonly topAction = input<AuthTopActionConfig | null>(null);
  readonly topActionMobileOnly = input(false);

  protected readonly backgroundAssetPath = AUTH_PANEL_BACKGROUND_ASSET;
  protected readonly backgroundAssetAvailable = signal(false);
  protected readonly loadedFeatureIcons = signal<Partial<Record<AuthFeatureIconId, boolean>>>({});

  protected onBackgroundLoad(): void {
    this.backgroundAssetAvailable.set(true);
  }

  protected onBackgroundError(): void {
    this.backgroundAssetAvailable.set(false);
  }

  protected onFeatureIconLoad(id: AuthFeatureIconId): void {
    this.loadedFeatureIcons.update((current) => ({ ...current, [id]: true }));
  }

  protected onFeatureIconError(id: AuthFeatureIconId): void {
    this.loadedFeatureIcons.update((current) => ({ ...current, [id]: false }));
  }
}
