--- 
title: "Tailscale でいつでもおうち kubernetes に VPN アクセス 🏠"
description: "Tailscale は複数端末で無料で使える VPN サービスです。そんな Tailscale をおうち k8s にインストールすれば、いつでもどこでもクラスターにアクセスできます。"
pubDate: "2022-09-14"
tags: ["tailscale", "kubernetes", "vpn"]
---

おうちでKubernetesクラスターを運用しているんですが、外出先からアクセスしたいときがあります。そんなときに便利なのが [Tailscale](https://tailscale.com/) です！🚀

Tailscaleは簡単にVPN環境が構築できるアプリケーションで、VPNを使いたい端末にインストールして起動するだけ。学習コストがかなり低いのが魅力です 😊

**無料プランでも20端末まで使用可能**なので、個人利用や少人数のチームなら無料で十分使えます。Mac、Windows、Linuxなどあらゆるプラットフォームに対応していて、コミュニティーではDockerイメージやHelm Chartも公開されています。

今回はHelm Chartを使っておうちKubernetesに導入して、どこからでもVPNアクセスできる環境を作ってみます！

## Auth Key の作成

まずはTailscaleにログインして、「Settings > Personal Settings > Keys」から **Generate auth key...** をクリックします。

## IP アドレスレンジの取得

ServiceリソースのClusterIPで使用されるIPアドレスのサブネットを取得します。

```bash
SVCRANGE=$(echo '{"apiVersion":"v1","kind":"Service","metadata":{"name":"tst"},"spec":{"clusterIP":"1.1.1.1","ports":[{"port":443}]}}' | kubectl apply -f - 2>&1 | sed 's/.*valid IPs is //')
echo $SVCRANGE
```

## tailscale-relay をインストール

Helm でインストールします。

```bash
helm repo add mvisonneau https://charts.visonneau.fr

helm install \
  tailscale-subnet-router \
  mvisonneau/tailscale-relay \
  --set config.authKey=<YOUR_AUTH_KEY> \
  --set config.variables.TAILSCALE_ADVERTISE_ROUTES=<YOUR_SUBNET_RANGE>
```

以下のリソースが作成されていることが確認できます。

```bash
❯ kubectl -n tailscale get all
NAME                    READY   STATUS    RESTARTS   AGE
pod/tailscale-relay-0   1/1     Running   0          3m6s

NAME                               READY   AGE
statefulset.apps/tailscale-relay   1/1     10m
```

tailscale.com を開いての Machines を確認すると、`tailscale-relay-0` が追加されていることが確認できます。

## Routing 設定

「Edit route settings」より **Subnet routes** を有効にします。

```bash
❯ip r get 10.43.0.0/16
10.43.0.0 dev utun5  src 100.97.218.103
```

Mac で tailscale を起動してみます。疎通確認をしてみます。
（特定の Pod と疎通が取れないので調査中）

## Reference（参考）

[Kubernetes Tutorial: Deploy Tailscale to Kubernetes via Helm or Porter to securely access k8s services by cluster IP. Tailscale is a VPN that creates a secure mesh network between your devices, including your Kubernetes cluster.](https://tailscale.com/blog/kubernetes/)
