---
title: "【Python】 *args と **kwargs の使い方 🐍"
description: "Python の可変長引数 *args と **kwargs の基本的な使い方と実例"
pubDate: "2021-11-25"
tags: ["python"]
---

<!-- DOCTOC SKIP -->

Python で関数を定義する際に、引数の数が決まっていない場合に便利な `*args` と `**kwargs` について解説します 🐍

## 基本的な概念

`*args` と `**kwargs` は、関数を定義するときに**任意の数の引数を受け取る**ときに使用されます。

引数を受け取る際の型は次のようになります：

- `*args`: tuple 型 📦
- `**kwargs`: dict 型 📚

一般的に `args`、`kwargs` と書かれることが多いですが、任意の変数名（`*a`、`**b` など）でも問題ありません。

## 使用例

### *args の使用例

```python
def test_args(*args):
    print(f"引数の数: {len(args)}")
    for i, arg in enumerate(args):
        print(f"引数{i}: {arg}")

# 使用例
test_args("hello", "world", 123)
# 出力:
# 引数の数: 3
# 引数0: hello
# 引数1: world
# 引数2: 123
```

### **kwargs の使用例

```python
def test_kwargs(**kwargs):
    print(f"キーワード引数の数: {len(kwargs)}")
    for key, value in kwargs.items():
        print(f"{key}: {value}")

# 使用例
test_kwargs(name="太郎", age=25, city="東京")
# 出力:
# キーワード引数の数: 3
# name: 太郎
# age: 25
# city: 東京
```

### 両方を組み合わせた使用例

```python
def test_combined(*args, **kwargs):
    print("位置引数:")
    for arg in args:
        print(f"  {arg}")
    
    print("キーワード引数:")
    for key, value in kwargs.items():
        print(f"  {key}: {value}")

# 使用例
test_combined("hello", "world", name="太郎", age=25)
```

## まとめ

`*args` と `**kwargs` を使うことで、柔軟な関数を作成できます ✨ 特にライブラリやフレームワークの開発では頻繁に使用される重要な機能です。
    print(args)
    print(kwargs)

test(1, 2, 3, 4, 5, col=4, row=5)

// (1, 2, 3, 4, 5)
// {'col': 4, 'row': 5}
```

引数の順番は型でまとめないとエラーになります。

```python
def extra_test(*args, **kwargs, *extra_args):
    print(args)
    print(kwargs)
    print(extra_args)

// File "<stdin>", line 1
//    extra_test(1, 2, 3, 4, 5, col=4, row=5, 6)
                                               ^
// SyntaxError: positional argument follows keyword argument
```

## Reference（参考文献）

- [python *args, **kwargs 使い方メモ - Qiita](https://qiita.com/studio_haneya/items/40be89b384c5b6da5f68)