---
title: "Go 言語でゼロ埋めする方法 🔢"
description: "Go 言語で数値を指定桁数でゼロ埋めする fmt パッケージの使い方"
pubDate: "2021-09-08"
tags: ["go"]
---

<!-- DOCTOC SKIP -->

Go 言語で数値を指定した桁数でゼロ埋めする方法をご紹介します 🔢

## 基本的な使い方

fmt パッケージを使って、以下のように記述できます：

```go
package main

import "fmt"

func main() {
    // Printf を使用した場合
    fmt.Printf("%02d", 1)
    // 出力: 01

    // Sprintf を使用して文字列として取得
    s := fmt.Sprintf("%04d", 1)
    fmt.Println(s)
    // 出力: 0001
}
```

## フォーマット指定子の説明

- `%02d`: 2桁でゼロ埋め
- `%04d`: 4桁でゼロ埋め
- `%08d`: 8桁でゼロ埋め

数字の部分を変更することで、任意の桁数でゼロ埋めできます ✨

## 実用例

```go
// 連番ファイル名の生成
for i := 1; i <= 10; i++ {
    filename := fmt.Sprintf("file_%03d.txt", i)
    fmt.Println(filename)
}
// 出力: file_001.txt, file_002.txt, ..., file_010.txt
```

このように、ファイル名の連番生成などで活用できます 📁

## 参考文献

- [Go言語でゼロ埋め【zero padding】【golang】 - DRYな備忘録](https://otiai10.hatenablog.com/entry/2014/06/15/000217)