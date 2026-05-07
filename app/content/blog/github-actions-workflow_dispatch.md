---
title: "GitHub Actions workflow_dispatch の設定してみる ⚡"
description: "GitHub Actions で手動実行トリガーを設定する workflow_dispatch の使い方"
pubDate: "2021-08-17"
tags: ["github","github-actions"]
heroImage: "https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/github-actions-workflow-dispatch?_a=BAMAMiFE0"
---

GitHub Actions のイベントトリガーには、`workflow_dispatch` というものがあります 🚀

これを設定することで、**手動で GitHub Actions 実行のトリガー**を作ることができます ✨

## workflow_dispatch とは

https://docs.github.com/ja/actions/reference/events-that-trigger-workflows

`workflow_dispatch` は、GitHub Actions を手動で実行するためのイベントトリガーです。以下の特徴があります：

- **手動実行**: ブラウザから任意のタイミングで実行可能 🖱️
- **パラメータ指定**: 実行時に引数を指定できる 📝
- **ブランチ選択**: 実行するブランチを選択可能 🌿

## 実装例

### 適用したリポジトリ

[terraform-cloud-oci](https://github.com/ymmmtym/terraform-cloud-oci) で実際に設定してみました。

`workflow_dispatch` 部分を抜粋したものは以下になります：

```yaml
on:
  workflow_dispatch:
    inputs:
      args:
        description: 'Args to terraform (default: show)'
        required: true
        default: 'show'

jobs:
  terraform:
    name: Terraform
    runs-on: ubuntu-latest
    steps:
      - name: Terraform ${{ github.event.inputs.args }}
        run: terraform ${{ github.event.inputs.args }}
        if: ${{ github.event_name == 'workflow_dispatch' }}
```

### 設定項目の説明

- **`inputs`**: 実行時に指定できるパラメータを定義 📋
- **`description`**: パラメータの説明文
- **`required`**: 必須パラメータかどうか
- **`default`**: デフォルト値

## 使用方法

### ブラウザからの実行

GitHub をブラウザで開き、Actions タブに移動すると、以下のように **Run workflow** という項目が追加されています 🎯

![GitHub Actions の workflow_dispatch 設定画面](https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/github-actions-workflow-dispatch?_a=BAMAMiFE0)

ブラウザからは上記から workflow を実行することができ、この時に以下を指定できます：

- **Branch**: 実行するブランチ 🌿
- **引数**: 設定したパラメータの値 ⚙️

### API からの実行

API を使用して実行する方法もあります 🔌

```bash
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token YOUR_TOKEN" \
  https://api.github.com/repos/OWNER/REPO/actions/workflows/WORKFLOW_ID/dispatches \
  -d '{"ref":"main","inputs":{"args":"plan"}}'
```

## 活用例

- **デプロイ作業**: 本番環境への手動デプロイ 🚀
- **テスト実行**: 特定のテストスイートの実行 🧪
- **メンテナンス**: データベースのマイグレーションなど 🔧
- **緊急対応**: 障害時の緊急処理実行 🚨

## まとめ

`workflow_dispatch` を使用することで、GitHub Actions をより柔軟に活用できます 💡 定期実行だけでなく、必要な時に手動で実行できる仕組みを作ることで、運用の幅が広がります。

## 参考資料

- [GitHub Actions で workflow_dispatch を使って手動実行する](https://swfz.hatenablog.com/entry/2020/07/10/201136)