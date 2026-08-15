import { createApp } from '../src/app'

/**
 * LOCKED FILE — Team 01 (Core Platform).
 *
 * Vercel's Node runtime treats the default export as the request handler, and an
 * Express app *is* a `(req, res)` function — so this is the whole serverless
 * adapter. `vercel.json` rewrites every path here.
 */
export default createApp()
