---
title: "【Gatsby】 個人ブログ記事のテンプレートファイルを Go 言語で作成する 📝"
description: ""
pubDate: "2021-09-07"
tags: ["go","gatsby","blog"]
---

https://blog.yumenomatayume.net/

https://github.com/ymmmtym/blog

Gatsby で個人ブログを運営しております。
ブログ記事は markdown ファイルで管理していますが、記事を新規作成するとき、「前回の記事のファイルをコピーして書き換える」ということを行っており、少し手間だと感じたので CLI で作成できるようにしました。

たとえば、zenn だと `npx zenn new:article` コマンドで新規記事を作成できます。

https://github.com/zenn-dev/zenn-editor


## 記事ファイルの構成について

`src/content/` ディレクトリに `YYYY-MM-DD-title.md` というファイル名で記事を管理しています。

記事の頭にはメタデータが特定のルールで記載しています。

```yaml
---
templateKey: blog-post # 固定
id: 2021/08/19/01 # YYYY/MM/DD/その日に書いた記事の順番
title: GitHub Actions の schedule が停止した時の再開方法 # 記事のタイトル、h1扱い
slug: /2021/08/19/01
date: 2021-08-19T21:30:00+09:00
headerImage: "https://imgur.com/z1NIlzb.png" # アイキャッチの画像
description: ""
tags: # タグをリストで記載
  - github
  - github-actions
---
```

https://blog.yumenomatayume.net/about#%E3%83%A1%E3%82%BF%E3%83%87%E3%83%BC%E3%82%BF%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6

これを毎回手入力で作成するのは手間なので、テンプレートを用意して効率的に作成する準備をします。

## テンプレートファイルを作成するスクリプトの準備

勉強も兼ねて、Go 言語で実装してみます。実現したい要件は以下の通りです。

- 引数として、メタデータを受け取る -> `flag` パッケージ
- 引数がない場合は、デフォルトの値に設定される -> `yaml` パッケージ
  - `id`  や `date` などは自動で取得する -> `time` パッケージ

作成したスクリプトは以下のようになりました。[^1]

```go
package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/goccy/go-yaml"
)

var ( // 使用する引数とそれに必要な変数
	templateKey string
	timeNow     string
	id          string
	title       string
	slug        string
	date        string
	headerImage string
	description string
	tags        string
	number      string
	name        string
	path        string
	arr         []string
	toc         bool
)

const ( // doctocより目次を作る時に必要な記載内容
	toc_exist_txt string = `
## `package.json` にスクリプト実行コマンドを追記

`go build ./bin/create-template-content.go` を実行して、バイナリ実行ファイルをビルドします。
`./bin/create-template-content` が作成されるので、`package.json` の `scripts` に以下の内容を追記します。

```json
  "scripts": {
    "content:new": "./bin/create-template-content"
```

これで、`npm run content:new` を実行するだけで、新規記事を作成できます。

`npm run` コマンドで引数を使う場合は、引数の前に `--`  が必要です。
渡した後の引数は、ダブルクウォートで囲まれるように変換されるので、引数にバッククウォートや環境変数があるとうまく動作してくれないようです。

```bash
$ npm run content:new -- -name=terminal-bracketed-paste-mode -title='ターミナルでペーストしたら不要文字（`0~`, `1~`）が入ってしまった時の対処法'

> blog@1.0.0 content:new
> ./bin/create-template-content "-name=terminal-bracketed-paste-mode" "-title=ターミナルでペーストしたら不要文字（`0~`, `1~`）が入ってしまった時の対処法"

sh: 0~: command not found
sh: 1~: command not found
date: 2021-09-07T17:07:23+09:00
description: ""
headerImage: /images/gatsby-template-creation.jpg
id: 2021/09/07/01
slug: /2021/09/07/01
tags:
- ""
templateKey: blog-post
title: ターミナルでペーストしたら不要文字（, ）が入ってしまった時の対処法

✔ Created src/content/2021-09-07-terminal-bracketed-paste-mode.md
```

個人で使う分には、`./bin/create-template-content` をそのまま実行した方が楽かもしれないです。

## Reference（参考文献）

やりたいことの方向性は、以下の記事を参考にしました。

- [Gatsby製のマークダウンブログで記事ファイルをテンプレートから自動生成する | きむそん.dev](https://kimuson.dev/blog/gatsby/gatsby_markdown_template/)

デフォルトのアイキャッチ画像は以下で作成しました。

- [5分でできる簡単アイキャッチ画像の作り方！WordPressブログの設定方法まで徹底解説 | 初心者のためのブログ始め方講座](https://www.xserver.ne.jp/blog/wordpress-blog-eyecatching/#%EF%BC%91%EF%BC%8ECanva%E3%81%AB%E3%83%AD%E3%82%B0%E3%82%A4%E3%83%B3%E3%81%99%E3%82%8B)

Go 言語について

- [golang でコマンドライン引数を使う - Qiita](https://qiita.com/nakaryooo/items/2d0befa2c1cf347800c3)
- [Go言語(golang) ファイルの読み書き、作成、存在確認、一行ずつ処理、コピー など - golangの日記](https://golang.hateblo.jp/entry/2018/11/09/163000#%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%81%AE%E4%BD%9C%E6%88%90%E8%AA%AD%E3%81%BF%E6%9B%B8%E3%81%8D%E4%B8%A1%E6%96%B9---Create)
- [Goでコマンドラインツールを試す - abcdefg.....](https://pppurple.hatenablog.com/entry/2018/07/31/030631)

- [Go-lang 自習 10日目「コマンドライン引数」｜かずさん@コミュニティ・エンジニア｜note](https://note.com/llc_luck/n/n6def27924313)
- [go/format.go at master · golang/go](https://github.com/golang/go/blob/master/src/time/format.go)
- [Go 言語で複数行にまたがる文字列を作る - nise_nabeの日記](https://nisenabe.hatenablog.com/entry/2013/06/09/155207)

NPM

- [npm runでコマンドライン引数を渡す方法 - Qiita](https://qiita.com/qrusadorz/items/db042f65be95f34d6271)

[^1]: 絶賛リファクタリング中です。
