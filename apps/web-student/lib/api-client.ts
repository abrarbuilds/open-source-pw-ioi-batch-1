import { createApiClient } from '@repo/client/api-client'

/**
 * LOCKED FILE — Team 01 (Core Platform).
 *
 * This app's single API client instance. Import `api` from here everywhere;
 * see `@repo/client/api-client` for how tokens and refresh are handled.
 */
export const api = createApiClient(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000')

export { ApiRequestError } from '@repo/client/api-client'
