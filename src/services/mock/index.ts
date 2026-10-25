import type { Api } from '@/services/types';
import { mockAccount } from './account';
import { mockAuth } from './auth';
import { mockCatalog } from './catalog';
import { mockCheckout } from './checkout';
import { mockOrders } from './orders';
import { mockPayments } from './payments';

export const mockApi: Api = {
  source: 'mock',
  catalog: mockCatalog,
  auth: mockAuth,
  account: mockAccount,
  orders: mockOrders,
  checkout: mockCheckout,
  payments: mockPayments,
};
