---
title: "大量のデプロイで削除できない Cloudflare Pages プロジェクトを片付けました 🧹"
description: "Cloudflare Pages のプロジェクトを削除しようとしたところ、約3万件のデプロイ履歴が壁になりました。API で履歴を削除し、最後に Wrangler でプロジェクトを削除するまでの記録です。"
pubDate: "2026-11-21"
tags: ["Cloudflare", "Cloudflare Pages", "JavaScript", "運用"]
---

## 使わなくなったサイトを整理しました

使わなくなった `log.yumenomatayume.net`、`beta.yumenomatayume.net`、`blog.yumenomatayume.net` を廃止することにしました。監視設定、DNS 設定の削除やリダイレクト、ホスティング設定の削除を進める中で、Cloudflare 側のプロジェクト削除でつまずきました 🗂️

削除対象の `astro-notion-blog` には、約3万件のデプロイ履歴が残っていました。コンソールからそのまま削除することはできず、先に API でデプロイ履歴を削除してから、Wrangler でプロジェクトを削除しました 🧹

この記事は、そのときの作業メモです 📝

## デプロイが多すぎてプロジェクトを削除できませんでした

Cloudflare のコンソールでプロジェクトの削除を実行すると、次のエラーが表示されました ⚠️

```text
Your project has too many deployments to be deleted, follow this guide to delete them: https://cfl.re/3CXesln
```

このリンクは、Cloudflare の [Known issues（デプロイ件数が多いプロジェクトの削除）](https://developers.cloudflare.com/pages/platform/known-issues/#delete-a-project-with-a-high-number-of-deployments) に案内されます。公式の回避策は Wrangler でデプロイを個別に削除する方法ですが、今回は表示された手順ではなく、AI に相談して見つけた API での削除方法を試しました 🗑️

## API でデプロイ履歴を削除しました

Cloudflare の Workers & Pages から操作していましたが、今回扱うのは **Cloudflare Pages のプロジェクト**です。このセクションの API も `/pages/projects/` を使い、最後の削除も `wrangler pages project delete` で行います 🔎

Cloudflare の AI に相談したところ、スクリプトでデプロイを削除する方法を勧められました 🤖 そこで、次の `delete-deployments.mjs` を作成しました。

> このスクリプトはデプロイを削除する破壊的な操作です。取得した一覧には本番デプロイも含まれるため、**プロジェクト自体を削除する場合以外は実行しないでください**。実行する場合は、アカウント ID とプロジェクト名が削除対象であることを必ず確認してください 🚨

公式の回避策で紹介されているスクリプトは、本番デプロイを残してプレビューデプロイだけを削除する設計です。プロジェクトを残す場合は、そちらを参照してください。

```javascript
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const PROJECT = "astro-notion-blog";
const BASE = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT}/deployments`;
const H = { Authorization: `Bearer ${TOKEN}` };

async function page(n) {
  const r = await fetch(`${BASE}?page=${n}&per_page=25`, { headers: H });
  const j = await r.json();
  return j.result.map((d) => d.id);
}

let deleted = 0;
for (;;) {
  const ids = await page(1);
  if (!ids.length) break;
  const results = await Promise.all(
    ids.map(async (id) => {
      const r = await fetch(`${BASE}/${id}?force=true`, {
        method: "DELETE",
        headers: H,
      });
      return r.ok;
    })
  );
  const n = results.filter(Boolean).length;
  deleted += n;
  if (n === 0) break;
  if (deleted % 500 < 25) console.log(`deleted ${deleted}`);
}
console.log(`done: ${deleted}`);
```

処理はシンプルです ✨

1. デプロイ一覧の先頭ページから最大25件の ID を取得します。
2. 取得した ID に対して、並列で削除リクエストを送ります。
3. 削除に成功した件数を集計し、再び先頭ページを取得します。

削除すると一覧の内容が変わるため、ページ番号を増やすのではなく、毎回1ページ目を取得しています。

また、取得したデプロイがなくなるか、その回の削除がすべて失敗すると終了します。つまり、`done` と表示されても、それだけで全件削除を保証するものではありません。

実際には、削除の進み具合は Cloudflare のコンソールで残件数を見ながら確認しました。API のレスポンスに含まれる `result_info.total_count` を出力するようにすれば、スクリプト側でも残件数を追えるため、コンソールを行き来せずに進捗を把握できます 🔍

### 環境変数を設定して実行します

アカウント ID と API トークンを環境変数で渡します。bash / zsh での設定例は次のとおりです 🔑

```bash
export CLOUDFLARE_ACCOUNT_ID="<Cloudflare のアカウント ID>"
export CLOUDFLARE_API_TOKEN="<対象の Pages プロジェクトを編集・削除できる API トークン>"

node delete-deployments.mjs
```

実行時には、次のような結果が出ました。

```text
deleted 24
done: 96
```

`deleted` の値は、その実行中に削除が成功した件数です。スクリプトを再実行するとカウントはゼロから始まります。

## 一度では削除しきれませんでした

約3万件の履歴があるためか、一度の実行では削除しきれませんでした。先ほどの `done: 96` は1回の実行例で、毎回この件数が削除できたわけではありません ⏳ 途中で、次のエラーが出ることもありました。

```text
SyntaxError: Unexpected end of JSON input
```

作業時には API のレート制限が原因ではないかと考えました。ただし、このエラー自体が示しているのは、レスポンスを JSON として解析できなかったことです。HTTP ステータスやレスポンス本文を記録していないため、レート制限が原因だったとは断定できません。

今回のスクリプトは、一覧取得時にレスポンスのステータスを確認せず `r.json()` を呼び出しています。また、削除に失敗した場合の詳細も出力していません。あくまで今回の片付け用に使った簡易スクリプトです。

### watch で定期的に再実行しました

今回は `watch` コマンドで60秒ごとに実行し、少しずつ削除を進めることにしました 🔁

```bash
watch -n 60 node delete-deployments.mjs
```

この方法なら、途中でスクリプトが終了しても、次の実行で残っているデプロイの先頭ページから処理を再開できます。

実際にはコンソールで残件数を確認しながら進め、1時間足らずで完了しました ✅

ただし、これはレート制限に応じて待機時間を調整する仕組みではありません。再利用するなら、HTTP ステータスの確認や `429` に対する待機・再試行を組み込んだ方が、状況を把握しやすくなります。

## 最後に Wrangler でプロジェクトを削除しました

デプロイ履歴の削除を進めたあと、最後に Wrangler からプロジェクトを削除しました 🚀

```bash
npx wrangler pages project delete astro-notion-blog --yes
```

`--yes` を付けると確認を省略するため、プロジェクト名は実行前に確認しておきます。実行結果は次のとおりでした。

```text
Deleting astro-notion-blog
Successfully deleted astro-notion-blog
```

これで、削除できずに残っていたプロジェクトを片付けられました 🎉

## まとめ

使わなくなったサイトを整理するだけのつもりでしたが、大量のデプロイ履歴が残っていると、プロジェクトの削除にもひと手間かかりました 💡

今回は、API で先頭ページのデプロイを繰り返し削除し、最後に Wrangler でプロジェクトを削除する流れで対応できました。サイトの廃止では、DNS や監視設定だけでなく、ホスティング側に蓄積されたデプロイ履歴まで確認しておくとよさそうです。
