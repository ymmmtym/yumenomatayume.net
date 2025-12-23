---
title: "Cosense の UserScript を変更したら全ページが応答しなくなった 😱"
description: "UserScript を変更したら全ページが応答しなくなり自分の Cosense にアクセスできなくなってしまいました。焦ったので一応対応をメモしています。"
pubDate: "2025-10-10"
tags: ["cosense"]
---

きっかけは ChatGPT だった。。😅

Cosense でもダークテーマを使いたいと思って、以下の UserScript を利用していました 🌙

```javascript
document.documentElement.dataset.projectTheme = "default"
  const observer = new MutationObserver(() => {
        document.documentElement.dataset.projectTheme = "default-dark"
  });
observer.observe(document.documentElement, {attribute: true, subtree: true, childList: true})
```

このスクリプトでは常にダークテーマが適用されてしまうため、時間帯によって切り替えられるようにしたいと考えました。

```txt
以下のような Userscript を使ってダークテーマを利用しています。

document.documentElement.dataset.projectTheme = "default"
 const observer = new MutationObserver(() => {
        document.documentElement.dataset.projectTheme = "default-dark"
 });
 observer.observe(document.documentElement, {attribute: true, subtree: true, childList: true})

これを時間帯ごとに変化させたいのですがどうすればいいですか？
```

この質問をしたところ、ChatGPT から以下のスクリプトを使うよう提案されました。

```javascript
// ==UserScript==
// @name         Time-based Theme Switcher
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // テーマを適用する関数
  function applyThemeByTime() {
    const hour = new Date().getHours();
    const isDarkTime = (hour >= 18 || hour < 6); // 18時〜翌6時はダーク

    document.documentElement.dataset.projectTheme = isDarkTime ? 'default-dark' : 'default';
  }

  // 最初にテーマを適用
  applyThemeByTime();

  // DOMが変更されたときに再適用（念のため）
  const observer = new MutationObserver(() => {
    applyThemeByTime();
  });
  observer.observe(document.documentElement, {
    attributes: true,
    childList: true,
    subtree: true
  });

  // 1分ごとに再評価（時をまたいでも切り替わるように）
  setInterval(applyThemeByTime, 60 * 1000);
})();
```

あまり JavaScript に詳しくないため無邪気にこれを設定すると、急に Cosense ページから応答がなくなりました。。。

元に戻そうにもそもそもアクセスができない時間が続き、、途方に暮れていました。

## 対処法

💡 他ユーザーの Cosense のページから、自身の User Settings に移動して User Script を無効化しました

もちろん自分のスペースだけに適用した User Script なので、他ユーザーのページは問題なく閲覧できます。

そのためブラウザで Cosense の適当なページを開いて、User Settings にたどり着けました。一安心☺️

どなたかダークテーマに詳しい方がいたら設定方法を教えてください。
