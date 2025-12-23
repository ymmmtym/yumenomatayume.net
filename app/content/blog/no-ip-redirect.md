---
title: "お名前.com のドメインを自宅 IP アドレスのドメインとして使用する方法 🏠"
description: "DDNS サービス No-IP を使って動的 IP に固定ドメインを設定する方法"
pubDate: "2021-08-15"
tags: ["DNS","no-ip","お名前.com"]
heroImage: "https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/no-ip-redirect-settings?_a=BAMAMiFE0"
---

自宅 IP アドレスに自由なドメインを設定してみます 🌐

## 背景

プロバイダーから提供される自宅 IP アドレスは、動的に変わってしまいます 🔄 そのため、現時点での自宅 IP アドレスをそのままドメインに登録しても、IP アドレスが変わってしまうため名前解決できない期間が発生します。

そこで、**DDNS（ダイナミック DNS）サービス**を用いることで、この動的な自宅 IP に固定のドメインを設定できます ✨

今回は、DDNS として [No-IP](https://www.noip.com/) というサービスで無料ドメインを取得し、`お名前.com` で設定したドメインを、No-IP のドメインにリダイレクトさせてみます。

## 使用ドメイン

以下のドメインは事前に取得しているものとします：

- **`ymmmtym.servebeer.com`** 🍺
  - No-IP で取得する無料ドメイン
  - 自宅のグローバル IP アドレスの A レコード
- **`home.yumenomatayume.net`** 🏡
  - `お名前.com` で取得するドメイン（今回はサブドメインを使用したので、追加料金はかかりませんでした）
  - No-IP で取得した無料ドメインにリダイレクトさせる

## No-IP 側の設定

Hostnames より、自宅 IP アドレスのドメインを取得します 🔧

![No-IP のリダイレクト設定画面](https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/no-ip-redirect-settings?_a=BAMAMiFE0)

### 注意点

以下のことに注意する必要があります ⚠️

- **無料で使用できる期限がある**
  - ログインして認証しないと使えなくなってしまいます（少しやらかしました 😅）

## お名前.com での設定

使用したい（サブ）ドメインに、CNAME レコードを No-IP で取得したドメインに指定します 📝

![お名前.com の CNAME 設定画面](https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/onamae-cname-settings?_a=BAMAMiFE0)

## 動作確認

dig コマンドで確認すると、No-IP で取得したドメインが CNAME で登録されていることがわかります ✅

```bash
$ dig home.yumenomatayume.net

; <<>> DiG 9.10.6 <<>> home.yumenomatayume.net
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 4207
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 1, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
;; QUESTION SECTION:
;home.yumenomatayume.net.		IN	A

;; ANSWER SECTION:
home.yumenomatayume.net.	3600	IN	CNAME	ymmmtym.servebeer.com.

;; AUTHORITY SECTION:
servebeer.com.		41	IN	SOA	nf1.no-ip.com. hostmaster.no-ip.com. 2018412264 90 120 604800 60

;; Query time: 20 msec
;; SERVER: 2408:210:a1c8:5600:20b:a2ff:feb7:afa5#53(2408:210:a1c8:5600:20b:a2ff:feb7:afa5)
;; WHEN: Sat Aug 14 15:58:07 JST 2021
;; MSG SIZE  rcvd: 134
```

## まとめ

DDNS サービスを使用することで、動的に変わる自宅 IP アドレスに対して固定のドメイン名でアクセスできるようになります 🎯

この方法により、自宅サーバーへの外部アクセスが安定して行えるようになります 🚀

## 活用例

- **自宅サーバー**: Web サーバーや開発環境へのアクセス 💻
- **リモートアクセス**: SSH や VPN 接続 🔐
- **IoT デバイス**: 自宅の IoT デバイスへの外部アクセス 📱
