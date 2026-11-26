import type {} from 'hono'

declare module 'hono' {
  interface Env {
    Variables: {}
    Bindings: {
      SEND_EMAIL: SendEmail
      CONTACT_RATE_LIMITER?: RateLimit
    }
  }

  interface ContextRenderer {
    (
      content: string | Promise<string>,
      props?: {
        title?: string
        description?: string
        heroImage?: string
        noindex?: boolean
        article?: {
          pubDate?: string
          updatedDate?: string
          tags?: string[]
        }
      }
    ): Response | Promise<Response>
  }
}
