export type AuthUserType = 'customer' | 'provider';

export type AuthTabLabel = 'INICIO DE SESIÓN' | 'REGISTRO';

export type AuthPanelVariant = 'b2b-hero' | 'constellation' | 'features' | 'success';

export type AuthFeatureIconId = 'chat' | 'quote' | 'verified';

export interface AuthFeatureItem {
  id: AuthFeatureIconId;
  text: string;
  /** Prepared slot route for exported Adobe Illustrator SVG icon. */
  assetPath: string;
}

export interface AuthTopActionConfig {
  prompt: string;
  ctaLabel: string;
  route: string;
}

export interface AuthLoginPageConfig {
  userType: AuthUserType;
  heading: string;
  subtitle: string;
  identifierLabel: string;
  identifierPlaceholder: string;
  identifierInputType: 'text' | 'email';
  callbackPath: string;
  redirectAfterSuccess: string;
}

export type OAuthProviderStrategy = 'oauth_google' | 'oauth_linkedin_oidc';

export type ProviderRegisterStep = 1 | 2 | 3 | 4;

export type AuthStepStatus = 'completed' | 'active' | 'upcoming';

export interface AuthStepDefinition {
  step: ProviderRegisterStep;
  caption: string;
  label: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Commercial profile data for a provider onboarding request.
 * Kept strictly separated from Clerk identity storage so Clerk is not used as a business database.
 */
export interface ProviderCommercialProfile {
  phone: string;
  acceptedTerms: boolean;
  fullName: string;
  ruc: string;
  companyEmail: string;
  industry: string;
  specialty: string;
  clerkUserId?: string | null;
  submittedAt?: string;
}

export interface ProviderRegistrationDraft extends ProviderCommercialProfile {
  currentStep: ProviderRegisterStep;
  oauthAuthenticated: boolean;
  emailVerified: boolean;
}

export interface ClerkRuntimeConfig {
  publishableKey: string;
}

export interface AuthSessionUser {
  id: string;
  emailAddress: string | null;
  firstName: string | null;
  lastName: string | null;
  userType: AuthUserType;
}

export type AuthFlowStatus =
  'complete' | 'needs_email_verification' | 'needs_second_factor' | 'reset_code_sent';

export interface AuthActionResult {
  ok: boolean;
  status?: AuthFlowStatus;
  errorMessage?: string;
}
