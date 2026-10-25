import type { Api } from './types';
import { mockApi } from './mock';
import { supabaseApi } from './supabase';

/**
 * The single seam between UI and data. Components never import a concrete adapter:
 * set VITE_DATA_SOURCE=supabase to swap the whole backend.
 */
export const api: Api = import.meta.env.VITE_DATA_SOURCE === 'supabase' ? supabaseApi : mockApi;

export { ApiError, isApiError } from './types';
export type { Api } from './types';
