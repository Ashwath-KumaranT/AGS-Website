import { describe, expect, it } from 'vitest';
import { checkDeliveryForPostalCode } from './delivery';
import {
  addressSchema,
  cardBrand,
  formatCardNumber,
  formatExpiry,
  isExpired,
  isValidPostalForCountry,
  luhnCheck,
  paymentSchema,
  signUpSchema,
} from './validation';

const validAddress = {
  name: 'Ada Lovelace',
  phone: '+1 415 555 0100',
  line1: '1 Market St',
  line2: '',
  city: 'San Francisco',
  state: 'CA',
  postal_code: '94105',
  country: 'US',
};

describe('card helpers', () => {
  it('validates card numbers with Luhn', () => {
    expect(luhnCheck('4242 4242 4242 4242')).toBe(true);
    expect(luhnCheck('4242 4242 4242 4241')).toBe(false);
    expect(luhnCheck('1234')).toBe(false);
  });
  it('detects brands and formats input', () => {
    expect(cardBrand('5555 5555 5555 4444')).toBe('Mastercard');
    expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242');
    expect(formatExpiry('1230')).toBe('12/30');
  });
  it('treats a card as valid through the end of its expiry month', () => {
    expect(isExpired(6, 2026, new Date('2026-06-30T12:00:00'))).toBe(false);
    expect(isExpired(5, 2026, new Date('2026-06-01T12:00:00'))).toBe(true);
  });
  it('rejects bad payment forms', () => {
    const r = paymentSchema.safeParse({
      number: '4242 4242 4242 4241',
      name: 'A',
      expiry: '13/30',
      cvc: '1',
    });
    expect(r.success).toBe(false);
    const paths = r.success ? [] : r.error.issues.map((i) => i.path[0]);
    expect(paths).toEqual(expect.arrayContaining(['number', 'name', 'expiry', 'cvc']));
  });
});

describe('address validation', () => {
  it('accepts a complete address', () => {
    expect(addressSchema.safeParse(validAddress).success).toBe(true);
  });
  it('validates postal codes per country', () => {
    expect(isValidPostalForCountry('560001', 'IN')).toBe(true);
    expect(isValidPostalForCountry('5600', 'IN')).toBe(false);
    expect(isValidPostalForCountry('SW1A 1AA', 'GB')).toBe(true);
    const r = addressSchema.safeParse({ ...validAddress, postal_code: 'ABCDE' });
    expect(r.success).toBe(false);
  });
  it('requires a plausible phone number', () => {
    expect(addressSchema.safeParse({ ...validAddress, phone: '12' }).success).toBe(false);
  });
  it('flags unserviceable postal codes', () => {
    expect(checkDeliveryForPostalCode('10000').serviceable).toBe(false);
    expect(checkDeliveryForPostalCode('94105').serviceable).toBe(true);
  });
});

describe('sign-up validation', () => {
  it('requires matching, strong passwords', () => {
    const weak = signUpSchema.safeParse({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'password',
      confirmPassword: 'password',
    });
    expect(weak.success).toBe(false);
    const mismatch = signUpSchema.safeParse({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'Secret123',
      confirmPassword: 'Secret124',
    });
    expect(mismatch.success).toBe(false);
    const ok = signUpSchema.safeParse({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'Secret123',
      confirmPassword: 'Secret123',
    });
    expect(ok.success).toBe(true);
  });
});
