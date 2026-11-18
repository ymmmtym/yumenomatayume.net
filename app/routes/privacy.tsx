import { createRoute } from 'honox/factory'
import { PRIVACY_LAST_UPDATED, formatJapaneseDate } from '../utils/privacy'

const LAST_UPDATED = formatJapaneseDate(PRIVACY_LAST_UPDATED)

const sectionTitle =
  'mt-10 mb-4 border-b border-gray-200 pb-2 text-xl font-bold tracking-tight text-gray-900 dark:border-gray-800 dark:text-gray-50'
const bodyText = 'mb-4 leading-relaxed text-gray-700 dark:text-gray-300'
const linkClass = 'text-brand-700 underline hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200'
const listClass = 'mb-4 list-disc space-y-2 pl-6 leading-relaxed text-gray-700 dark:text-gray-300'

export default createRoute((c) =>
  c.render(
    <main class="mx-auto max-w-3xl px-4 py-10">
      <p class="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-brand-600 dark:text-brand-300">
        Legal
      </p>
      <h1 class="mb-2 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
        プライバシーポリシー
      </h1>
      <p class="mb-8 text-sm text-gray-500 dark:text-gray-400">最終更新日: {LAST_UPDATED}</p>

      <p class={bodyText}>
        本サイト「yumenomatayume」（以下「当サイト」といいます）は、当サイトをご利用いただく皆さまの個人情報および利用情報を適切に取り扱うため、以下のとおりプライバシーポリシーを定めます。
      </p>

      <h2 class={sectionTitle}>1. 取得する情報</h2>
      <p class={bodyText}>当サイトでは、次の情報を取得する場合があります。</p>
      <ul class={listClass}>
        <li>お問い合わせフォームからご入力いただくお名前、メールアドレス、件名、お問い合わせ内容</li>
        <li>Cookie、ウェブビーコン、IP アドレス、その他の識別子などの技術情報</li>
        <li>閲覧したページ、滞在時間、リファラーなどのアクセス解析情報</li>
      </ul>

      <h2 class={sectionTitle}>2. 利用目的</h2>
      <ul class={listClass}>
        <li>お問い合わせへの回答およびご連絡</li>
        <li>当サイトの運営、品質向上およびコンテンツ改善</li>
        <li>広告の配信および効果測定</li>
      </ul>

      <h2 class={sectionTitle}>3. Cookie および識別子の利用</h2>
      <p class={bodyText}>
        当サイトは、利便性の向上や広告配信のために Cookie を使用することがあります。当サイトに広告を掲載することにより、第三者（広告配信事業者など）がユーザーのブラウザに Cookie
        を保存したり、ウェブビーコンや IP アドレスを使用したりして情報を収集する場合があります。Cookie の使用はブラウザの設定により拒否することができますが、その場合、当サイトの一部の機能が正しく動作しないことがあります。
      </p>

      <h2 class={sectionTitle}>4. 広告の配信について（第三者配信事業者）</h2>
      <p class={bodyText}>
        当サイトは、第三者配信事業者として Google が提供する広告配信サービス（Google AdSense）を利用しています。Google
        などの第三者配信事業者は、Cookie を使用して、ユーザーの当サイトや他のサイトへの過去のアクセス情報に基づいて広告を配信します。これにより、ユーザーの興味関心に応じた広告（パーソナライズ広告）が表示されることがあります。
      </p>
      <p class={bodyText}>
        Google による広告配信の仕組みは、
        <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" class={linkClass}>
          Google の広告に関するポリシー
        </a>
        でご確認いただけます。パーソナライズ広告を無効にするには、
        <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" class={linkClass}>
          広告設定
        </a>
        から設定してください。なお、広告設定でパーソナライズ広告を無効にしても、広告の配信自体は継続され、フリークエンシーキャップや集計レポートのために Cookie
        が使用される場合があります。広告 Cookie 自体を拒否したい場合は、ブラウザの設定で Cookie を無効にしてください。また、
        <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" class={linkClass}>
          aboutads.info
        </a>
        にアクセスすることで、一部の第三者配信事業者によるパーソナライズ広告をオプトアウトできます。
      </p>

      <h2 class={sectionTitle}>5. Google による情報の使用</h2>
      <p class={bodyText}>
        Google が、当サイトを含む Google のサービスを使用するサイトやアプリから収集した情報をどのように使用するかについては、次のページをご確認ください。
      </p>
      <p class={bodyText}>
        <a
          href="https://policies.google.com/technologies/partner-sites"
          target="_blank"
          rel="noopener noreferrer"
          class={linkClass}
        >
          Google のサービスを使用するサイトやアプリから収集した情報の Google による使用
        </a>
      </p>

      <h2 class={sectionTitle}>6. お問い合わせフォームで取得する情報の取り扱い</h2>
      <p class={bodyText}>
        お問い合わせフォームからご入力いただいた情報は、お問い合わせへの回答の目的にのみ使用します。ご本人の同意がある場合または法令に基づく場合を除き、第三者に提供することはありません。お問い合わせ内容の送信には、メール配信サービス（Cloudflare Email Routing）を利用しています。
      </p>

      <h2 class={sectionTitle}>7. 情報の管理</h2>
      <p class={bodyText}>
        当サイトは、取得した情報を適切に管理し、漏えい、紛失、改ざんなどの防止に努めます。取得した情報は、利用目的の達成に必要な期間に限り保有し、その後は適切に削除します。
      </p>

      <h2 class={sectionTitle}>8. 開示・訂正・削除の請求</h2>
      <p class={bodyText}>
        ご本人がご自身の情報の開示、訂正、削除などをご希望される場合は、下記のお問い合わせ先までご連絡ください。ご本人であることを確認したうえで、法令に従い対応します。
      </p>

      <h2 class={sectionTitle}>9. プライバシーポリシーの変更</h2>
      <p class={bodyText}>
        当サイトは、法令の変更や運営上の必要に応じて、本プライバシーポリシーを予告なく変更することがあります。変更後の内容は、当ページに掲載した時点から効力を生じるものとします。
      </p>

      <h2 class={sectionTitle}>10. お問い合わせ先</h2>
      <p class={bodyText}>
        本プライバシーポリシーに関するお問い合わせ、およびご自身の情報の開示・訂正・削除のご請求は、
        <a href="/form" class={linkClass}>
          お問い合わせフォーム
        </a>
        または下記のメールアドレスまでご連絡ください。
      </p>
      <p class={bodyText}>
        <a href="mailto:yumenomatayume@yumenomatayume.net" class={linkClass}>
          yumenomatayume@yumenomatayume.net
        </a>
      </p>

      <p class="mt-10 text-sm text-gray-500 dark:text-gray-400">制定日: {LAST_UPDATED}</p>
    </main>,
    {
      title: 'プライバシーポリシー',
      description:
        'yumenomatayume のプライバシーポリシーです。取得する情報、Cookie の利用、広告配信（Google AdSense）およびお問い合わせフォームで取得する情報の取り扱いについて記載しています。'
    }
  )
)
