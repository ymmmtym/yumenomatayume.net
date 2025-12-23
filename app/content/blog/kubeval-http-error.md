---
title: "kubeval で http エラーが出る原因を調べてみた 🔍"
description: "kubeval で Kubernetes マニフェストの検証をしていました。あるマニフェストを検証したところ http エラーが発生しました。カスタムリソースがある場合は発生するようです。"
pubDate: "2022-09-07"
heroImage: ""
tags: ["kubeval", "kubernetes"]
---

> ⚠️ **注意**: 今は kubeconform というツールを使っています。
> このツールは kubeval の後継で、公式リポジトリに CRD からスキーマを作成するスクリプトも用意されているのでおすすめです！

---

Kubernetesマニフェストの検証に `kubeval` を使っていたら、突然httpエラーが出てしまいました 😅

使用していた kubeval のバージョンはこちら：

```bash
❯ kubeval --version
Version: 0.16.0
Commit: 49140f2e8137cb98fc21c52c0f68d81fb4cd5d8e
Date: 2021-03-29T17:03:19Z
```
発生したエラーは以下のようになっておりました。
```bash
❯ kustomize build . | kubeval
ERR  - stdin: Failed initializing schema https://kubernetesjsonschema.dev/master-standalone/customresourcedefinition-apiextensions-v1.json: Could not read schema from HTTP, response status is 404 Not Found
```
関連する Issue を発見しました。
コマンドの引数に `--schema-location` を使用して、スキーマの場所を指定する必要があるようです。

## エラーが出た原因について
CRD を使っていたのでエラーになっているかと思います。

## エラー場所を特定する
発生したエラーでは、`ERR  - stdin` とありどこの箇所でエラーが出ているのかが特定できません。
代わりに sealed-seacrets の Helm Chart で生成される生マニフェストに対して、kubeval を実行します。sealed-secrets のリポジトリを追加していない場合は、以下を実行します。
```bash
helm repo add sealed-secrets https://bitnami-labs.github.io/sealed-secrets
```
`helm template` コマンドの出力に対して、kubeval を実行します。
```bash
❯ helm template sealed-secrets/sealed-secrets | kubeval
PASS - sealed-secrets/templates/service-account.yaml contains a valid ServiceAccount (default.RELEASE-NAME-sealed-secrets)
PASS - sealed-secrets/templates/cluster-role.yaml contains a valid ClusterRole (secrets-unsealer)
PASS - sealed-secrets/templates/cluster-role-binding.yaml contains a valid ClusterRoleBinding (RELEASE-NAME-sealed-secrets)
PASS - sealed-secrets/templates/role.yaml contains a valid Role (default.RELEASE-NAME-sealed-secrets-key-admin)
PASS - sealed-secrets/templates/role.yaml contains a valid Role (default.RELEASE-NAME-sealed-secrets-service-proxier)
PASS - sealed-secrets/templates/role-binding.yaml contains a valid RoleBinding (default.RELEASE-NAME-sealed-secrets-key-admin)
PASS - sealed-secrets/templates/role-binding.yaml contains a valid RoleBinding (default.RELEASE-NAME-sealed-secrets-service-proxier)
PASS - sealed-secrets/templates/service.yaml contains a valid Service (default.RELEASE-NAME-sealed-secrets)
PASS - sealed-secrets/templates/deployment.yaml contains a valid Deployment (default.RELEASE-NAME-sealed-secrets)
```
ちなみに、以下のようなコメントアウトがあると、認識されるようです。
```bash
---
# Source: crds/sealedsecret-crd.yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: sealedsecrets.bitnami.com

<snip...>

---
# Source: sealed-secrets/templates/service-account.yaml
apiVersion: v1
kind: ServiceAccount
```
試しにコメントアウトを削除したところ、`stdin` となり読み込まれてませんでした。
```bash
❯ helm template sealed-secrets/sealed-secrets | grep --color=auto -v "^#" |  kubeval
PASS - stdin contains a valid ServiceAccount (default.RELEASE-NAME-sealed-secrets)
PASS - stdin contains a valid ClusterRole (secrets-unsealer)
PASS - stdin contains a valid ClusterRole (default.RELEASE-NAME-sealed-secrets-key-admin)
PASS - stdin contains a valid ClusterRole (default.RELEASE-NAME-sealed-secrets-service-proxier)
PASS - stdin contains a valid RoleBinding (default.RELEASE-NAME-sealed-secrets-key-admin)
PASS - stdin contains a valid RoleBinding (default.RELEASE-NAME-sealed-secrets-service-proxier)
PASS - stdin contains a valid Service (default.RELEASE-NAME-sealed-secrets)
PASS - stdin contains a valid Deployment (kube-system.sealed-secrets)
```
今回は、CRD をインストールする `--include-crds` オプションをつけて実行します。
```bash
❯ helm template sealed-secrets/sealed-secrets --include-crds | kubeval
ERR  - crds/sealedsecret-crd.yaml: Failed initializing schema https://kubernetesjsonschema.dev/master-standalone/customresourcedefinition-apiextensions-v1.json: Could not read schema from HTTP, response status is 404 Not Found
```
同じエラーが出ました。やはり CRD を定義したマニフェストが原因のようです。

## スキーマを作成する
コマンドの引数に `--schema-location` を使用するために、スキーマを作成します。
通常は、上記においてあるスキーマが使用されるようです。ここにないスキーマは新たに追加する必要があります。
ただ、例に挙げた SealedSecrets もそうですが、公式の GitHub でスキーマが公開されているとは限りません。
そのため、CRD の yaml ファイルからスキーマを作成することをお勧めします。公開されているツールには以下があります。

## その他
`--skip-kinds` オプションをつけて、CRD をスキップする方法もあるようです。
```bash
❯ kustomize build --enable-helm sealed-secrets/base/ | kubeval --skip-kinds CustomResourceDefinition
WARN - stdin containing a CustomResourceDefinition (sealedsecrets.bitnami.com) was not validated against a schema
PASS - stdin contains a valid ServiceAccount (kube-system.sealed-secrets)
PASS - stdin contains a valid Role (kube-system.sealed-secrets-key-admin)
PASS - stdin contains a valid Role (kube-system.sealed-secrets-service-proxier)
PASS - stdin contains a valid ClusterRole (secrets-unsealer)
PASS - stdin contains a valid RoleBinding (kube-system.sealed-secrets-key-admin)
PASS - stdin contains a valid RoleBinding (kube-system.sealed-secrets-service-proxier)
PASS - stdin contains a valid ClusterRoleBinding (sealed-secrets)
PASS - stdin contains a valid Service (kube-system.sealed-secrets)
PASS - stdin contains a valid Deployment (kube-system.sealed-secrets)
```
