import type {} from 'hono'

declare module 'hono' {
  interface Env {
    Variables: {}
    Bindings: {}
  }

  interface ContextRenderer {
    (
      content: string | Promise<string>,
      props?: {
        title?: string
        description?: string
        heroImage?: string
        noindex?: boolean
      }
    ): Response | Promise<Response>
  }
}
