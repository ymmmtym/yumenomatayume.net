// The search scripts import the built Worker bundle, which has no type declarations.
declare module '*/dist/index.js' {
  import type { Hono } from 'hono'
  const app: Hono
  export default app
}
