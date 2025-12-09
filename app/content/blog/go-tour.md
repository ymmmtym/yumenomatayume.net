--- 
title: "Go Tour で Go 言語の基礎文法を学ぶ 🚀"
description: "Go Tour で Go 言語を勉強した記録です。実際にコードを実行しながらハンズオン形式で学んだ内容をまとめました。"
pubDate: "2022-09-09"
tags: ["go"]
---

Go Tourは、Go言語の基礎文法を学ぶためのサイトです 📚

実際にコードを実行しながらハンズオン形式で学ぶことができます。英語の本家サイトを日本語に翻訳したプロジェクトがあるので、そちらで進めていきました。

- [A Tour of Go（日本語版）](https://go-tour-jp.appspot.com/welcome/1)
- [A Tour of Go（英語版）](https://go.dev/tour/welcome/1)

> 自身の理解度を深めるために、本家のソースコードと異なる部分があります。

## 学習内容

Go Tourでは以下の内容を学びました：

- Goプログラムの基本的なコンポーネント
- 条件文とループ、switch、deferを使ってコードの流れをコントロールする方法
- 既存の型に基づいて新しい型を定義する方法
- メソッドとインターフェース、オブジェクトとその動作を定義する構造体
- goroutineとchannelの概要とそれらを使ってさまざまな並行処理を実装する方法

## 実行環境

Go Tourで実行されるコードは、実際にはGo Playgroundで実行されています 🎮

[The Go Playground](https://go.dev/play/)

Go Playgroundでは、最新の安定バージョンを使用することができます。

## Go プログラムの基本的なコンポーネント

### Packages, Imports, Exported names

- プログラムは `main` パッケージから開始されます。
- `import` するパッケージはグループ化できます。
- 最初の文字が大文字で始まる名前は、外部のパッケージから参照できるエクスポートされた名前です。

```go
package main

import (
	"fmt"
	"math"
)

func main() {
	fmt.Println(math.Pi)
}
```

### Functions

- `add` 関数は、`int` 型の 2 つの引数を取ります。
- 変数の後ろに型を書きます。
- `関数()` の後ろに戻り値の型を書きます。
- 引数が同じ型であれば、最後の引数のみ型を書くことで省略できます。

```go
package main

import "fmt"

// func add(x, y int) int { と省略できます。
func add(x int, y int) int {
	return x + y
}

func main() {
	fmt.Println(add(42, 13))
}
```

### Multiple results

- 関数は複数の戻り値を返すことができます。

```go
package main

import "fmt"

func swap(x, y string) (string, string) {
	return y, x
}

func main() {
	a, b := swap("hello", "world")
	fmt.Println(a, b)
}
```

### Named return values

- 戻り値に名前をつけることができます。
  - `x, y` の `int` 型にしています。
- `return` ステートメントには何も書かないので、naked return と呼ばれています。
- 長い関数で使用すると、可読性に影響があるので短い関数で使用するべきです。

```go
package main

import "fmt"

func split(sum int) (x, y int) {
	x = sum * 4 / 9
	y = sum - x
	return
}

func main() {
	fmt.Println(split(17))
}
```

x は `int` 型なので、整数 (7) となります。

### Variables

- `var` ステートメントは変数を宣言します。
- 変数が使われなかった場合はエラーが発生します。
  - `i declared but not used`
- （代入せずに）宣言した変数には、デフォルトで以下の値が入ります。（Zero values 参照）
  - `string` 型 → `""`（空文字が入ります）
  - `int` 型 → `0`
  - `bool` 型 → `false`

```go
package main

import "fmt"

var c, python, java bool
var str string

func main() {
	var i int
	fmt.Println(i, c, python, java, str)
}
```

### Variables with initializers

- 変数を宣言する時に、初期化（値を代入）することができます。

```go
package main

import "fmt"

var i, j int = 1, 2

func main() {
	var c, python, java = true, false, "no!"
	fmt.Println(i, j, c, python, java)
}
```

### Short variable declarations

- **関数の中**では、`var` の代わりに `:=` を用いて暗黙的に型宣言できます。
  - 明示的に型宣言せずに、型推論してくれます。
- 関数の外では使用できません。

```go
package main

import "fmt"

func main() {
	var i, j int = 1, 2
	k := 3
	c, python, java := true, false, "no!"

	fmt.Println(i, j, k, c, python, java)
}
```

### Basic types

- 基本型（組み込み型）の一覧です。
  - `bool`
  - `string`
  - `int`, `int8`, `int16`, `int32`(`rune`), `int64`
  - `unit`, `unit8`(`byte`), `unit16`, `unit32`, `unit64`, `unitptr`
  - `float32`, `float64`
  - `complex64`, `complex128`
- `%T` で型のタイプを出力できます。
- `%v` で値を出力できます。

```go
package main

import (
	"fmt"
	"math/cmplx"
)

var (
	ToBe   bool       = false
	MaxInt uint64     = 1<<64 - 1
	z      complex128 = cmplx.Sqrt(-5 + 12i)
)

func main() {
	fmt.Printf("Type: %T Value: %v\n", ToBe, ToBe)
	fmt.Printf("Type: %T Value: %v\n", MaxInt, MaxInt)
	fmt.Printf("Type: %T Value: %v\n", z, z)
}
```

### Zero values

- 初期化（代入）せずに宣言した変数には、デフォルトで以下の値が入ります。
  - `string` 型 → `""`（空文字が入ります）
  - `int` 型 → `0`
  - `bool` 型 → `false`

```go
package main

import "fmt"

func main() {
	var i int
	var f float64
	var b bool
	var s string
	fmt.Printf("%v %v %v %q\n", i, f, b, s)
}
```

### Type conversions

- 型変換には明示的な変換が必要です。
  - `var i int = 42`
  - `var f float64 = float64(i)`
  - `var u uint = uint(f)`
- シンプルに記載できます。
  - `i := 42`
  - `f := float64(i)`
  - `u := uint(f)`

```go
package main

import (
	  "fmt"
	  "math"
)

func main() {
	  x, y := 3, 4
	  f := float64(math.Sqrt(float64(x*x + y*y)))
	  z := uint(f)
	  fmt.Println(x, y, z)
}
```

### Type inference

- 明示的な型を指定しない場合は型推論されます

```go
func main() {
	i := 42           // int
	f := 3.142        // float64
	g := 0.867 + 0.5i // complex128
	fmt.Printf("v is of type %T\n", i)
	fmt.Printf("v is of type %T\n", f)
	fmt.Printf("v is of type %T\n", g)
}
```

### Constants

- 定数は、`const` で宣言します。
- 文字(character)、文字列(string)、boolean、数値(numeric)のみで使えます。
- `:=` で宣言はできません。

```go
const Pi = 3.14

func main() {
	const World = "世界"
	fmt.Println("Hello", World)
	fmt.Println("Happy", Pi, "Day")

	const Truth = true
	fmt.Println("Go rules?", Truth)
}
```

### Numeric Constants

- 数値の定数は高精度の値になります。
- `int` は最大 64bit 保持できます。

```go
const (
	// 100ビット左にシフトして、膨大な数を作成します。
	// つまり、1の後に100個のゼロが続く2進数です。
	Big = 1 << 100
	// もう一度右に99桁シフトすると、1 << 1、つまり2になります。
	Small = Big >> 99
)

func needInt(x int) int { return x*10 + 1 }
func needFloat(x float64) float64 {
	return x * 0.1
}

func main() {
	fmt.Println(needInt(Small))
	fmt.Println(needFloat(Small))
	fmt.Println(needFloat(Big))
}
```

## 条件文とループ、switch、defer を使ってコードの流れをコントロールする方法

### For

- 初期ステートメント、条件式、後処理ステートメントを `;` で分けて記載します。
- 初期ステートメントと後処理ステートメントは省略できます。
  - `;` を省略できます。つまり、`while` ステートメントに当たるものは `for` で記述します。
- 条件式を省略すると、無限ループになります。

```go
func main() {
	sum1 := 0
	sum2 := 1
	for i := 0; i < 10; i++ {
		sum1 += i
	}
	for ; sum2 < 1000; {
	// for sum2 < 1000 { のように、;も省略できます。
	// for { と記述すると無限ループになります。
		sum2 += sum2
	}
	fmt.Println(sum1,sum2)
}
```

### If

- `if` ステートメントも `for` と同様の条件式を記述します。
- 条件の前にステートメントを書くことができます。
  - ここで宣言された変数は、`if` もしくは `else` スコープ内のみ使用できます。

```go
if x < 0 {
	return sqrt(-x) + "i"
}

func pow(x, n, lim float64) float64 {
	if v := math.Pow(x, n); v < lim {
		return v
	} else {
		fmt.Printf("%g >= %g\n", v, lim)
	}
	return lim // vはスコープ外なので使用できません。
}

func pow(x, n, lim float64) float64 {
	if v := math.Pow(x, n); v < lim {
		return v
	}
	return lim
}
```

### Switch

- `if - else` ステートメントのシーケンスを短く書けます。
- ある `case` にマッチしたら、その後は実行されません。
  - 自動的に `break` されます。
- 条件を省略することもできます。
  - `switch true` と同じ結果になります。

```go
switch os := runtime.GOOS; os {
case "darwin":
	fmt.Println("OS X.")
case "linux":
	fmt.Println("Linux.")
default:
	// freebsd, openbsd,
	// plan9, windows...
	fmt.Printf("%s.\n", os)
}

switch {
case t.Hour() < 12:
	fmt.Println("Good morning!")
case t.Hour() < 17:
	fmt.Println("Good afternoon.")
default:
	fmt.Println("Good evening.")
}
```

### Defer

- `defer` で渡した関数の実行を、呼び出し元の関数が `return` するまで遅延できます。
- 複数の `defer` があるときは、LIFO の順番で実行されます。

```go
func main() {
	fmt.Println("counting")

	for i := 0; i < 10; i++ {
		defer fmt.Println(i)
	}

	fmt.Println("done")
}
```

## 既存の型に基づいて新しい型を定義する方法

### Pointers

- Go はポインタ（メモリアドレス）を扱います。
- 変数 `T` のポインタは、`T` 型で、ゼロ値は `nil` です。
- `&` オペレータは、ポインタを引出します。
- `*` オペレータは、ポインタを指す先の変数を表します。
- ポインタ演算はありません。

```go
var p *int

i := 42
p = &i

fmt.Println(*p) // ポインタpを通してiから値を読みだす
*p = 21         // ポインタpを通してiへ値を代入する
```

### Structs

- フィールドの集まりです。
  - 各フィールドで型を宣言できます。
  - フィールドの一部だけを列挙することができます。
- `.` を用いてアクセスできます。
- ポインタを通してアクセスすることができます。
  - `&` をつけると、新しく割り当てられた struct へのポインタを戻します。

```go
package main

import "fmt"

type Vertex struct {
	X int
	Y int
}

var (
	v1 = Vertex{1, 2}  // has type Vertex
	v2 = Vertex{X: 1}  // Y:0 is implicit
	v3 = Vertex{}      // X:0 and Y:0
	q  = &Vertex{1, 2} // has type *Vertex
)

func main() {
	v := Vertex{1, 2}
	v.X = 4
	v.Y = 8
	p := &v
	p.X = 1e9 // (*p).X と書くこともできる
	fmt.Println(v.X, v.Y, v)
	fmt.Println(v1, v2, v3, q)
}
```

### Arrays

- `[n]T` 型は、型 `T` の `n` 個の変数の配列を表します。
  - `[n]T` の後ろに `{}` を書き、その中に配列を書くことで初期化できます。
  - 配列の長さは変更できません。

```go
package main

import "fmt"

func main() {
	var a [2]string
	a[0] = "Hello"
	a[1] = "World"
	fmt.Println(a[0], a[1])
	fmt.Println(a)

	primes := [6]int{2, 3, 5, 7, 11, 13}
	fmt.Println(primes)
}
```

### Slices

- `[]T` は型 `T` のスライスを表します。
  - 配列は固定長ですが、スライスは可変長です。
  - 配列よりも一般的です。
- `a[x:y]` で `x` と `y` を境界に指定してスライスを形成できます。
  - 境界は省略することができます。省略した場合は、境界がなくなるので全て参照されます。
- スライスの要素を変更すると、その元となる配列に対応する要素も変更されます。
- スライスのリテラルは、長さのない配列リテラルのようなものです。
  - スライスを作成するとき、はじめに配列が作成されて、それを参照するように作成されます。

```go
package main

import "fmt"

func main() {
	primes := [6]int{2, 3, 5, 7, 11, 13}

	var t []int = primes[1:4]
	fmt.Println(t)

	names := [4]string{
		"John",
		"Paul",
		"George",
		"Ringo",
	}
	fmt.Println(names)

	a := names[0:2]
	b := names[1:3]
	fmt.Println(a, b)

	b[0] = "XXX"
	fmt.Println(a, b)
	fmt.Println(names)

	q := []int{2, 3, 5, 7, 11, 13}
	fmt.Println(q)

	r := []bool{true, false, true, true, false, true}
	fmt.Println(r)

	s := []struct {
		i int
		b bool
	}{
		{2, true},
		{3, false},
		{5, true},
		{7, true},
		{11, false},
		{13, true},
	}
	fmt.Println(s)
}
```

- スライスには、長さ（ `length` ）と容量（ `capacity` ）があります。
  - 長さは、要素数です。関数 `len()` で値を取得できます。
  - 容量は、スライスの最初から要素を数えて、元となる配列の要素数です。関数 `cap()` で値を取得できます。
- スライスのゼロ値は `nil` です。
  - 長さと容量は 0 です。元となる配列は持っていません。

```go
package main

import "fmt"

func main() {
	s := []int{2, 3, 5, 7, 11, 13}
	printSlice(s)

	// Slice the slice to give it zero length.
	s = s[:0]
	printSlice(s)

	// Extend its length.
	s = s[:4]
	printSlice(s)

	// Drop its first two values.
	s = s[2:]
	printSlice(s)

	// nil
	var s_nil []int
	fmt.Println(s, len(s), cap(s))
	if s == nil {
		fmt.Println("nil!")
	}
}

func printSlice(s []int) {
	fmt.Printf("len=%d cap=%d %v\n", len(s), cap(s), s)
}
```

- 組み込み関数 `make()` で、スライスを作成できます。
  - 2 番目の引数に長さ、3 番目の引数に容量を指定できます。
- スライスは、他のスライスを含む任意の型を含むことができます。
- 組み込み関数 `append()` で、スライスへ要素を追加できます。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	a := make([]int, 5)
	printSlice("a", a)

	b := make([]int, 0, 5)
	printSlice("b", b)

	c := b[:2]
	printSlice("c", c)

	d := c[2:5]
	printSlice("d", d)

	// Create a tic-tac-toe board.
	board := [][]string{
		[]string{"_", "_", "_"},
		[]string{"_", "_", "_"},
		[]string{"_", "_", "_"},
	}

	// The players take turns.
	board[0][0] = "X"
	board[2][2] = "O"
	board[1][2] = "X"
	board[1][0] = "O"
	board[0][2] = "X"

	for i := 0; i < len(board); i++ {
		fmt.Printf("%s\n", strings.Join(board[i], " "))
	}

	// Append
	e := make([]int, 3)
	e = append(e, 1)
	printSlice("e", e)

	e = append(e, 2, 3, 4)
	printSlice("e", e)
}

func printSlice(s string, x []int) {
	fmt.Printf("%s len=%d cap=%d %v\n",
		s, len(x), cap(x), x)
}
```

### Range

- `for` 文に利用する `range` は、スライスやマップの値を反復処理に利用できます。
  - スライスを繰り返す場合、2 つの変数を返します。
    - 1 つ目が、インデックスです。
    - 2 つ目が、値（インデックスの場所の要素のコピー）です。
  - インデックスや値は、 `_` へ代入することで捨てることができます。
    - インデックスのみ必要な場合、引数を 1 つに省略できます。

```go
package main

import "fmt"

var pow = []int{1, 2, 4, 8, 16, 32, 64, 128}

func main() {
	for i, v := range pow {
		fmt.Printf("2**%d = %d\n", i, v)
	}

	powpow := make([]int, 10)
	for i := range powpow {
		powpow[i] = 1 << uint(i) // == 2**i
	}
	for _, value := range powpow {
		fmt.Printf("%d\n", value)
	}
}
```

### Maps

- いわゆる辞書型です。
- マップのセロ値は `nil` です。
- `make()` 関数は、指定された型のマップを初期化します。
- map リテラルは key が必要です。
- リテラルの要素から型を推測できます。
- マップ `m` の操作は次の通りです。
  - `m[key] = elem` → 挿入や更新をします。
  - `elem = m[key]` → 要素を取得します。
  - `delete(m, key)` → 要素を削除します。
  - `elem, ok = m[key]` → 要素の存在確認をします。
    - 変数を宣言していなければ、`elem, ok := m[key]` と短く宣言できます。
    - 要素がある場合 → `elem` に値、`ok` に `true` が入ります。
    - 要素がない場合 → `elem` はゼロ値、`ok` に `false` が入ります。

```go
package main

import "fmt"

type Vertex struct {
	Lat, Long float64
}

var m = map[string]Vertex{
	"Bell Labs": Vertex{
		40.68433, -74.39967,
	},
	"Google": Vertex{
		37.42202, -122.08408,
	},
}

// 以下のように書くことで、リテラルの要素から型を推測します。
// var m = map[string]Vertex{
// 	"Bell Labs": {40.68433, -74.39967},
// 	"Google":	{37.42202, -122.08408},
// }

func main() {
	fmt.Println(m)

	map1 := make(map[string]int)

	map1["Answer"] = 42
	fmt.Println("The value:", map1["Answer"])

	map1["Answer"] = 48
	fmt.Println("The value:", map1["Answer"])

	delete(map1, "Answer")
	fmt.Println("The value:", map1["Answer"])

	v, ok := map1["Answer"]
	fmt.Println("The value:", v, "Present?", ok)
}
```

### Function

- 関数も変数の 1 つです。
  - 引数、戻り値として利用できます。
- 関数はクロージャです。

```go
package main

import "fmt"

func adder() func(int) int {
	sum := 0
	return func(x int) int {
		sum += x
		return sum
	}
}

func main() {
	pos, neg := adder(), adder()
	for i := 0; i < 10; i++ {
		fmt.Println(
			pos(i),
			neg(-2*i),
		)
	}
}
```

## メソッドとインターフェース、オブジェクトとその動作を定義する構造体

### Methods

- Go にはクラスがありませんが、任意の型にメソッドを定義できます。
- レシーバは、`func` とメソッド名の間に引数のリストで表現します。
- レシーバを伴うメソッドの宣言は、レシーバ型が同じパッケージにある必要があります。

```go
package main

import (
	"fmt"
	"math"
)

type MyFloat float64

func (f MyFloat) Abs() float64 {
	if f < 0 {
		return float64(-f)
	}
	return float64(f)
}

func main() {
	f := MyFloat(-math.Sqrt2)
	fmt.Println(f.Abs())
}
```

### Pointer receivers

- ポインタレシーバでメソッドを宣言できます。
- レシーバ自身を更新することが多いため、変換レシーバより一般的に使用されます。
  - メソッドがレシーバが指す先の変数を変更するためです。
  - メソッドの呼び出しごとに変数のコピーを避けるためです。
- `main` で宣言した変数を変更するためには、メソッドはポインタレシーバにする必要があります。

```go
package main

import (
	"fmt"
	"math"
)

type Vertex struct {
	X, Y float64
}

func (v Vertex) Abs() float64 {
	return math.Sqrt(v.X*v.X + v.Y*v.Y)
}

func (v *Vertex) Scale(f float64) {
	v.X = v.X * f
	v.Y = v.Y * f
}

func main() {
	v := Vertex{3, 4}
	v.Scale(10)
	fmt.Println(v.Abs())
}
```

### Interface

- メソッドのシグネイチャーの集まりを定義します。
- 型にメソッドを実装することで、インターフェースを実装します。
- インターフェースの値は、値と具体的な型のタプルのように考えることができます。
  - `(value, type)`
- 値が `nil` の場合、メソッドは `nil` をレシーバーとして呼び出されます。
  - 処理が記述されていない場合は、ランタイムエラーになります。
- 空のインターフェースは任意の型を保持できます。

```go
package main

import "fmt"

type I interface {
	M()
}

type T struct {
	S string
}

// このメソッドは、型 T がインターフェース I を実装することを意味します。
// しかし、明示的に宣言する必要はありません。
func (t T) M() {
	fmt.Println(t.S)
}

func main() {
	// var i = T{"hello"} と省略でき、明示的にインターフェースを宣言する必要はありません。
	var i I = T{"hello"}
	i.M()
}
```

### Type assertions

- インターフェースの値の基になる具体的な値を利用する手段を提供します。
- インターフェースの値が、具体的な型を保持し、基になる値を変数に代入します。
- 2 つの値を返すことができます。
  - 1 つ目：基となる値が返されます。
  - 2 つ目：アサーションが成功したかブール値で返されます。
- `switch` は任意の型アサーションを直列に使用できます。
  - `switch` 文と違い、`case` は型を指定します。

```go
package main

import "fmt"

func do(i interface{}) {
	switch v := i.(type) {
	case int:
		fmt.Printf("Twice %v is %v\n", v, v*2)
	case string:
		fmt.Printf("%q is %v bytes long\n", v, len(v))
	default:
		fmt.Printf("I don't know about type %T!\n", v)
	}
}

func main() {
	var i interface{} = "hello"

	s := i.(string)
	fmt.Println(s)

	s, ok := i.(string)
	fmt.Println(s, ok)

	f, ok := i.(float64)
	fmt.Println(f, ok)

	f = i.(float64) // panic
	fmt.Println(f)


	do(21)
	do("hello")
	do(true)
}
```

### Stringer

- `stringer` インターフェースは、最もよく使われるインターフェースの 1 つです。
  - 変数を文字列で出力するためのインターフェースです。

```go
package main

import "fmt"

type Person struct {
	Name string
	Age  int
}

func (p Person) String() string {
	return fmt.Sprintf("%v (%v years)", p.Name, p.Age)
}

func main() {
	a := Person{"Arthur Dent", 42}
	z := Person{"Zaphod Beeblebrox", 9001}
	fmt.Println(a, z)
}
```

### Errors

- `fmt.Stringer` に似た組み込みインターフェースです。
- エラーが `nil` かどうかを確認し、エラーバンドルします。

```go
package main

import (
	"fmt"
	time
)

type MyError struct {
	When time.Time
	What string
}

func (e *MyError) Error() string {
	return fmt.Sprintf("at %v, %s",
		e.When,
		e.What)
}

func run() error {
	return &MyError{
		time.Now(),
		"it didn't work",
	}
}

func main() {
	if err := run(); err != nil {
		fmt.Println(err)
	}
}
```

### Readers

- `io` パッケージは、データストリームを読み込む `io.Reader` インターフェースを規定しています。

```go
package main

import (
	"fmt"
	"io"
	"strings"
)

func main() {
	r := strings.NewReader("Hello, Reader!")

	b := make([]byte, 8)
	for {
		n, err := r.Read(b)
		fmt.Printf("n = %v err = %v b = %v\n", n, err, b)
		fmt.Printf("b[:n] = %q\n", b[:n])
		if err == io.EOF {
			break
		}
	}
}
```

### Images

- `Image` パッケージは、`Image` インターフェースを定義しています。

```go
package main

import (
	"fmt"
	"image"
)

func main() {
	m := image.NewRGBA(image.Rect(0, 0, 100, 100))
	fmt.Println(m.Bounds())
	fmt.Println(m.At(0, 0).RGBA())
}
```

## goroutine と channel の概要とそれらを使ってさまざまな並行処理を実装する方法

### Goroutines

- Go のライタイムに管理される軽量なスレッドです。

```go
package main

import (
	"fmt"
	time
)

func say(s string) {
	for i := 0; i < 5; i++ {
		time.Sleep(100 * time.Millisecond)
		fmt.Println(s)
	}
}

func main() {
	go say("world")
	say("hello")
}
```

### Channels

- チャネルオペレータ `<-` を用いて値の送受信ができます。
- チャネルはバッファとして使えます。

```go
package main

import "fmt"

func sum(s []int, c chan int) {
	sum := 0
	for _, v := range s {
		sum += v
	}
	c <- sum // send sum to c
}

func main() {
	s := []int{7, 2, 8, -9, 4, 0}

	c := make(chan int)
	go sum(s[:len(s)/2], c)
	go sum(s[len(s)/2:], c)
	x, y := <-c, <-c // receive from c

	fmt.Println(x, y, x+y)
}
```

## その他

### ローカル環境での実施

Go Tour は、ローカル環境でも動かせると書いてありますが、
実際に提示されたコマンドを実行してもうまくいきませんでした。

```bash
$  go tool tour
go tool: no such tool "tour"
$  go get github.com/atotto/go-tour-jp/gotour
$  gotour
golang.org/x/tour/gotour has moved to golang.org/x/tour
```

使用できない不要なパッケージは、以下のように削除できます。

```bash
go clean -i github.com/atotto/go-tour-jp/gotour
```

> Note: Go playground上の時間は、いつも "2009-11-10 23:00:00 UTC" です。 この値の意味は、読者の楽しみのために残しておきます(^^)

## 参考資料

- [A Tour of Go（日本語版）](https://go-tour-jp.appspot.com/welcome/1)
- [A Tour of Go（英語版）](https://go.dev/tour/welcome/1)

