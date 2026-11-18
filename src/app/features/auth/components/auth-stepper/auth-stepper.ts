import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PROVIDER_REGISTER_STEPS } from '../../data/provider-register.data';
import { AuthStepDefinition, AuthStepStatus, ProviderRegisterStep } from '../../models/auth.model';

@Component({
  selector: 'app-auth-stepper',
  templateUrl: './auth-stepper.html',
  styleUrl: './auth-stepper.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthStepper {
  readonly currentStep = input.required<ProviderRegisterStep>();
  readonly steps = input<readonly AuthStepDefinition[]>(PROVIDER_REGISTER_STEPS);

  stepStatus(step: ProviderRegisterStep): AuthStepStatus {
    const active = this.currentStep();
    if (step < active) {
      return 'completed';
    }
    if (step === active) {
      return 'active';
    }
    return 'upcoming';
  }
}
