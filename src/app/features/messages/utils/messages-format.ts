const ES_PE_LOCALE = 'es-PE';
const LIMA_TIMEZONE = 'America/Lima';

const timeFormatter = new Intl.DateTimeFormat(ES_PE_LOCALE, {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: LIMA_TIMEZONE,
});

const shortDateFormatter = new Intl.DateTimeFormat(ES_PE_LOCALE, {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
  timeZone: LIMA_TIMEZONE,
});

const fullDateFormatter = new Intl.DateTimeFormat(ES_PE_LOCALE, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: LIMA_TIMEZONE,
});

const dayKeyPartsFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: LIMA_TIMEZONE,
});

const quantityFormatter = new Intl.NumberFormat(ES_PE_LOCALE, {
  maximumFractionDigits: 0,
});

const penCurrencyFormatter = new Intl.NumberFormat(ES_PE_LOCALE, {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function getDateKey(isoDate: string): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }
  return dayKeyPartsFormatter.format(parsed);
}

function getPreviousDateKey(referenceNow: Date): string {
  const yesterday = new Date(referenceNow.getTime() - 24 * 60 * 60 * 1000);
  return dayKeyPartsFormatter.format(yesterday);
}

export function formatMessageTime(isoDate: string): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }
  return timeFormatter.format(parsed);
}

export function formatConversationTimestamp(
  isoDate: string,
  referenceNow: Date = new Date(),
): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  const targetKey = getDateKey(isoDate);
  const todayKey = dayKeyPartsFormatter.format(referenceNow);

  if (targetKey === todayKey) {
    return timeFormatter.format(parsed);
  }

  if (targetKey === getPreviousDateKey(referenceNow)) {
    return 'Ayer';
  }

  return shortDateFormatter.format(parsed);
}

export function formatDateSeparator(isoDate: string, referenceNow: Date = new Date()): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  const targetKey = getDateKey(isoDate);
  const todayKey = dayKeyPartsFormatter.format(referenceNow);

  if (targetKey === todayKey) {
    return 'Hoy';
  }

  if (targetKey === getPreviousDateKey(referenceNow)) {
    return 'Ayer';
  }

  return fullDateFormatter.format(parsed);
}

export function formatCurrencyEsPe(amount: number, currency: 'PEN' | 'USD' = 'PEN'): string {
  if (currency === 'PEN') {
    return penCurrencyFormatter.format(amount);
  }
  return new Intl.NumberFormat(ES_PE_LOCALE, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatQuantityEsPe(quantity: number): string {
  return quantityFormatter.format(quantity);
}
