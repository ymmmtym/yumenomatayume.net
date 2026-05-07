---
title: "Google Colab で VS Code を使用する 💻"
description: "Google Colab 上で VS Code を使用する2つの方法：SSH接続と colabcode モジュールの使い方"
pubDate: "2021-08-28"
tags: ["vscode","jupyter","colab","google"]
heroImage: "https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/vscode-colab-interface?_a=BAMAMiFE0"
---

Google Colab で VS Code を使用する方法をご紹介します 🚀 普段使い慣れた VS Code の環境で、Google Colab の豊富なリソースを活用できます。

## 使用方法

大きく分けて **2通りの方法**があります：

### 1. ローカルの VS Code から Google Colab に SSH する 🔗
- Google Colab に ssh-server をインストール
- ngrok のアカウント作成とインストール
  - Google Colab はグローバル IP アドレスを持たないので、外部からアクセスできるようにするため

### 2. Google Colab で colabcode モジュールをインストールしてブラウザで使用する 🌐
- より簡単で推奨される方法
- ブラウザ上で VS Code が動作

## 方法1: ローカルの VS Code から SSH 接続

以下の記事に、`ngrok` を使用して SSH する詳細なやり方が記載されています 📚

https://www.takapy.work/entry/2021/08/17/185047

## 方法2: colabcode モジュールを使用（推奨）

こちらの方法がより簡単で実用的です ✨

### 手順1: colabcode のインストール

新規でノートブックを作成して、以下のように記述します：

```python
# notebook
!pip install colabcode
```

実行出力の最後に **[RESTART RUNTIME]** が表示されるので、これをクリックします 🔄

### 手順2: VS Code の起動

以下のブロックを実行します。引数には、VS Code にアクセスするためのパスワードと、Google Drive をマウントするための設定を入れます：

```python
# notebook
from colabcode import ColabCode
ColabCode(password='password', mount_drive=True)
```

### 手順3: 認証とアクセス

実行すると実行出力に以下が含まれます：

- **VS Code の URL** 🌐
- **Google アカウント認証の URL** 🔐
- **アカウント認証用の token の入力フォーム** 📝

#### Google Drive の認証

1. Google アカウント認証の URL へ移動して認証を許可します
2. 許可すると token が出力されるので、それを入力フォームに入れます
3. これにより、Google Drive へのアクセス権限を得ることができます ✅

#### VS Code へのアクセス

VS Code の URL に移動して、設定したパスワードでログインします 🔑

![Google Colab で VSCode を使用している画面](https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/vscode-colab-interface?_a=BAMAMiFE0)

`/content/drive/MyDrive` に Google Drive がマウントされていることが確認できます 📁

## 利点

- **無料の GPU/TPU**: Google Colab の計算リソースを活用 ⚡
- **慣れた環境**: VS Code の使い慣れたインターフェース 🎯
- **Google Drive 連携**: ファイルの保存と共有が簡単 ☁️
- **拡張機能**: VS Code の豊富な拡張機能を利用可能 🔧

## 注意点

- **セッション制限**: Google Colab のセッション時間制限に注意 ⏰
- **ファイル保存**: 重要なファイルは Google Drive に保存 💾
- **リソース制限**: 無料版では使用時間に制限あり ⚠️

## まとめ

colabcode を使用する方法が最も簡単で実用的です 💡 Google Colab の強力な計算リソースと VS Code の使いやすさを組み合わせることで、効率的な開発環境を構築できます。

## 参考文献

- [Google ColabとVS Codeを用いた分析環境運用方法 〜kaggle Tipsを添えて〜](https://www.takapy.work/entry/2021/08/17/185047?utm_source=pocket_mylist)
- [ColabCodeを使って、Google Colabの上でVS Codeを使ってみよう](https://atmarkit.itmedia.co.jp/ait/articles/2108/27/news038.html)