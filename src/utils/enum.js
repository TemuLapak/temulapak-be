export const ROLES = Object.freeze({
  ADMIN: 'admin',
  MSME: 'msme',
  EO: 'eo'
});

export const ROLE_VALUES = Object.freeze(Object.values(ROLES));

export const MSME_CATEGORIES = Object.freeze([
  'food',
  'fashion',
  'services',
  'trade and retail',
  'agribusiness',
  'creative'
]);

export const VERIFICATION_TYPES = Object.freeze([
  'ktp',
  'nib',
  'npwp',
  'legalitas'
]);

export const PAYMENT_STATUSES = Object.freeze({
  PENDING: 'pending',
  PAID: 'paid',
  EXPIRED: 'expired',
  FAILED: 'failed',
  REFUNDED: 'refunded'
});

export const PAYMENT_STATUS_VALUES = Object.freeze(Object.values(PAYMENT_STATUSES));

export const EVENT_THEMES = Object.freeze([
  'culinary',
  'fashion',
  'craft',
  'technology',
  'agriculture',
  'creative_economy',
  'business',
  'general'
]);

export const REGISTRATION_STATUSES = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
});

export const REGISTRATION_STATUS_VALUES = Object.freeze(Object.values(REGISTRATION_STATUSES));