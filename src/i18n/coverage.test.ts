import { describe, expect, it } from 'vitest';
import { TA, translate, translateMessage } from './index';

// raw source of every app file (tests and translation files excluded)
const SOURCES = import.meta.glob<string>(
  ['../**/*.{ts,tsx}', '!../**/*.test.{ts,tsx}', '!./ta/**', '!./index.ts', '!../test/**'],
  { query: '?raw', import: 'default', eager: true },
);

/** Every literal passed to t('…') / translate('…') in the app source. */
function sourceKeys(): Map<string, string> {
  const found = new Map<string, string>();
  const re = /\b(?:t|translate)\(\s*(['"`])((?:\\.|(?!\1).)*?)\1/g;
  for (const [file, text] of Object.entries(SOURCES)) {
    for (const m of text.matchAll(re)) {
      const raw = m[2] ?? '';
      if (m[1] === '`' && raw.includes('${')) continue; // dynamic template, not a key
      const key = raw.replace(/\\(['"`\\])/g, '$1');
      if (!found.has(key)) found.set(key, file.replace('../', 'src/'));
    }
  }
  return found;
}

describe('Tamil translations', () => {
  it('cover every string passed to t() in the source', () => {
    const missing = [...sourceKeys()]
      .filter(([key]) => !(key in TA))
      .map(([key, file]) => `${file}: ${key}`);
    expect(missing).toEqual([]);
  });

  it('keep the same {placeholders} as the English key', () => {
    const vars = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    const broken = Object.entries(TA).filter(([en, ta]) => vars(en).join() !== vars(ta).join());
    expect(broken).toEqual([]);
  });

  it('are actually Tamil, not copies of the English', () => {
    const untranslated = Object.entries(TA).filter(
      ([en, ta]) =>
        en === ta && /[a-z]{3}/i.test(en.replace(/\{\w+\}|ASG|WELCOME10|SAVE500|FREESHIP/g, '')),
    );
    expect(untranslated).toEqual([]);
  });
});

describe('translate helpers', () => {
  it('falls back to English and fills variables', () => {
    expect(translate('Sign in', undefined, 'en')).toBe('Sign in');
    expect(translate('Sign in', undefined, 'ta')).toBe('உள்நுழை');
    expect(translate('No such key {n}', { n: 2 }, 'ta')).toBe('No such key 2');
    expect(translate('Wishlist|short', undefined, 'en')).toBe('Wishlist');
    expect(translate('Wishlist|short', undefined, 'ta')).toBe('விருப்பம்');
  });

  it('translates finished sentences by pattern', () => {
    const key = Object.keys(TA).find((k) => /\{\w+\}/.test(k));
    if (!key) return;
    const sample = key.replace(/\{\w+\}/g, '42');
    expect(translateMessage(sample, 'ta')).not.toBe(sample);
    expect(translateMessage(sample, 'en')).toBe(sample);
  });
});

describe('pattern safety', () => {
  it('leaves an unknown sentence fully English instead of half-translating it', () => {
    expect(translateMessage('Order ASG-1 is somewhere over the rainbow', 'ta')).toBe(
      'Order ASG-1 is somewhere over the rainbow',
    );
  });
});
