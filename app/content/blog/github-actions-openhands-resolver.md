---
title: 'GitHub Actions と OpenHands Resolver で AI エンジニアに開発を依頼する環境を構築する 🤖'
description: 'GitHub Issue をトリガーに、AI が自動でコードを修正しプルリクエストを作成する環境を OpenHands と GitHub Actions を使って構築しました'
pubDate: '2025-11-29'
tags: ['GitHub Actions', 'OpenHands', 'AI', 'LLM']
---

この記事では、[OpenHands](https://github.com/OpenHands/OpenHands) の `Issue Resolver` という機能を使い、GitHub Actions 経由で AI に開発を自動で依頼する環境を構築した際のセットアップ手順を紹介します。

この仕組みを導入することで、GitHub の Issue に特定のラベルを付けたり、特定のメンションを送るだけで、AI が自動的にコードを修正し、プルリクエストを作成してくれるようになります。

## はじめに

今回この仕組みを導入したリポジトリと、利用した LLM は以下の通りです。

-   **対象リポジトリ**: [ymmmtym/pillow-web: Pillew Web Image Generation API](https://github.com/ymmmtym/pillow-web)
-   **LLM**: OpenRouter / `x-ai/grok-4.1-fast`

OpenHands の公式ドキュメントは以下で確認できます。

- [OpenHands GitHub Action - OpenHands Docs](https://docs.openhands.dev/openhands/usage/run-openhands/github-action)
- [OpenHands/openhands/resolver/README.md](https://github.com/OpenHands/OpenHands/blob/main/openhands/resolver/README.md)

## 設定手順

設定は以下のステップで完了します。
### 1. GitHub Actions ワークフローの作成

OpenHands Resolver を使うリポジトリの `.github/workflows` ディレクトリに `openhands-resolver.yml` というファイル名でワークフローを定義します。

公式で提供されているサンプルから少し修正して、以下のようなファイルを作成しました。
（OpenRouter で使用するモデル向けに、デフォルトを一部変更しています。）

```yaml
name: Resolve Issue with OpenHands

on:
  issues:
    types: [labeled]
  pull_request:
    types: [labeled]
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
  pull_request_review:
    types: [submitted]

permissions:
  contents: write
  pull-requests: write
  issues: write

jobs:
  call-openhands-resolver:
    uses: OpenHands/OpenHands/.github/workflows/openhands-resolver.yml@main
    with:
      macro: ${{ vars.OPENHANDS_MACRO || '@openhands-agent' }}
      max_iterations: ${{ fromJson(vars.OPENHANDS_MAX_ITER || 50) }}
      base_container_image: ${{ vars.OPENHANDS_BASE_CONTAINER_IMAGE || '' }}
      LLM_MODEL: ${{ vars.LLM_MODEL || 'openrouter/x-ai/grok-4.1-fast' }} # デフォルトを変更
      target_branch: ${{ vars.TARGET_BRANCH || 'main' }}
      runner: ${{ vars.TARGET_RUNNER }}
    secrets:
      PAT_TOKEN: ${{ secrets.PAT_TOKEN }}
      PAT_USERNAME: ${{ secrets.PAT_USERNAME }}
      LLM_API_KEY: ${{ secrets.LLM_API_KEY }}
      LLM_BASE_URL: ${{ secrets.LLM_BASE_URL || 'https://openrouter.ai/api/v1' }} # デフォルトを変更
```

### 2. リポジトリ設定

リポジトリの Settings から必要な設定をします。

#### 2.1. GitHub Action の PR 作成権限変更

GitHub Actions から PR を作成するための権限が必要になります。

リポジトリの「Settings > Actions > General > Workflow permissions」の **Allow GitHub Actions to create and approve pull requests** にチェックを入れます。

ちなみに本家の手順では Personal Access Token (PAT) を作成する方法が紹介されていますが、トークン管理だったりセキュリティー面を考慮して作成しない方法で試してみることにしました。
#### 2.2. Secrets と Variables の設定

ワークフローが利用する API キーやモデル名を GitHub リポジトリの「Settings > Secrets and variables > Actions」から設定します。

設定できる項目は workflow の `with`, `secrets` に記載されている内容です。

デフォルトを変更したためほとんど登録する必要がありませんが、OpenRouter の API キーのみ必須で設定してください。

- Secrets
	- （必須）  `LLM_API_KEY`: OpenRouter の API キー

これで設定は完了しました。
## 使い方

リポジトリの Issue,PR 上で以下のいずれかのアクションを行うことで、GitHub Actions がトリガーされ、AI によるプルリクエストが自動で作成されます。

-   `@openhands-agent` というアカウントをメンションしてコメントする
-   `fix-me` というラベルを Issue に付与する

実際に試してみた Issue はこちらです。（何回かリトライしたのでたくさんコメントあります。。）

- [ファイル形式をクエリで設定できるようにする · Issue #2 · ymmmtym/pillow-web](https://github.com/ymmmtym/pillow-web/issues/2)

少し待つと PR が作成されました。

- [Fix issue #2: ファイル形式をクエリで設定できるようにする by github-actions[bot] · Pull Request #4 · ymmmtym/pillow-web](https://github.com/ymmmtym/pillow-web/pull/4)

作成された PR にもコメントすることで、PR の内容を修正できます。
## まとめ

OpenHands の Issue Resolver を使うことで、Issue ベースの開発フローを AI を活用して自動化する面白い仕組みが作れました。セットアップも簡単なので、興味のある方はぜひ試してみてください。