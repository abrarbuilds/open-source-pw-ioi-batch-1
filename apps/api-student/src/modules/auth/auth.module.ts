import type { ApiModule } from '../../modules'
import { authRouter } from './auth.routes'

/**
 * Every module exports one of these and adds a single line to `src/modules.ts`.
 * Copy this file when you start your team's module.
 */
const authModule: ApiModule = {
  basePath: '/api/auth',
  router: authRouter,
}

export default authModule
