import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useT } from '@/i18n';

const SITE = import.meta.env.VITE_SITE_URL ?? 'http://localhost:5173';
const BRAND = 'ASG';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  canonicalPath?: string;
  noindex?: boolean;
  type?: 'website' | 'product';
  /** schema.org JSON-LD payload */
  jsonLd?: Record<string, unknown>;
}

/** Lightweight head management: title, description, canonical, Open Graph, JSON-LD. */
export function Seo({
  title,
  description,
  image,
  canonicalPath,
  noindex,
  type = 'website',
  jsonLd,
}: SeoProps) {
  const { pathname } = useLocation();
  const { t, tm } = useT();
  const fullTitle = title
    ? `${tm(title)} — ${BRAND}`
    : t('ASG — Modern essentials for everyday wear');
  const desc =
    description !== undefined
      ? tm(description)
      : t('Considered essentials for men, women and kids. Free shipping over ₹1,999.');
  const canonical = `${SITE}${canonicalPath ?? pathname}`;

  useEffect(() => {
    document.title = fullTitle;
    setMeta('name', 'description', desc);
    setMeta('name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow');
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', canonical);
    if (image && !image.startsWith('data:')) setMeta('property', 'og:image', image);
    setMeta('name', 'twitter:card', 'summary_large_image');

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonical;

    let script: HTMLScriptElement | null = null;
    if (jsonLd) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.seo = 'true';
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
    return () => {
      script?.remove();
    };
  }, [fullTitle, desc, canonical, image, noindex, type, jsonLd]);

  return null;
}
