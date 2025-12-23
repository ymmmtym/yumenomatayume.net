---
title: "Mac のネットワークを再起動する 🔄"
description: ""
pubDate: "2021-09-11"
tags: ["mac","network"]
heroImage: "https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/mac-network-restart?_a=BAMAMiFE0"
---

<!-- DOCTOC SKIP -->

ネットワークを再起動するには、
`ip` コマンドで、接続されているの up/down を実行します。

```bash
sudo ip l set dev en0 down
sudo ip l set dev en0 up
```

`ifconfig` コマンドでも実行可能です。

```bash
sudo ifconfig en0 down
sudo ifconfig en0 up
```

## Mac のネットワークを再起動してみる

`en0` インターフェイスに Ethernet がつながっています。

![Mac のネットワーク再起動設定画面](https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/mac-network-restart?_a=BAMAMiFE0)

```bash
$ ip a
lo0: flags=8049<UP,LOOPBACK,RUNNING,MULTICAST> mtu 16384
	inet 127.0.0.1/8 lo0
	inet6 ::1/128
	inet6 fe80::1/64 scopeid 0x1
en0: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500
	ether 68:5b:35:8b:74:78
	inet6 fe80::cc:9692:d023:e4e9/64 secured scopeid 0x4
	inet 192.168.0.3/24 brd 192.168.0.255 en0
utun0: flags=8051<UP,POINTOPOINT,RUNNING,MULTICAST> mtu 1380
	inet6 fe80::cd20:78cd:b806:ab2c/64 scopeid 0xb
utun1: flags=8051<UP,POINTOPOINT,RUNNING,MULTICAST> mtu 2000
	inet6 fe80::f11:d2e5:9bc5:d0b2/64 scopeid 0xc
```

`en0` インターフェイスを落としてみます。

```bash
$ sudo ip l set dev en0 down
Executing: /usr/bin/sudo /sbin/ifconfig en0 down

$ ip a
lo0: flags=8049<UP,LOOPBACK,RUNNING,MULTICAST> mtu 16384
	inet 127.0.0.1/8 lo0
	inet6 ::1/128
	inet6 fe80::1/64 scopeid 0x1
utun0: flags=8051<UP,POINTOPOINT,RUNNING,MULTICAST> mtu 1380
	inet6 fe80::cd20:78cd:b806:ab2c/64 scopeid 0xb
utun1: flags=8051<UP,POINTOPOINT,RUNNING,MULTICAST> mtu 2000
	inet6 fe80::f11:d2e5:9bc5:d0b2/64 scopeid 0xc
```

`en0` インターフェイスを上げてみます。

```bash
$ sudo ip l set dev en0 up
Executing: /usr/bin/sudo /sbin/ifconfig en0 up

$ ip a
lo0: flags=8049<UP,LOOPBACK,RUNNING,MULTICAST> mtu 16384
	inet 127.0.0.1/8 lo0
	inet6 ::1/128
	inet6 fe80::1/64 scopeid 0x1
utun0: flags=8051<UP,POINTOPOINT,RUNNING,MULTICAST> mtu 1380
	inet6 fe80::cd20:78cd:b806:ab2c/64 scopeid 0xb
utun1: flags=8051<UP,POINTOPOINT,RUNNING,MULTICAST> mtu 2000
	inet6 fe80::f11:d2e5:9bc5:d0b2/64 scopeid 0xc
```

少し経つと、`en0` が表示されました。

```bash
$ ip a
lo0: flags=8049<UP,LOOPBACK,RUNNING,MULTICAST> mtu 16384
	inet 127.0.0.1/8 lo0
	inet6 ::1/128
	inet6 fe80::1/64 scopeid 0x1
en0: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500
	ether 68:5b:35:8b:74:78
	inet6 fe80::cc:9692:d023:e4e9/64 secured scopeid 0x4
	inet 192.168.0.3/24 brd 192.168.0.255 en0
utun0: flags=8051<UP,POINTOPOINT,RUNNING,MULTICAST> mtu 1380
	inet6 fe80::cd20:78cd:b806:ab2c/64 scopeid 0xb
utun1: flags=8051<UP,POINTOPOINT,RUNNING,MULTICAST> mtu 2000
	inet6 fe80::f11:d2e5:9bc5:d0b2/64 scopeid 0xc
```

さらに少し待つと、インターネットに接続できました。