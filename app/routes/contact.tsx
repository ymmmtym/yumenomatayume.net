import { createRoute } from 'honox/factory'
import type { ContactFormErrors, ContactFormInput } from '../utils/contactForm'
import {
  CONTACT_LIMITS,
  boundContactInput,
  buildContactEmail,
  isHoneypotTripped,
  validateContactForm
} from '../utils/contactForm'

const CONTACT_TO = 'yumenomatayume@yumenomatayume.net'
const CONTACT_FROM = 'noreply@yumenomatayume.net'

// Upper bound for a text-only contact form, enforced before parsing.
const MAX_BODY_BYTES = 128 * 1024

// Count bytes while reading so streamed bodies without a Content-Length are
// also bounded. Returns null when the limit is exceeded.
async function readBodyWithinLimit(request: Request, limit: number): Promise<ArrayBuffer | null> {
  const reader = request.body?.getReader()
  if (!reader) return new ArrayBuffer(0)
  const chunks: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > limit) {
      await reader.cancel()
      return null
    }
    chunks.push(value)
  }
  const buffer = new ArrayBuffer(total)
  const view = new Uint8Array(buffer)
  let offset = 0
  for (const chunk of chunks) {
    view.set(chunk, offset)
    offset += chunk.byteLength
  }
  return buffer
}

const labelClass = 'mb-1 block text-sm font-semibold text-gray-800 dark:text-gray-200'
const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100'
const errorClass = 'mt-1 text-sm text-red-600 dark:text-red-400'

const EMPTY: ContactFormInput = { name: '', email: '', subject: '', message: '' }

function ContactForm(props: {
  values?: ContactFormInput
  errors?: ContactFormErrors
  sent?: boolean
  alert?: string
}) {
  const values = props.values ?? EMPTY
  const errors = props.errors ?? {}

  if (props.sent) {
    return (
      <div
        role="status"
        class="rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-950/40"
      >
        <h2 class="mb-2 text-lg font-bold text-green-800 dark:text-green-200">送信しました</h2>
        <p class="text-green-800 dark:text-green-200">
          お問い合わせありがとうございます。内容を確認のうえ、順次ご返信いたします。
        </p>
      </div>
    )
  }

  return (
    <form method="post" action="/contact" class="space-y-6" novalidate>
      {props.alert && (
        <div
          role="alert"
          class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          {props.alert}
        </div>
      )}

      {Object.keys(errors).length > 0 && (
        <div
          role="alert"
          class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          入力内容をご確認ください。
        </div>
      )}

      <div>
        <label for="name" class={labelClass}>
          お名前 <span class="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autocomplete="name"
          required
          maxlength={CONTACT_LIMITS.name}
          value={values.name}
          aria-invalid={errors.name ? 'true' : undefined}
          aria-describedby={errors.name ? 'name-error' : undefined}
          class={inputClass}
        />
        {errors.name && (
          <p id="name-error" class={errorClass}>
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label for="email" class={labelClass}>
          メールアドレス <span class="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autocomplete="email"
          required
          maxlength={CONTACT_LIMITS.email}
          value={values.email}
          aria-invalid={errors.email ? 'true' : undefined}
          aria-describedby={errors.email ? 'email-error' : undefined}
          class={inputClass}
        />
        {errors.email && (
          <p id="email-error" class={errorClass}>
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label for="subject" class={labelClass}>
          件名 <span class="text-red-500">*</span>
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          maxlength={CONTACT_LIMITS.subject}
          value={values.subject}
          aria-invalid={errors.subject ? 'true' : undefined}
          aria-describedby={errors.subject ? 'subject-error' : undefined}
          class={inputClass}
        />
        {errors.subject && (
          <p id="subject-error" class={errorClass}>
            {errors.subject}
          </p>
        )}
      </div>

      <div>
        <label for="message" class={labelClass}>
          お問い合わせ内容 <span class="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={8}
          required
          maxlength={CONTACT_LIMITS.message}
          aria-invalid={errors.message ? 'true' : undefined}
          aria-describedby={errors.message ? 'message-error' : undefined}
          class={inputClass}
        >
          {values.message}
        </textarea>
        {errors.message && (
          <p id="message-error" class={errorClass}>
            {errors.message}
          </p>
        )}
      </div>

      {/* スパム対策: 人間には見えない入力欄。入力されていればボットと判定します。 */}
      <div class="absolute left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label for="website">Website</label>
        <input id="website" name="website" type="text" tabindex={-1} autocomplete="off" />
      </div>

      <button
        type="submit"
        class="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 font-semibold text-white no-underline shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      >
        送信する
      </button>
    </form>
  )
}

export const POST = createRoute(async (c) => {
  const mediaType = (c.req.header('content-type') ?? '').split(';')[0].trim().toLowerCase()
  if (mediaType !== 'application/x-www-form-urlencoded' && mediaType !== 'multipart/form-data') {
    return c.text('Unsupported Media Type', 415)
  }

  const declaredLength = Number(c.req.header('content-length') ?? '')
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return c.text('Content Too Large', 413)
  }

  const body = await readBodyWithinLimit(c.req.raw, MAX_BODY_BYTES)
  if (body === null) {
    return c.text('Content Too Large', 413)
  }

  // Reconstruct the request so the original Content-Type (including any
  // multipart boundary) is preserved for the parser.
  const request = new Request(c.req.url, {
    method: 'POST',
    headers: c.req.raw.headers,
    body
  })

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return c.text('Bad Request', 400)
  }

  const raw: Record<string, unknown> = {}
  for (const [key, value] of form.entries()) {
    if (typeof value === 'string') raw[key] = value
  }

  // Silently accept honeypot hits so bots do not learn they were blocked.
  if (isHoneypotTripped(raw)) {
    return c.render(
      <main class="mx-auto max-w-3xl px-4 py-10">
        <ContactForm sent />
      </main>,
      { title: '送信完了', description: 'お問い合わせを送信しました。', noindex: true }
    )
  }

  const result = validateContactForm(raw)
  if (!result.ok) {
    return c.render(
      <main class="mx-auto max-w-3xl px-4 py-10">
        <h1 class="mb-6 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">お問い合わせ</h1>
        <ContactForm values={boundContactInput(raw)} errors={result.errors} />
      </main>,
      { title: 'お問い合わせ', description: 'yumenomatayume へのお問い合わせフォームです。', noindex: true }
    )
  }

  const email = buildContactEmail(result.value, { to: CONTACT_TO, from: CONTACT_FROM })

  try {
    await c.env.SEND_EMAIL.send({
      to: email.to,
      from: email.from,
      replyTo: email.replyTo,
      subject: email.subject,
      text: email.text,
      html: email.html
    })
  } catch (error) {
    console.error('Failed to send contact form email:', error)
    return c.render(
      <main class="mx-auto max-w-3xl px-4 py-10">
        <h1 class="mb-6 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">お問い合わせ</h1>
        <ContactForm
          values={result.value}
          alert="送信に失敗しました。お手数ですが、時間をおいて再度お試しください。"
        />
      </main>,
      { title: '送信に失敗しました', description: 'お問い合わせの送信に失敗しました。', noindex: true }
    )
  }

  return c.render(
    <main class="mx-auto max-w-3xl px-4 py-10">
      <ContactForm sent />
    </main>,
    { title: '送信完了', description: 'お問い合わせを送信しました。', noindex: true }
  )
})

export default createRoute((c) =>
  c.render(
    <main class="mx-auto max-w-3xl px-4 py-10">
      <p class="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-brand-600 dark:text-brand-300">
        Contact
      </p>
      <h1 class="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
        お問い合わせ
      </h1>
      <p class="mb-8 leading-relaxed text-gray-700 dark:text-gray-300">
        記事の内容やご質問、ご依頼などがございましたら、以下のフォームよりお気軽にご連絡ください。
      </p>
      <ContactForm />
      <p class="mt-8 text-sm text-gray-500 dark:text-gray-400">
        送信いただいた情報の取り扱いについては
        <a href="/privacy" class="text-brand-700 underline hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200">
          プライバシーポリシー
        </a>
        をご確認ください。
      </p>
    </main>,
    { title: 'お問い合わせ', description: 'yumenomatayume へのお問い合わせフォームです。', noindex: true }
  )
)
