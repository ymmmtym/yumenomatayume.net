---
title: "軽量な Kubernetes k3s をインストールしてみる 🚀"
description: "軽量 Kubernetes ディストリビューション k3s のインストール手順と設定方法"
pubDate: "2021-08-13"
tags: ["k3s","kubernetes"]
---

軽量な Kubernetes ディストリビューション「k3s」のインストール手順をご紹介します 🚀

## k3s とは

https://k3s.io/

k3s とは、簡単に言うと**軽量の Kubernetes** です ⚡ 通常の Kubernetes と比べて以下の特徴があります：

- **軽量**: メモリ使用量が少ない 💾
- **簡単**: インストールが非常に簡単 ✨
- **高速**: 起動が早い 🏃‍♂️

k3s では、master は **server**、worker は **agent** と呼ばれています。

## 前提条件

今回は Ubuntu 20.04 を 2台（server、agent）使用します 🖥️

## ネットワーク設定

必要に応じて iptables で使用するポートを許可します：

```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 6443 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p udp --dport 8472 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 10250 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 2379 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 2380 -j ACCEPT

sudo netfilter-persistent save
```

### ポートの説明

- **6443**: Kubernetes API server 🔌
- **8472**: Flannel VXLAN 🌐
- **10250**: Kubelet API 📡
- **2379-2380**: etcd 💾

## k3s インストール手順

### 1. Server（Master）のインストール

server で以下を実行します：

```bash
curl -sfL https://get.k3s.io | sh -
sudo cat /var/lib/rancher/k3s/server/node-token # agent で必要な値を出力
```

### 2. Agent（Worker）のインストール

agent で以下を実行します：

```bash
curl -sfL https://get.k3s.io | \
K3S_URL=https://192.168.0.2:6443 \
K3S_TOKEN=K100a6e34789ef7a9a11282e487d2342bc66393b987da6b9f7acc8f98c177cad815::server:28f5c7459ec6121227a58ab757a86874 \
sh -
```

**設定項目**:
- `K3S_URL`: server の IP アドレス（今回は `192.168.0.2`）🎯
- `K3S_TOKEN`: server で取得した token を入力 🔑

以上でインストールは完了です 🎉

## 動作確認

server にログインし、コマンドの頭に `k3s` をつけて `kubectl` コマンドが使用できます：

```bash
k3s kubectl get nodes
```

実行例：

```bash
$ k3s kubectl get nodes
NAME       STATUS   ROLES                  AGE   VERSION
server     Ready    control-plane,master   5m    v1.21.3+k3s1
agent      Ready    <none>                 2m    v1.21.3+k3s1
```

## k3s アンインストール手順

アンインストールは各 node で以下を実行するだけです 🗑️

```bash
# server の場合
/usr/local/bin/k3s-uninstall.sh

# agent の場合
/usr/local/bin/k3s-agent-uninstall.sh
```

## k3s の利点

- **リソース効率**: 通常の Kubernetes より少ないメモリで動作 📊
- **簡単セットアップ**: 1コマンドでインストール完了 ⚡
- **エッジ環境**: IoT デバイスや小規模環境に最適 🌐
- **本格運用**: プロダクション環境でも使用可能 🏢

## まとめ

k3s は軽量でありながら、本格的な Kubernetes 機能を提供します 💡 学習環境や小規模なプロダクション環境に最適な選択肢です。

## 参考文献

- [k3sを知る、動かす、感じる | フューチャー技術ブログ](https://future-architect.github.io/articles/20200929/)
- [Rancher Docs: Quick-Start Guide](https://rancher.com/docs/k3s/latest/en/quick-start/)
- [Oracle Cloudの無料枠だけでKubernetes(k3s)クラスタを構築する | blog.potproject.net](https://blog.potproject.net/2019/11/05/oracle-cloud-kubernetes-k3s-cluster)