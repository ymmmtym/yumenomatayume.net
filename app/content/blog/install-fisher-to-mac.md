---
title: "Mac に Fisher をインストールする 🐟"
description: "fish shell のプラグインマネージャー Fisher のインストールと使い方"
pubDate: "2021-10-02"
tags: ["fish"]
---

fish shell のプラグインマネージャー「Fisher」のインストール方法と使い方をご紹介します 🚀

## Fisher とは

https://github.com/jorgebucaran/fisher

Fisher とは、**fish shell のプラグインマネージャー**です 🔧

同様のプラグインに oh-my-fish がありますが、Fisher の方が後発であり oh-my-fish のプラグインもインストールできるため、こちらを使用します ✨

## Fisher インストール

ワンライナーを実行するだけでインストールが完了します 💫

```bash
# fish
$ curl -sL https://git.io/fisher | source && fisher install jorgebucaran/fisher
fisher install version 4.3.0
Fetching https://codeload.github.com/jorgebucaran/fisher/tar.gz/HEAD
Installing jorgebucaran/fisher
           /Users/yukihisa/.config/fish/functions/fisher.fish
           /Users/yukihisa/.config/fish/completions/fisher.fish
Installed 1 plugin/s
```

## プラグインの管理

### プラグインの探し方

[awsm.fish](https://github.com/jorgebucaran/awsm.fish) からプラグインを探すことができます 🔍 好みのプラグインを見つけてインストールしてみましょう。

### プラグインのインストール

以下は `z` というプラグインをインストールした例です：

```bash
# fish
$ fisher install jethrokuan/z

fisher install version 4.3.0
Fetching https://codeload.github.com/jethrokuan/z/tar.gz/HEAD
Installing jethrokuan/z
           /Users/yukihisa/.config/fish/functions/__z.fish
           /Users/yukihisa/.config/fish/functions/__z_add.fish
           /Users/yukihisa/.config/fish/functions/__z_clean.fish
           /Users/yukihisa/.config/fish/functions/__z_complete.fish
           /Users/yukihisa/.config/fish/conf.d/z.fish
Installed 1 plugin/s
```

### インストールされたプラグインの確認

```bash
# fish
$ fisher list
jorgebucaran/fisher
jethrokuan/z
```

### プラグインのアンインストール

個別のプラグインを削除する場合：

```bash
# fish
$ fisher remove jethrokuan/z
fisher remove version 4.3.0
To completely erase z's data, remove:
/Users/yukihisa/.local/share/z/data
Removing jethrokuan/z
         /Users/yukihisa/.config/fish/functions/__z.fish
         /Users/yukihisa/.config/fish/functions/__z_add.fish
         /Users/yukihisa/.config/fish/functions/__z_clean.fish
         /Users/yukihisa/.config/fish/functions/__z_complete.fish
         /Users/yukihisa/.config/fish/conf.d/z.fish
Removed 1 plugin/s
```

### 全プラグインのアンインストール

Fisher 自体を含むすべてのプラグインをアンインストールする場合：

```bash
# fish
fisher list | fisher remove
```

## おすすめプラグイン

- **z**: ディレクトリ移動を効率化 📁
- **fzf**: ファジーファインダー 🔍
- **tide**: 美しいプロンプトテーマ 🌊
- **autopair**: 括弧の自動補完 ✏️

## 利点

- **軽量**: 高速で軽量なプラグインマネージャー ⚡
- **互換性**: oh-my-fish のプラグインも使用可能 🔄
- **シンプル**: 直感的なコマンド体系 🎯
- **安定性**: 信頼性の高い動作 🛡️

## まとめ

Fisher を使用することで、fish shell をより便利にカスタマイズできます 💡 豊富なプラグインエコシステムを活用して、自分好みのシェル環境を構築してみてください。

## 参考文献

- [jorgebucaran/fisher: A plugin manager for Fish.](https://github.com/jorgebucaran/fisher)
- [fish shell](https://fishshell.com/)
