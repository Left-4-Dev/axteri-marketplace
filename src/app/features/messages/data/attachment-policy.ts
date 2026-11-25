import { InjectionToken } from '@angular/core';

export interface AttachmentPolicy {
  readonly maxFiles: number;
  readonly maxBytes: number;
  readonly formats: Readonly<Record<string, string>>;
}

export const ATTACHMENT_POLICY = new InjectionToken<AttachmentPolicy>(
  'messages attachment policy',
  {
    providedIn: 'root',
    factory: () => ({
      maxFiles: 5,
      maxBytes: 10 * 1024 * 1024,
      formats: {
        'application/pdf': 'PDF',
        'image/jpeg': 'JPEG',
        'image/png': 'PNG',
        'image/webp': 'WEBP',
      },
    }),
  },
);
