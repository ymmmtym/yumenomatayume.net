---
title: "Synology で mkcert 証明書が選択できない問題の解決法 🔒"
description: "Synology NAS の Web Station で mkcert で作成した証明書を選択できない問題とその回避策"
pubDate: "2025-12-15"
tags: ["synology", "mkcert", "ssl", "certificate"]
---

Synology NAS の Web Station で mkcert を使って作成した SSL 証明書を選択しようとしたところ、証明書が適用されない問題に遭遇しました 😵 この記事では、その問題と回避策について記録します。

## 問題の症状

Web Station で mkcert で作成した証明書を選択しても、適用されない状況が発生しました。

![Synology 証明書選択画面](https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/synology-certificate-selection?_a=BAMAMiFE0)

証明書の詳細を確認すると、「発行先」の項目が空白になっており、これが原因で証明書が正しく認識されていないようでした 🤔

![Synology 証明書詳細画面](https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/synology-certificate-details?_a=BAMAMiFE0)

## 原因の分析

mkcert で作成される証明書には、通常の CA 証明書と比べて一部の設定項目が不足している可能性があります。特に：

- Subject Alternative Name (SAN) の設定が不完全
- 発行先 (Subject) の詳細情報が不足
- Synology が期待する証明書フォーマットとの不整合

## 回避策

### 方法1: mkcert をデフォルト証明書に設定

最も簡単な回避策は、mkcert で作成した証明書をデフォルト証明書として設定し、Web Station を作成し直すことです：

1. コントロールパネル → セキュリティ → 証明書
2. mkcert で作成した証明書を「デフォルト」に設定
3. Web Station に登録したものを削除して再作成

### 方法2: OpenSSL での証明書情報追記（検討中）

mkcert で作成した証明書に対して、OpenSSL を使用して不足している情報を追記できる可能性があります。ただし、この方法についてはまだ検証中です 🔍

## 制限事項

mkcert は開発環境での使用を想定したツールのため、以下の制限があります：

- 証明書の詳細設定が限定的
- 商用環境での使用には適さない
- 一部のアプリケーションで互換性の問題が発生する可能性

## まとめ

Synology NAS で mkcert 証明書を使用する場合は、個別の Web Station での証明書選択ではなく、システム全体のデフォルト証明書として設定することで問題を回避できます 💡

開発環境以外での使用を考えている場合は、Let's Encrypt や商用 CA からの証明書の使用を検討することをお勧めします 🔒

## 参考情報

- [mkcert GitHub リポジトリ](https://github.com/FiloSottile/mkcert)
- [Synology SSL 証明書設定ガイド](https://kb.synology.com/ja-jp/DSM/help/DSM/AdminCenter/connection_certificate)
