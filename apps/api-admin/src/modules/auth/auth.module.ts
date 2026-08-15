import type { ApiModule } from '../../modules'
import { authRouter } from './auth.routes'

/**
 * The only module mounted outside the admin role gate — logging in obviously
 * cannot require already being logged in. Every other module must leave
 * `public` unset.
 */
const authModule: ApiModule = {
  basePath: '/api/auth',
  router: authRouter,
  public: true,
}

export default authModule
