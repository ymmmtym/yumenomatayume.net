--- 
title: "Viteって何？使うと何が嬉しいの？実例で理解するモダンビルドツール ⚡"
description: "Viteを使ってみました。"
pubDate: "2024-09-14"
tags: ["vite", "webpack", "javascript"]
---

# 
こんにちは！今回は、最近のJavaScript開発で話題の「Vite（ヴィート）」について、初心者の方にもわかりやすく解説していきます。

## Viteとの出会い

Web開発をしていると、「開発サーバーの起動が遅い...」「ファイルを変更してもブラウザの反映に時間がかかる...」といったストレスを感じたことはありませんか？

私も以前はWebpackを使っていて、プロジェクトが大きくなるにつれて起動に30秒以上かかるようになり、コーヒーを淹れる時間ができてしまうほどでした（笑）

そんな悩みを解決してくれるのが、**Vite**です。

## Viteって何者？

Viteは、Vue.jsの作者であるEvan Youさんが開発した、モダンなJavaScriptプロジェクト向けのビルドツール兼開発サーバーです。

名前の由来はフランス語の「速い」という意味で、その名の通り**とにかく速い**のが特徴です。

### 主な特徴

- **超高速な開発サーバー起動**: ブラウザのネイティブESモジュール機能を活用し、バンドル不要で即座に起動
- **高速なHMR**: ファイル変更時の反映が爆速（Hot Module Replacement）
- **シンプルな設定**: TypeScript、JSX、CSSなどが最初から使える
- **フレームワーク対応**: Vue、React、Svelte、Vanillaなど幅広く対応
- **最適化された本番ビルド**: Rollupベースで高品質なバンドルを生成

## 何が嬉しいの？

### 1. 開発体験が劇的に向上

**起動時間の比較:**
- Webpack: 30秒〜数分（プロジェクト規模による）
- Vite: 2〜3秒

この差、実際に体験すると本当に感動します。朝一番にPCを開いて、コーヒーを淹れて戻ってきたらまだ起動中...なんてことがなくなります。

### 2. 変更が即座に反映される

ファイルを保存したら、ほぼ0.1秒以下でブラウザに反映されます。「保存→待つ→確認」のリズムが「保存→確認」になり、開発のテンポが格段に良くなります。

### 3. 設定が簡単

Webpackの複雑な設定ファイルとはおさらば。Viteなら最小限の設定で、TypeScriptもJSXもすぐに使えます。

## 実際に使ってみよう

### 従来の方法（Viteなし）

昔ながらのHTMLに直接scriptタグを書く方法です。

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
    <title>App</title>
</head>
<body>
    <div id="app"></div>
    <script src="app.js"></script>
</body>
</html>
```

```javascript
// app.js
document.getElementById('app').innerHTML = '<h1>Hello</h1>';
```

**この方法の問題点:**
- モジュール分割が面倒
- TypeScriptやJSXが使えない
- 本番用の最適化（minify等）を自分で設定する必要がある
- CSSの管理も手動

### Viteを使った方法

まずはプロジェクトを作成します。

```bash
# プロジェクト作成（Vanillaテンプレート）
npm create vite@latest my-app -- --template vanilla
cd my-app
npm install

# 開発サーバー起動
npm run dev
```

たったこれだけで、開発環境が整います！

**自動生成されるファイル:**

```javascript
// main.js
import './style.css'

document.querySelector('#app').innerHTML = `
  <h1>Hello Vite!</h1>
  <button id="counter">count is 0</button>
`

let count = 0
document.querySelector('#counter').addEventListener('click', () => {
  count++
  document.querySelector('#counter').textContent = `count is ${count}`
})
```

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Vite App</title>
</head>
<body>
    <div id="app"></div>
    <script type="module" src="/main.js"></script>
</body>
</html>
```

**できるようになること:**
- `import`でモジュールを簡単に分割
- CSSも`import`で読み込める
- TypeScript、JSXもすぐ使える
- `npm run build`で本番用に自動最適化
- ファイル保存で自動リロード

## 実際に使ってみた感想

正直、最初は「また新しいツールか...」と思っていました。でも使ってみたら、もう戻れません。

特に感動したのは、大規模なプロジェクトでも起動が速いこと。以前は「ちょっと確認したいだけなのに起動に時間がかかる...」というストレスがありましたが、Viteならサクッと起動してサクッと確認できます。

チーム開発でも好評で、新しく入ったメンバーから「環境構築が簡単で助かりました！」と言われることが増えました。

## まとめ

Viteは、モダンなJavaScript開発において、開発体験を劇的に向上させてくれるツールです。

**こんな人におすすめ:**
- 開発サーバーの起動や変更反映の遅さにストレスを感じている
- Webpackの設定が複雑で困っている
- これからモダンなJavaScript開発を始めたい
- チームの開発効率を上げたい

まだ使ったことがない方は、ぜひ一度試してみてください。その速さに驚くはずです！

```bash
# とりあえず試してみる
npm create vite@latest my-first-vite
```

それでは、快適なViteライフを！🚀
