import { Ruler } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Overlay';
import { useT } from '@/i18n';
import type { Gender } from '@/types';

/** Column headers are English keys, translated at render. */
const TABLES: Record<Gender, { head: string[]; rows: string[][] }> = {
  men: {
    head: ['Size', 'Chest (in)', 'Waist (in)', 'Hip (in)'],
    rows: [
      ['XS', '33–35', '27–29', '33–35'],
      ['S', '35–37', '29–31', '35–37'],
      ['M', '38–40', '32–34', '38–40'],
      ['L', '41–43', '35–37', '41–43'],
      ['XL', '44–46', '38–40', '44–46'],
    ],
  },
  women: {
    head: ['Size', 'Bust (in)', 'Waist (in)', 'Hip (in)'],
    rows: [
      ['XS', '31–32', '24–25', '34–35'],
      ['S', '33–34', '26–27', '36–37'],
      ['M', '35–36', '28–29', '38–39'],
      ['L', '37–39', '30–32', '40–42'],
      ['XL', '40–42', '33–35', '43–45'],
    ],
  },
  kids: {
    head: ['Age', 'Height (cm)', 'Chest (cm)', 'Waist (cm)'],
    rows: [
      ['4Y', '98–104', '56', '52'],
      ['6Y', '110–116', '60', '54'],
      ['8Y', '122–128', '64', '57'],
      ['10Y', '134–140', '68', '60'],
      ['12Y', '146–152', '72', '63'],
    ],
  },
  unisex: { head: [], rows: [] },
};

export function SizeGuideButton({ gender }: { gender: Gender }) {
  const [open, setOpen] = useState(false);
  const { t } = useT();
  const table = TABLES[gender === 'unisex' ? 'men' : gender];
  return (
    <>
      <Button variant="link" className="gap-1.5 text-[0.8125rem]" onClick={() => setOpen(true)}>
        <Ruler className="size-4" aria-hidden />
        {t('Size guide')}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={t('Size guide')}>
        <div className="space-y-5 p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">{t('Body measurements by size')}</caption>
              <thead>
                <tr className="border-b border-border-strong text-left">
                  {table.head.map((h) => (
                    <th key={h} scope="col" className="py-2 pr-4 font-medium">
                      {t(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((r) => (
                  <tr key={r[0]} className="border-b border-border">
                    {r.map((c, i) =>
                      i === 0 ? (
                        <th key={c} scope="row" className="py-2.5 pr-4 text-left font-medium">
                          {c}
                        </th>
                      ) : (
                        <td key={`${r[0]}-${i}`} className="py-2.5 pr-4 tabular-nums text-muted">
                          {c}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-1.5 text-sm text-muted">
            <p className="font-medium text-fg">{t('How to measure')}</p>
            <p>
              {t(
                'Chest: measure around the fullest part. Waist: around your natural waistline. Hip: around the fullest part of your hips.',
              )}
            </p>
            <p>{t('Between sizes? Size up for a relaxed fit, down for a closer one.')}</p>
          </div>
        </div>
      </Modal>
    </>
  );
}
