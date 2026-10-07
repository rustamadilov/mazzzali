import type { ApiClient } from './client';
import { liveClient } from './client';
export const api: ApiClient = liveClient;
export type { ApiClient } from './client';