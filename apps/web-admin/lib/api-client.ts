import { createApiClient } from '@repo/client/api-client'

/**
 * LOCKED FILE — Team 01 (Core Platform).
 *
 * This app talks to `api-admin` only. If you find yourself pointing it at
 * `api-student`, the endpoint you need probably belongs in `api-admin` instead.
 */
export const api = createApiClient(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001')

export { ApiRequestError } from '@repo/client/api-client'
