---
title: "terraform cloud で tfstate を管理している時ローカルで terraform を実行する方法 🌍"
description: "Terraform Cloud で tfstate を管理している構成で、ローカルから terraform plan/apply を実行するためのトークン設定と手順を紹介します。"
pubDate: "2021-08-30"
tags: ["terraform","github"]
---

個人環境で、OCI(Oracle Cloud Infrastructure) の無料枠を terraform でデプロイしています。

https://github.com/ymmmtym/terraform-cloud-oci

Terraform Cloud では tfstate とクレデンシャル情報を管理しており、GitHub に PR(merge) すると GitHub Acitons より terraform plan(terraform apply) が実行されます。

実装方法としては、API-driven workflow を採用しており、GitHub に

以下の記事に詳しく記載されています。

https://www.ai-shift.co.jp/techblog/1924

GitHub と連携しているため、terraform コマンドを実行するためには GitHub に操作を加える必要があります。 [^1]

もしくは、Terraform Cloud の管理画面より手動で実行する必要があります。

検証環境であれば、もう少し気軽に試したいと思い、ローカルで実行できる方法を探しました。


## terraform.rc を使ってみる

`terraform.rc` or `.terraformrc` ファイルに以下のような形で API_TOKEN を書くと、terraform cloud にある tfstate を参照してローカルで動作させる事ができます。

```hcl
credentials "app.terraform.io" {
  token = "xxxxxx.atlasv1.zzzzzzzzzzzzz"
}
```

## Reference

- [Terraform Cloud は AWS の credentials を持たせずに tfstate だけ管理することができる | DevelopersIO](https://dev.classmethod.jp/articles/manage-tfstate-terraform-cloud/)
- [CLI Configuration - Terraform by HashiCorp](https://www.terraform.io/docs/cli/config/config-file.html)

[^1]: [GitHub Actions workflow_dispatch の設定してみる | yumenomatayume's Blog](https://blog.yumenomatayume.net/2021/08/17/04) より、workflow_dispatch で実行することもできます。
