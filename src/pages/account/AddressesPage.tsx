import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MapPin, Plus } from 'lucide-react';
import { useState } from 'react';
import { Seo } from '@/components/Seo';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Overlay';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/primitives';
import { AddressCard } from '@/features/account/AddressCard';
import { AddressForm, EMPTY_ADDRESS } from '@/features/account/AddressForm';
import { qk } from '@/hooks/queries';
import { useT } from '@/i18n';
import type { AddressValues } from '@/lib/validation';
import { api } from '@/services';
import { toast } from '@/store/uiStore';
import type { Address } from '@/types';

export default function AddressesPage() {
  const { t } = useT();
  const qc = useQueryClient();
  const {
    data: addresses,
    isLoading,
    isError,
    refetch,
  } = useQuery({ queryKey: qk.addresses, queryFn: () => api.account.listAddresses() });
  const [editing, setEditing] = useState<Address | 'new' | null>(null);
  const invalidate = () => qc.invalidateQueries({ queryKey: qk.addresses });

  const save = useMutation({
    mutationFn: (v: AddressValues) =>
      api.account.saveAddress(v, editing && editing !== 'new' ? editing.id : undefined),
    onSuccess: async () => {
      await invalidate();
      toast.success('Address saved');
      setEditing(null);
    },
    onError: (e) =>
      toast.error('Could not save address', e instanceof Error ? e.message : undefined),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.account.deleteAddress(id),
    onSuccess: async () => {
      await invalidate();
      toast.success('Address removed');
    },
  });
  const makeDefault = useMutation({
    mutationFn: (id: string) => api.account.setDefaultAddress(id),
    onSuccess: invalidate,
  });

  return (
    <div>
      <Seo title={t('Addresses')} noindex />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl md:text-4xl">{t('Addresses')}</h1>
        <Button onClick={() => setEditing('new')}>
          <Plus className="size-4" aria-hidden /> {t('Add address')}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : !addresses?.length ? (
        <EmptyState
          icon={<MapPin className="size-6" aria-hidden />}
          title={t('No saved addresses')}
          description={t('Add an address for faster checkout.')}
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <li key={a.id}>
              <AddressCard
                address={a}
                className="h-full"
                actions={
                  <>
                    <Button variant="ghost" size="sm" onClick={() => setEditing(a)}>
                      {t('Edit')}
                    </Button>
                    {!a.is_default && (
                      <Button variant="ghost" size="sm" onClick={() => makeDefault.mutate(a.id)}>
                        {t('Set as default')}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-sale"
                      onClick={() => {
                        if (window.confirm(t('Remove this address?'))) remove.mutate(a.id);
                      }}
                    >
                      {t('Remove')}
                    </Button>
                  </>
                }
              />
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? t('Add address') : t('Edit address')}
      >
        <div className="p-5">
          {editing !== null && (
            <AddressForm
              defaultValues={editing === 'new' ? EMPTY_ADDRESS : { ...editing }}
              onSubmit={(v) => save.mutate(v)}
              loading={save.isPending}
              onCancel={() => setEditing(null)}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
