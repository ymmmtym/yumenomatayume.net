---
title: "OCI を開設して Terraform を使えるようにするまで 🚀"
description: "Oracle Cloud Infrastructure を触り始めるにあたって、アカウント開設から API キーの作成、Terraform で `plan` が通るところまでを試したメモです。"
pubDate: "2026-05-02"
tags: ["OCI", "Oracle Cloud Infrastructure", "Terraform", "IaC"]
---

Oracle Cloud Infrastructure（OCI）を触ってみようと思って、まずはアカウント開設から Terraform が使える状態になるまでを試してみました。

最初は「設定がいろいろありそうだな……」と思っていたのですが、実際にやってみると、最初の入り口としてはそこまで複雑ではなかったです 😊

この記事では、そのときにやったことをあとで見返せるようにまとめています。

## まず結論

今回試した範囲では、次の流れで `terraform plan` が通るところまで確認できました。

- OCI アカウントを開設する
- API キーを作成する
- Terraform 用の認証情報を設定する

まずはこの最小構成でつながることを確認して、そのあと必要に応じて構成を広げていくのがよさそうです ✨

## アカウント開設で必要だったもの

アカウント開設時に必要だったものは次のとおりでした。

- メールアドレスとパスワード
- ホームリージョン
- 住所
- クレジットカード情報

今回はホームリージョンとして**大阪**を選びました。

必要情報を入力してから、アカウントが作成されるまでの時間は約 15 分でした。

### なぜ大阪リージョンにしたのか

Always Free で `VM.Standard.A1.Flex` インスタンスを作成したかったのですが、東京リージョンは枯渇しているという話を見かけたので、大阪リージョンで試してみることにしました。

ただ、大阪リージョンも余裕があるわけではなさそうで、記事執筆時点ではまだ作成できていません。

それでも、東京リージョンよりは少し可能性がありそうかなと思って、ひとまず大阪を選んでいます。明確な根拠があったというよりは、まず試せそうな選択肢として選んだ、というのが実際のところです。

## API キーを作成する

Terraform から OCI を操作するために、OCI 側で API キーを作成します。

今回は OCI コンソールの **「マイプロファイル > トークンおよびキー」** から API キーを作成しました。

作成後はキーペアをダウンロードして、一旦ローカルに次のように配置します。

```bash
~/.oci/oci_api_key.pem
~/.oci/oci_api_key.pub.pem
```

次に認証情報を取得します。

API キーを作成した画面から次のようなファイルをダウンロードできます。

```ini
[DEFAULT]
user=ocid1.user.oc1..xxxxxxxxxxx
fingerprint=xx:xx:xx:xx:xx
tenancy=ocid1.tenancy.oc1..xxxxxxxxx
region=ap-osaka-1
key_file=/Users/yourname/.oci/oci_api_key.pem
```

上記は `oci` コマンドを使うために `~/.oci/config` に設定する ini 格式のファイルです。
ここに記載された情報を Terraform に渡していきます。

今回はホームリージョンを大阪にしたので、`region` も `ap-osaka-1` を使っています。
`key_file` にAPI キーの秘密鍵ファイルのパスを設定します。

このあたりは公式ドキュメントどおりに進めれば問題ありませんでした。

## Terraform 側で設定したもの

次の 4 つを`.auto.tfvars` に設定します。

```txt
user_ocid=ocid1.user.oc1..xxxxxxxxxxx
fingerprint=xx:xx:xx:xx:xx
tenancy_ocid=ocid1.tenancy.oc1..xxxxxxxxx
private_key="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"
```

`variables.tf` は次のようになります。

```hcl
variable "user_ocid" {
  type = string
}

variable "fingerprint" {
  type = string
}

variable "tenancy_ocid" {
  type = string
}

variable "private_key" {
  type      = string
  sensitive = true
}
```

Provider 設定のイメージは次のようになります。

```hcl
provider "oci" {
  tenancy_ocid = var.tenancy_ocid
  user_ocid    = var.user_ocid
  fingerprint  = var.fingerprint
  private_key  = var.private_key
  region       = "ap-osaka-1"
}
```

この形で設定して、`terraform plan` が通るところまでは確認できました 🎉

### `private_key` はパスではなく中身を入れた

今回ちょっと違ったのは、`path` は使わずにコード側へ直接値を持たせたかったことです。  
そのため、`private_key` には秘密鍵ファイルのパスではなく、**秘密鍵の中身そのもの**を設定しました。  
しかもそのまま複数行で持つのではなく、**改行コードを含めず 1 行にした文字列**として扱っています。

## やってみて思ったこと

最初はもっと詰まるかと思っていたのですが、実際には API キーを作成して必要な認証情報をそろえれば、Terraform 利用開始までの流れはかなりシンプルでした。

特に最初の段階では、完璧な構成をいきなり目指すよりも、まずは `plan` が通るところまで持っていくのがよさそうです。

また、認証情報の持たせ方も一つではないので、自分が管理しやすいやり方を選べる余地があるなと思いました。

一方で、Always Free のインスタンス作成可否はリージョンの空き状況にもかなり左右されそうです。このあたりは Terraform の設定以前に、どのリージョンで試すかも意外と重要だと感じました。

## 参考

今回の確認では、以下の公式ドキュメントを参考にしました。

- [Oracle Cloud InfrastructureでのTerraformの開始](https://docs.oracle.com/ja/learn/oci-terraform-for-beginners/index.html)
