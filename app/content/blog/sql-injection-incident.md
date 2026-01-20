---
title: "過去に作ったサイトがSQLインジェクションされていた 🚨"
description: "個人開発したWebアプリがサイバー攻撃を受けた体験談と対策について"
pubDate: "2026-01-20"
tags: ["security","sql-injection","web-security","incident"]
---

かなり昔に個人用途で作ったお粗末なアプリがあるのですが、GCPの無料枠で稼働できるスペックのGCEにデプロイしてそのまま放置していました 😅

最近になってふと検証の意味を込めてサーバーを移行しようと思い、DBの中身を見たら心当たりのないデータがたくさんありました 😱

## 発見した不審なデータ

データベースのユーザーテーブルを確認すると、明らかに人間が登録したものではない不審なデータが大量に見つかりました：

```sql
keywoo=# select * from "user" ;
 id  |                                                                                                                              name                                                                                                                               |              password
-----+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+------------------
   2 | yumenomatayume                                                                                                                                                                                                                                                  | sha256$7QAfA2XG$fa634cd0cac83c97c4e7bc618662cf0862e21ce1709417244951f923b2b20c76
   3 | default                                                                                                                                                                                                                                                         | sha256$oBI8kjyD$e98b096db8f46c33ae220a3fa40d0c6f2a90088017cd310aeaa30050725b595c
   4 | Name                                                                                                                                                                                                                                                            | sha256$lZgzpIKN$869d22ee7d964623c2f584abac009e68044b6393947d21ae41d3bccd9d9ed9ad
   5 | Name)"'((,')'(                                                                                                                                                                                                                                                  | sha256$ylht7YAx$2ce48745e3f71b302ff8b49759e6dca1eb26c40f8f24c8068c6ebd0088dd2f88
   6 | Name'BeUNzV<'">qEoHZf                                                                                                                                                                                                                                           | sha256$gBVtY5NA$7773fcf47bbfdffda78f1aad1cd303041b859401872079c46581c147f1521e0e
   7 | Name) AND 8567=2197 AND (6529=6529                                                                                                                                                                                                                              | sha256$LhduKsmM$c23c99fd1b22516b977395e7e3a4b59ae96376763a23683c24ee2c1471217268
   8 | Name) AND 8785=8785 AND (6058=6058                                                                                                                                                                                                                              | sha256$Ps6RDhHl$9a2b9c9a65b4d80145a30e3eb289a486b5e051b6753ea6e74c91e80c68f938cd
   ...
```

見慣れないユーザー名のものがたくさんあると思いましたが、よく見たらSQL文で人間の手によって登録されたものではなかったため、すぐに攻撃されていることを疑いました 🔍

幸い個人情報や機密情報などのデータはサーバーに保存していなかったので、特に焦ることはありませんでした。（本番環境ではなくてよかった 😮‍💨）

結果的にhoneypotみたいになりましたが、いい経験になりました 📚

## 調査

具体的にいつ、どこから、どのような攻撃をされたのかをAIに聞きながら調べていきました 🤖

* DBに登録された値を見て、どのような攻撃をされたのか教えて？
* 攻撃元のIPアドレスを教えて

上記のようなプロンプトを投げていき、調査報告書を作成してもらいました 📋

### 調査報告書

AIが作成してくれた調査報告書の要点：

#### 攻撃の詳細

**攻撃種別**: SQLインジェクション攻撃 + Webアプリケーション脆弱性スキャン

**攻撃発生日時**: 2025年12月9日 17:17:41〜17:17:46 (約5秒間)

#### 攻撃パターン

1. **環境ファイル探索**
   ```txt
   GET /.env
   ```

2. **PHPUnit RCE攻撃**
   ```txt
   POST /vendor/phpunit/phpunit/src/Util/PHP/eval-stdin.php
   ```

3. **Laravel File Manager攻撃**
   ```txt
   GET /vendor/laravel-filemanager/js/script.js
   GET /public/vendor/laravel-filemanager/js/script.js
   ```

4. **Laravel Ignition RCE攻撃**
   ```txt
   GET /_ignition/execute-solution
   GET /public/_ignition/execute-solution
   ```

5. **Git設定探索**
   ```txt
   GET /.git/config
   ```

6. **WordPress脆弱性スキャン**
   ```txt
   GET //wp-includes/wlwmanifest.xml
   GET //xmlrpc.php?rsd
   GET //blog/wp-includes/wlwmanifest.xml
   GET //wordpress/wp-includes/wlwmanifest.xml
   ```

#### 攻撃元IPアドレス

主要な攻撃元はクラウドサーバーからでした：

- **DigitalOcean**: 146.190.x.x, 143.198.x.x, 138.197.x.x
- **AWS**: 13.x.x.x
- **Azure**: 104.40.x.x
- **Linode**: 104.x.x.x

#### 攻撃の影響

- **データベース**: 直接的なSQLインジェクション成功の痕跡なし
- **ファイルアクセス**: 404エラーで機密ファイルへのアクセス阻止
- **システム侵害**: RCE攻撃は失敗（404エラー）

優秀な報告書を作成してもらいました 👏 ログを分析するとSQLインジェクション以外にもたくさん攻撃されていることがわかりました。

## アプリ側での対策

アプリ側で対策すべきことをAIに聞いてみました 🛡️

### 安全な点

✅ **Flask-SQLAlchemyのORMを使用**
- `User.query.filter_by(name=name)` - パラメータ化されたクエリ
- `Site.query.filter_by(name=name, user=user)` - SQLインジェクション対策済み
- 生のSQLを直接実行していない

✅ **パスワードハッシュ化**
- `generate_password_hash()` / `check_password_hash()` 使用

### 問題点

⚠️ **ユーザー名の長さ制限が緩い**

```python
name = db.Column(db.String(1000), unique=True)  # 1000文字は長すぎ
```

攻撃者が`WAITFOR DELAY`のような文字列を登録できてしまった原因です 😓

### 推奨修正

```python
# models/users.py
name = db.Column(db.String(50), unique=True)  # 50文字に制限

# views.py - signupに追加
if len(name) > 50 or not re.match(r'^[a-zA-Z0-9_-]+$', name):
    flash('ユーザ名は英数字とアンダースコア、ハイフンのみ使用可能です（50文字以内）')
    return redirect(url_for('signup'))
```

SQLインジェクション自体は成功していませんが、不正な文字列がDBに保存されてしまっています。入力バリデーションを追加することをお勧めします 💡

## 学んだこと

アプリ作成におけるセキュリティーの甘さによってサイバー攻撃を受けてしまいましたが、実際に攻撃されたことはこれまでなかったので、良い経験となりました 📖

今回は本番環境で稼働しているアプリではなかったため、重要な機密情報などを盗み取られることはありませんでしたが、開発する上では脆弱なコードを書かないようにすることを心がけるきっかけになりました 🎯

### セキュリティ対策のポイント

1. **入力バリデーション**: ユーザー入力は必ず検証する
2. **ORMの活用**: 生のSQLクエリは避ける
3. **ログ監視**: 不審なアクセスを検知する仕組みを作る
4. **定期的な脆弱性チェック**: セキュリティスキャンを実施する
5. **最小権限の原則**: 必要最小限の権限のみ付与する

セキュリティは後回しにしがちですが、開発の初期段階から意識することの大切さを実感しました 🔒
