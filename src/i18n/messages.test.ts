import { describe, expect, it } from 'vitest';
import { TA, translateMessage } from './index';

describe('server / validation messages', () => {
  it('translates a coupon-expired reason and keeps the code', () => {
    const msg = 'Code EARLYBIRD25 has expired.';
    expect(translateMessage(msg, 'ta')).toBe('EARLYBIRD25 குறியீடு காலாவதியாகிவிட்டது.');
    expect(translateMessage(msg, 'en')).toBe(msg);
  });

  it('translates a minimum-spend coupon reason with amount and code', () => {
    const msg = 'Add ₹1,200 more to use SAVE500.';
    expect(translateMessage(msg, 'ta')).toBe(
      'SAVE500 குறியீட்டைப் பயன்படுத்த மேலும் ₹1,200 சேர்க்கவும்.',
    );
    expect(translateMessage(msg, 'en')).toBe(msg);
  });

  it('translates an "Only N left" stock issue', () => {
    const msg = 'Only 2 left of Merino Crewneck Sweater (Charcoal, M).';
    const ta = translateMessage(msg, 'ta');
    expect(ta).toContain('2 மட்டுமே மீதமுள்ளன');
    // product title and colour are translated too; the size code stays as-is
    expect(ta).toContain(TA['Merino Crewneck Sweater']);
    expect(ta).toContain(TA['Charcoal']);
    expect(ta).toContain(', M)');
    // an unknown product name keeps the whole sentence in English rather than mixing languages
    expect(translateMessage('Only 2 left of Some Product (Some Colour, M).', 'ta')).toBe(
      'Only 2 left of Some Product (Some Colour, M).',
    );
    expect(translateMessage(msg, 'en')).toBe(msg);
  });

  it('translates order notifications, including captured tracking labels', () => {
    expect(translateMessage('Order ASG-1042 confirmed', 'ta')).toBe(
      'ஆர்டர் ASG-1042 உறுதிசெய்யப்பட்டது',
    );
    expect(translateMessage('Order ASG-1042: Shipped with carrier', 'ta')).toBe(
      'ஆர்டர் ASG-1042: கூரியர் மூலம் அனுப்பப்பட்டது',
    );
    expect(translateMessage('Order ASG-1042 confirmed', 'en')).toBe('Order ASG-1042 confirmed');
  });

  it('translates exact validation and payment messages', () => {
    expect(translateMessage('Enter a valid card number', 'ta')).toBe(
      'சரியான அட்டை எண்ணை உள்ளிடவும்',
    );
    expect(translateMessage('Your card was declined.', 'ta')).toBe(
      'உங்கள் அட்டை நிராகரிக்கப்பட்டது.',
    );
    expect(translateMessage('Your card was declined.', 'en')).toBe('Your card was declined.');
  });
});
