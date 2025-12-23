---
title: "terraform-proxmox-provider で VM 削除が Timeout してしまう ⏰"
description: "Proxmox上のVM削除が長時間かかる問題の原因と解決策"
pubDate: "2025-11-21"
tags: ["proxmox", "ubuntu", "vm", "terraform"]
---

## Proxmox VM 削除が遅い問題の解決

Proxmox環境でUbuntu VMの削除が20分以上かかるという問題が発生しました 😅 特に `terraform apply` の実行時間が長くなり、VMのシャットダウンにかなりの時間を要していました。

### 発生した状況

- `terraform apply` の実行が20分以上かかる ⏰
- VMのシャットダウンが非常に遅い 🐌
- 最終的に削除が完了するまでに30分を要した

### 原因

調査の結果、この問題は `terraform plan` の段階で発生していることが判明しました 🔍 具体的には、QEMUからネットワーク情報を取得する際に403エラーが発生していました。

- QEMUネットワーク情報取得時の403エラー:
  - Terraform 経由でのみエラーが発生した 🚫
  - CLI から root ユーザーで直接実行した場合は情報が取得できる ✅
  - CLI から terraform ユーザーでは取得できない ❌

以上より terraform ユーザーになんらかの権限が足りていない可能性がありました。

### 解決策

Terraformの実行ユーザーに`VM.GuestAgent.Audit`権限を追加することで、この問題は解消されました 🎉

以下のコマンドを実行して、`Terraform`ロールに権限を追加しました：

```bash
pveum role modify Terraform -append -privs "VM.GuestAgent.Audit"
```

この権限を追加したところ、VMの削除にかかる時間が大幅に短縮され、`terraform apply` の実行も正常に行われるようになりました ✨
