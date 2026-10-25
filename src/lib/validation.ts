import { z } from 'zod';

export const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IN', name: 'India' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SG', name: 'Singapore' },
] as const;

const POSTAL_PATTERNS: Record<string, RegExp> = {
  US: /^\d{5}(-\d{4})?$/,
  CA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
  GB: /^[A-Za-z]{1,2}\d[A-Za-z\d]? ?\d[A-Za-z]{2}$/,
  IN: /^\d{6}$/,
  AU: /^\d{4}$/,
  DE: /^\d{5}$/,
  FR: /^\d{5}$/,
  AE: /^[A-Za-z0-9 -]{3,10}$/,
  SG: /^\d{6}$/,
};

export function isValidPostalForCountry(postal: string, country: string): boolean {
  const pattern = POSTAL_PATTERNS[country] ?? /^[A-Za-z0-9 -]{3,10}$/;
  return pattern.test(postal.trim());
}

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Use at least 8 characters')
  .regex(/[A-Za-z]/, 'Include at least one letter')
  .regex(/\d/, 'Include at least one number');

export const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Phone number is required')
  .refine((v) => {
    const digits = v.replace(/\D/g, '');
    return /^[+\d\s()-]+$/.test(v) && digits.length >= 7 && digits.length <= 15;
  }, 'Enter a valid phone number');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const signUpSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter your full name'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });
export type SignUpValues = z.infer<typeof signUpSchema>;

export const forgotPasswordSchema = z.object({ email: emailSchema });
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name'),
  phone: z
    .string()
    .trim()
    .refine((v) => v === '' || /^[+\d\s()-]{7,20}$/.test(v), 'Enter a valid phone number'),
});
export type ProfileValues = z.infer<typeof profileSchema>;

export const addressSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter the recipient name'),
    phone: phoneSchema,
    line1: z.string().trim().min(3, 'Enter your street address'),
    line2: z.string().trim().max(100),
    city: z.string().trim().min(2, 'Enter your city'),
    state: z.string().trim().min(2, 'Enter your state / region'),
    postal_code: z.string().trim().min(1, 'Enter your postal code'),
    country: z.string().min(2, 'Select a country'),
    is_default: z.boolean().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.postal_code && !isValidPostalForCountry(v.postal_code, v.country)) {
      ctx.addIssue({
        code: 'custom',
        path: ['postal_code'],
        message: 'Enter a valid postal code for the selected country',
      });
    }
  });
export type AddressValues = z.infer<typeof addressSchema>;

export const contactSchema = z.object({ email: emailSchema });

export function luhnCheck(num: string): boolean {
  const digits = num.replace(/\s+/g, '');
  if (!/^\d{12,19}$/.test(digits)) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let n = Number(digits[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function cardBrand(num: string): string {
  const d = num.replace(/\s+/g, '');
  if (/^4/.test(d)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(d)) return 'Mastercard';
  if (/^3[47]/.test(d)) return 'Amex';
  if (/^6(011|5)/.test(d)) return 'Discover';
  return 'Card';
}

export function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 19);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

export function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export function parseExpiry(value: string): { month: number; year: number } | null {
  const m = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!m) return null;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return null;
  return { month, year };
}

export function isExpired(month: number, year: number, now: Date = new Date()): boolean {
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);
  return endOfMonth.getTime() < now.getTime();
}

export const paymentSchema = z.object({
  number: z.string().refine(luhnCheck, 'Enter a valid card number'),
  name: z.string().trim().min(2, 'Enter the name on the card'),
  expiry: z.string().superRefine((v, ctx) => {
    const parsed = parseExpiry(v);
    if (!parsed) {
      ctx.addIssue({ code: 'custom', message: 'Use MM/YY' });
    } else if (isExpired(parsed.month, parsed.year)) {
      ctx.addIssue({ code: 'custom', message: 'This card has expired' });
    }
  }),
  cvc: z.string().regex(/^\d{3,4}$/, 'Enter the 3 or 4 digit code'),
});
export type PaymentValues = z.infer<typeof paymentSchema>;

export const reviewSchema = z.object({
  rating: z.number().min(1, 'Choose a rating').max(5),
  title: z.string().trim().min(3, 'Add a short title').max(80),
  body: z.string().trim().min(10, 'Tell us a little more (10+ characters)').max(1000),
});
export type ReviewValues = z.infer<typeof reviewSchema>;

export const returnSchema = z.object({
  type: z.enum(['return', 'refund']),
  reason: z.enum(['too_small', 'too_large', 'defective', 'not_as_described', 'changed_mind']),
  note: z.string().trim().max(500),
});
export type ReturnValues = z.infer<typeof returnSchema>;
