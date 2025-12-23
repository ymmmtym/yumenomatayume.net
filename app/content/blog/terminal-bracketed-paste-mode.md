---
title: "ターミナルでペーストしたら不要文字（0~,1~）が入ってしまった時の対処法 💻"
description: "SSH 接続時にペーストで不要な文字が入る bracketed paste mode の解決方法"
pubDate: "2021-09-07"
tags: ["bash","terminal"]
---

SSH でリモートホストに接続してターミナルに文字をペーストした際に、不要な文字が入ってしまう問題の解決方法をご紹介します 🖥️

## 問題の症状

とあるホストに SSH 接続して、Windows Terminal でコマンドをペーストすると、以下のように不要な文字が挿入されてしまいました：

```bash
$ 0~ls -l1~
bash: 0~ls: command not found
```

ペーストした文字の前後に `0~` と `1~` という文字が追加されてしまい、コマンドが正常に実行できません 😵

## 原因

この問題は、ターミナルが **bracketed paste mode**（ブラケットペーストモード）になっていることが原因です 🔍

bracketed paste mode は、ペーストされたテキストを特別な制御文字で囲むことで、ペーストされた内容と手動で入力された内容を区別する機能です。

## 解決方法

以下のコマンドを実行して、bracketed paste mode をオフにします：

```bash
printf "\e[?2004l"
```

このコマンドを実行すると、ペースト時に不要な文字が挿入されなくなります ✅

## 恒久的な解決方法

毎回コマンドを実行するのが面倒な場合は、`.bashrc` や `.zshrc` に以下を追加します：

```bash
# bracketed paste mode を無効化
printf "\e[?2004l"
```

## bracketed paste mode について

bracketed paste mode は本来、以下のような利点があります：

- ペーストされたコードの自動実行を防ぐ 🛡️
- 大量のテキストをペーストする際の安全性向上
- エディタでのペースト時のインデント崩れを防ぐ

ただし、環境によっては今回のような問題が発生することがあります。

## まとめ

SSH 接続時のペーストで不要な文字が入る場合は、bracketed paste mode が原因の可能性が高いです 💡 上記のコマンドで簡単に解決できるので、同様の問題に遭遇した際はお試しください。

## 参考文献

- [Copy-Paste in xfce4-terminal adds 0~ and 1~ - Unix & Linux Stack Exchange](https://unix.stackexchange.com/questions/196098/copy-paste-in-xfce4-terminal-adds-0-and-1)
- [GNU Bashのbracketed pasteの設定 – matoken's meme](https://matoken.org/blog/2020/11/12/gnu-bash-bracketed-paste-settings/)