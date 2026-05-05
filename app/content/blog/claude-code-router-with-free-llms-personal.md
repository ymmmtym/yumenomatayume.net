---
title: "Claude Code を無料 LLM で使うために CCR を試した話 🚀"
description: "Claude Code で Anthropic 以外のプロバイダーを使うために、環境変数変更と Claude Code Router（CCR）を試しました。個人開発の観点で、OpenRouter・Groq・Gemini の検証結果と CCR を採用した理由をまとめます。"
pubDate: "2026-05-06"
tags: ["Claude Code", "CCR", "OpenRouter", "LLM", "CLI"]
---

Claude Code を使っていると、「Anthropic 以外のモデルも使えたら便利そう」と思うことがあります。特に、無料で試せるモデルを組み合わせられると、個人開発ではかなり助かります ✨

そこで今回は、Claude Code で Anthropic 以外のプロバイダーを使う方法を調べつつ、実際に個人開発環境で試した結果をまとめます。

結論としては、**環境変数を直接切り替える方法も使えるが、最終的には CCR（Claude Code Router）を採用するのがよさそう** という判断になりました。

> **注意**  
> 記事内では OpenRouter 経由で `stepfun/step-3.5-flash:free` を使った検証結果に触れていますが、現在はこのモデルを無料で使える期間が終了しています。この記事は「検証時点ではこうだった」という記録として読んでください。

## 先に結論

今回の調査結果を先にまとめると、次のとおりです。

- Claude Code で Anthropic 以外のプロバイダーを使う方法は主に2つあります
  - 環境変数を変更する
  - CCR を利用する
- 個人開発で継続利用するなら **CCR を採用** するのがよさそうです
- OpenRouter は比較的使いやすかったです
- Groq は `reasoning` / `thinking` 関連の unsupported エラーでうまく動きませんでした
- Gemini は利用できそうでもかなり遅く、コーディング用途では厳しそうでした
- CCR は **ollama にも対応** しているので、今後ローカル LLM を試したくなったときの拡張性もあります

## なぜ Anthropic 以外を使いたいのか

Anthropic 以外のプロバイダーを使うメリットは、単純に **他のモデルを試せること** です。無料枠があるモデルや、用途に合ったモデルを選べるのは大きな魅力です。

一方でデメリットもあります。Claude Code を Claude 以外のモデルで使う場合、**Claude 特有の機能は使えない** ことがあります。たとえば Cowork のような機能は、そのまま同じようには扱えません。

つまり、「Claude Code の UI や操作感を活かしつつ、裏側のモデルを差し替える」ことはできても、完全に同じ体験になるわけではない、という理解がよさそうです。

## 方法1: 環境変数を変更する

まずはシンプルな方法です。Claude Code が参照する `ANTHROPIC_` 系の環境変数を書き換えて、別プロバイダーを利用します。

OpenRouter を使う場合は、たとえば次のように設定できます。

```bash
OPENROUTER_API_KEY="<OpenrouterのAPI KEY>"
ANTHROPIC_BASE_URL="https://openrouter.ai/api"
ANTHROPIC_AUTH_TOKEN="$OPENROUTER_API_KEY"
ANTHROPIC_API_KEY=""
ANTHROPIC_MODEL="stepfun/step-3.5-flash:free"
```

その後、普段どおり `claude` を起動します。

```bash
claude
```

この方法のよいところは、構成がシンプルで切り分けしやすいことです。まず「本当にそのプロバイダーで Claude Code が動くのか」を見るには、この方法がいちばんわかりやすいです 👍

なお、検証時点では `stepfun/step-3.5-flash:free` を使っていましたが、**現在は無料利用期間が終了している** ため、同じ構成をそのまま再現できるとは限りません。実際に試すときは、OpenRouter 上で現在使える無料モデルを確認した方がよさそうです。

## 方法2: CCR を利用する

もうひとつの方法が、[Claude Code Router](https://github.com/musistudio/claude-code-router) を使う構成です。

CCR は、Claude Code からのリクエストを各プロバイダー向けに中継してくれるツールです。毎回環境変数を手で切り替えるより楽で、複数プロバイダーを扱いやすいのが利点です。

今回の調査でも、最終的にはこちらを採用することにしました。

理由はシンプルで、**複数のプロバイダーに対応できるから** です。OpenRouter だけでなく、AI Hub Mix や Dashscope、さらに **ollama にも対応** しているので、将来ローカル LLM を試したくなったときにも広げやすそうです。

## CCR の設定例

`~/.claude-code-router/config.json` には、たとえば次のように書けます。

```json
{
  "Providers": [
    {
      "name": "openrouter",
      "api_base_url": "https://openrouter.ai/api/v1/chat/completions",
      "api_key": "${OPENROUTER_API_KEY}",
      "models": [
        "stepfun/step-3.5-flash:free"
      ],
      "transformer": {
        "use": ["openrouter"]
      }
    },
    {
      "name": "groq",
      "api_base_url": "https://api.groq.com/openai/v1/chat/completions",
      "api_key": "${GROQ_API_KEY}",
      "models": [
        "llama-3.3-70b-versatile",
        "openai/gpt-oss-120b",
        "qwen/qwen3-32b"
      ],
      "transformer": {
        "use": ["openrouter"]
      }
    }
  ],
  "Router": {
    "default": "openrouter,stepfun/step-3.5-flash:free"
  }
}
```

ただしこの設定例も、**`stepfun/step-3.5-flash:free` を無料で使えていた時期の記録** です。今使う場合は、そのままではなく別モデルに置き換える前提で読むのがよさそうです。

また、`ccr ui` を実行するとブラウザから設定でき、保存時にフルコンフィグを生成してくれます。最初の導入ではこちらの方が楽かもしれません。

## 実際に試した結果

個人開発環境で試した範囲では、次のような結果になりました。

- 環境変数の直接設定は OK
- CCR 経由では以下のような結果でした
  - OpenRouter: 最初は NG
    - `export CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING=1` を設定すると OK
  - Groq: NG
  - Gemini: 利用できそうだがかなり遅い

こうして見ると、**OpenRouter は比較的有望、Groq は厳しい、Gemini は動くがつらい** という印象でした。

## コメントからわかったこと

ここからは、検証途中のコメントも含めて整理していきます。

### Groq は再現性高く失敗した

Groq では、たとえば `llama-3.3-70b-versatile` で次のようなエラーが出ました。

```plaintext
property 'reasoning' is unsupported
```

さらに `qwen/qwen3-32b` では、こんなエラーも出ました。

```plaintext
property 'thinking' is unsupported
```

このあたりを見ると、Groq 側の OpenAI 互換 API と、Claude Code / CCR 側が送るリクエスト形式の間にズレがありそうです。  
「OpenAI 互換」と書かれていても完全互換とは限らない、という典型例に見えました。

### OpenRouter は最終的に動いた

いっぽうで OpenRouter は、途中でモデルを切り替えることで普通に会話できる状態まで持っていけました。

```plaintext
❯ /model stepfun/step-3.5-flash:free
  ⎿  Set model to stepfun/step-3.5-flash:free

❯ Hello

⏺ Hello! I'm Claude Code, Anthropic's official CLI. I'm here to help you with software engineering tasks.
```

この結果からも、少なくとも OpenRouter については「まったく使えない」わけではなく、設定や環境差分を丁寧に見れば実用可能だと判断しました。

ただし、ここで使っていた `stepfun/step-3.5-flash:free` は現在そのまま無料では使えないため、今同じことを試すなら別の無料モデル候補を探す必要があります。

### OpenRouter のエラーは adaptive thinking が影響していそう

OpenRouter 利用時には、次のようなエラーが出ました。

```plaintext
Reasoning is mandatory for this endpoint and cannot be disabled.
```

これに対して、次の回避策を入れると動作しました。

```bash
export CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING=1
```

このあたりを見ると、プロバイダーごとの仕様差に加えて、Claude Code 側の思考系パラメータとの相性も見ていく必要がありそうです 🤔

### 環境変数はシェルで直接読み込んだ方が安定した

検証中のコメントでは、環境変数の持たせ方にも差がありました。

- 環境変数を直接読み込むと動作した
- `mise.local.toml` では機能しなかった

実際には次のような形で資格情報を読み込む運用が安定していました。

```bash
bw_unlock
source ~/.config/sheldon/plugins/base/credentials.zsh
```

このあたりは地味ですがかなり重要で、Claude Code 本体や周辺ツールが「どの層の環境変数を見ているか」を意識しないと、切り分けが難しくなります。

## Gemini は使えなくはないが厳しい

Gemini については、使えそうな場面はありました。Google AI Studio の使用量にも反映されていたため、少なくともリクエスト自体は飛んでいたようです。

ただ、体感としてはかなり遅く、反応しないように感じることもありました。Gemini CLI を使った方がよいのではと思ったものの、そちらも遅く、少なくとも今回の用途では「コーディング向けとしては厳しい」という印象でした。

## なぜ最終的に CCR を採用したのか

最終的に CCR を採用した理由は次の3つです。

- 複数プロバイダーをまとめて扱える
- 毎回環境変数を切り替えるより運用が楽
- OpenRouter 以外にも、AI Hub Mix、Dashscope、ollama まで視野に入れられる

特に **ollama に対応している** のは大きいです。今は章を分けて詳しく触れませんが、将来的にローカル LLM を本格的に使いたくなったとき、Claude Code の操作感を保ちながら試しやすくなります。

CCR は、公式ドキュメントや GitHub リポジトリに記載されているように、多くのプロバイダーやモデルに対応しています。OpenRouter、DeepSeek、Ollama、Gemini といった主要プロバイダーに加え、Volcengine、SiliconFlow、ModelScope、Dashscope、AI Hub Mix などにも対応し、用途に合わせて使い分けることができます。また、各プロバイダー向けの transformer も豊富に用意されているため、それぞれの API 仕様に合わせたリクエスト変換が可能です。詳細な対応リストや設定例は、[Claude Code Router の GitHub リポジトリ](https://github.com/musistudio/claude-code-router) を参照してください。

## 今のおすすめ構成

現時点でいちばん現実的だと思っているのは、次の流れです。

### 1. まずは OpenRouter で試す

無料で始めるなら、まずは OpenRouter が有力です。  
環境変数直設定でも、CCR 経由でも、いちばん可能性がありました。

ただし、記事中で触れている `stepfun/step-3.5-flash:free` は現在無料利用期間が終わっているので、実際に試すときは **OpenRouter で現在無料提供されている別モデルを探す前提** になります。

### 2. 安定運用するなら CCR を使う

単発の検証なら環境変数直設定でも十分ですが、日常的に使うなら CCR の方が楽です。

### 3. Groq は今は優先度を下げる

少なくとも今回の検証では、Groq は unsupported エラーが多く、Claude Code と組み合わせるには相性がよくありませんでした。

## まとめ

Claude Code で無料 LLM を使うこと自体は可能でした。  
ただし、実際には「どのプロバイダーが Claude Code 的なリクエストにどこまで対応しているか」がかなり重要です。

今回の検証では、次のように整理できました。

- **OpenRouter**: 現実的に使いやすい
- **Groq**: `reasoning` / `thinking` 系で厳しい
- **Gemini**: 動くが遅い
- **CCR**: 最終採用候補。複数プロバイダー対応と運用のしやすさが強い

無料で始めるなら、まずは OpenRouter。  
そして個人開発で継続的に使うなら、**CCR をベースに組むのがいちばんしっくりきそう** です 🎯

なお、記事内の `stepfun/step-3.5-flash:free` は検証当時の情報で、現在は無料期間が終了しています。いま再現する場合は、モデル名をそのまま使うのではなく、現在利用可能な無料モデルに読み替えるのがおすすめです。

## 参考

- [Claude Code Router](https://github.com/musistudio/claude-code-router)
- [Claude Code Integration - OpenRouter](https://openrouter.ai/docs/guides/coding-agents/claude-code-integration)
- [Vibe coding with Claude Code + Groq + Kimi K2](https://medium.com/@hungry.soul/vibe-coding-with-claude-code-groq-kimi-k2-ef814bbcdac5)
