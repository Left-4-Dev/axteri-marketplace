import { DOCUMENT } from '@angular/core';
import { Injectable, inject, signal } from '@angular/core';
import {
  ProviderCommercialProfile,
  ProviderRegisterStep,
  ProviderRegistrationDraft,
} from '../models/auth.model';

const DRAFT_STORAGE_KEY = 'axteri.auth.providerDraft';
const COMPLETED_STORAGE_KEY = 'axteri.auth.providerProfile';

const INITIAL_DRAFT: ProviderRegistrationDraft = {
  currentStep: 1,
  phone: '',
  acceptedTerms: false,
  fullName: '',
  ruc: '',
  companyEmail: '',
  industry: '',
  specialty: '',
  oauthAuthenticated: false,
  emailVerified: false,
};

/**
 * Provisional commercial profile store for provider onboarding.
 *
 * Architectural separation:
 * - Clerk manages ONLY authentication/identity (email, password, OAuth, session).
 * - Business/commercial attributes (phone, RUC, companyEmail, industry, specialty)
 *   live in this dedicated boundary and will be sent to the Axteri backend API in production.
 */
@Injectable({ providedIn: 'root' })
export class ProviderRegistrationStore {
  private readonly document = inject(DOCUMENT);

  readonly draft = signal<ProviderRegistrationDraft>(this.readDraft());
  readonly submittedProfile = signal<ProviderCommercialProfile | null>(this.readSubmittedProfile());

  updateStep1(data: { phone: string; acceptedTerms: boolean }): void {
    this.patchDraft({
      phone: data.phone.trim(),
      acceptedTerms: data.acceptedTerms,
      currentStep: 2,
    });
  }

  markOAuthInitiated(data: { phone: string; acceptedTerms: boolean }): void {
    this.patchDraft({
      phone: data.phone.trim(),
      acceptedTerms: data.acceptedTerms,
    });
  }

  applyOAuthProfile(data: { fullName?: string | null; emailAddress?: string | null }): void {
    const current = this.draft();
    this.patchDraft({
      fullName: current.fullName || (data.fullName?.trim() ?? ''),
      companyEmail: current.companyEmail || (data.emailAddress?.trim() ?? ''),
      oauthAuthenticated: true,
      emailVerified: true,
      currentStep: current.currentStep < 2 ? 2 : current.currentStep,
    });
  }

  updateStep2(data: {
    fullName: string;
    ruc: string;
    companyEmail: string;
    emailVerified: boolean;
  }): void {
    this.patchDraft({
      fullName: data.fullName.trim(),
      ruc: data.ruc.trim(),
      companyEmail: data.companyEmail.trim(),
      emailVerified: data.emailVerified,
      currentStep: data.emailVerified ? 3 : 2,
    });
  }

  markEmailVerified(): void {
    this.patchDraft({
      emailVerified: true,
      currentStep: 3,
    });
  }

  completeRegistration(data: {
    industry: string;
    specialty: string;
    clerkUserId?: string | null;
  }): ProviderCommercialProfile {
    const updatedDraft: ProviderRegistrationDraft = {
      ...this.draft(),
      industry: data.industry,
      specialty: data.specialty,
      currentStep: 4,
    };
    this.draft.set(updatedDraft);
    this.writeStorage(DRAFT_STORAGE_KEY, updatedDraft);

    const profile: ProviderCommercialProfile = {
      phone: updatedDraft.phone,
      acceptedTerms: updatedDraft.acceptedTerms,
      fullName: updatedDraft.fullName,
      ruc: updatedDraft.ruc,
      companyEmail: updatedDraft.companyEmail,
      industry: updatedDraft.industry,
      specialty: updatedDraft.specialty,
      clerkUserId: data.clerkUserId ?? null,
      submittedAt: new Date().toISOString(),
    };
    this.submittedProfile.set(profile);
    this.writeStorage(COMPLETED_STORAGE_KEY, profile);
    return profile;
  }

  goToStep(step: ProviderRegisterStep): void {
    this.patchDraft({ currentStep: step });
  }

  resetDraft(): void {
    this.draft.set({ ...INITIAL_DRAFT });
    this.removeStorage(DRAFT_STORAGE_KEY);
  }

  private patchDraft(partial: Partial<ProviderRegistrationDraft>): void {
    const next: ProviderRegistrationDraft = {
      ...this.draft(),
      ...partial,
    };
    this.draft.set(next);
    this.writeStorage(DRAFT_STORAGE_KEY, next);
  }

  private readDraft(): ProviderRegistrationDraft {
    const raw = this.readStorage<Partial<ProviderRegistrationDraft>>(DRAFT_STORAGE_KEY);
    if (!raw) return { ...INITIAL_DRAFT };
    return {
      ...INITIAL_DRAFT,
      ...raw,
    };
  }

  private readSubmittedProfile(): ProviderCommercialProfile | null {
    return this.readStorage<ProviderCommercialProfile>(COMPLETED_STORAGE_KEY);
  }

  private readStorage<T>(key: string): T | null {
    try {
      const storage = this.document.defaultView?.sessionStorage;
      if (!storage) return null;
      const item = storage.getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    } catch {
      return null;
    }
  }

  private writeStorage(key: string, value: unknown): void {
    try {
      this.document.defaultView?.sessionStorage?.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage quota or private mode restrictions.
    }
  }

  private removeStorage(key: string): void {
    try {
      this.document.defaultView?.sessionStorage?.removeItem(key);
    } catch {
      // Ignore storage restrictions.
    }
  }
}
