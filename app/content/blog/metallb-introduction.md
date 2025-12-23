---
title: "MetalLB を install する手順（L2ネットワーク版） ⚖️"
description: "オンプレミス Kubernetes 環境で LoadBalancer Service を使用するための MetalLB 導入手順"
pubDate: "2021-07-24"
tags: ["metallb","kubernetes","flannel","オンプレミス"]
---

自宅の検証環境でおうち k8s を導入しています 🏠 今回は、オンプレミス環境で LoadBalancer Service を使用するための MetalLB の導入手順をご紹介します。

## MetalLB とは

[MetalLB, bare metal load-balancer for Kubernetes](https://metallb.universe.tf/installation/)

AWS や GCP などのクラウドプロバイダーの場合、Kubernetes の Service を `Type: LoadBalancer` に設定すると、自動的にグローバル IP アドレスを取得してくれます ☁️

しかし、オンプレミス環境の Kubernetes で同様のことをすると Pending になってしまいます 😵 MetalLB を使うことで、`Type: LoadBalancer` と設定した Service に、プライベート IP アドレスを振り分けることができます ✨

今回は、クラスター間のネットワークに flannel を使っているので、L2 ネットワークで IP アドレスを設定します。

## 事前準備

kube-proxy に IPVS mode を使用している且つ Kubernetes v1.14.2 以降のバージョンの場合は、strictARP を有効にする必要があります 🔧（今回は IPVS mode を使用していないため、割愛します）

### strictARP の確認

strictARP が有効になっているかは、以下のコマンドで確認できます：

```bash
kubectl get configmap kube-proxy -n kube-system -o yaml | \
sed -e "s/strictARP: false/strictARP: true/" | \
kubectl diff -f - -n kube-system
```

diff が出力され、以下の出力が含まれていた場合には strictARP が有効になっていないことがわかります：

```bash
-      strictARP: false
+      strictARP: true
```

### strictARP の有効化

以下のコマンドで strictARP を有効にします：

```bash
kubectl get configmap kube-proxy -n kube-system -o yaml | \
sed -e "s/strictARP: false/strictARP: true/" | \
kubectl apply -f - -n kube-system
```

## MetalLB のインストール

Manifest でインストールする場合は、以下の2つを apply します：

```bash
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.10.2/manifests/namespace.yaml
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.10.2/manifests/metallb.yaml
```

これでインストール自体は完了です 🎉 以降は実際にアサインする IP アドレスを設定します。

## Config 設定

Flannel Network のため、L2 Configuration の ConfigMap を作成します 📝

`address-pools` は自分の環境（cluster のアドレスレンジの未使用 IP アドレス）に修正してください。

注意：この `address-pools` は flannel network で使用しているものではなく、Node が持つ IP のものになります ⚠️

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: metallb-system
  name: config
data:
  config: |
    address-pools:
    - name: default
      protocol: layer2
      addresses:
      - 192.168.100.240-192.168.100.250
EOF
```

以上で設定は完了です ✅

## 動作確認

### テスト用 Pod と Service の作成

テスト用の nginx を作成します：

```bash
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: nginx
  name: nginx
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - image: nginx
        name: nginx
---
apiVersion: v1
kind: Service
metadata:
  labels:
    app: nginx
  name: nginx
spec:
  ports:
  - port: 80
    protocol: TCP
    targetPort: 80
  selector:
    app: nginx
  type: LoadBalancer
EOF
```

### 動作確認

```bash
$ kubectl get pod,svc
NAME                                  READY   STATUS    RESTARTS   AGE
pod/nginx-84784697bb-8mhhr            1/1     Running   0          55s
pod/nginx-84784697bb-9x6ft            1/1     Running   0          55s

NAME                     TYPE           CLUSTER-IP      EXTERNAL-IP       PORT(S)        AGE
service/nginx            LoadBalancer   10.105.252.24   192.168.100.240   80:30324/TCP   55s

$ curl 192.168.100.240
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
...
</html>
```

`192.168.100.240` の External-IP を持って動いていることが確認できました ✨ デフォルトでは address pool から若番の IP アドレスが払い出されるようです。

### IP アドレスの指定

`loadBalancerIP` を address pool 内の値に設定することで、IP アドレスを指定することも可能です：

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Service
metadata:
  labels:
    app: nginx
  name: nginx
spec:
  ports:
  - port: 80
    protocol: TCP
    targetPort: 80
  selector:
    app: nginx
  type: LoadBalancer
  loadBalancerIP: 192.168.100.250
EOF
```

結果：

```bash
$ kubectl get svc
NAME             TYPE           CLUSTER-IP      EXTERNAL-IP       PORT(S)        AGE
nginx            LoadBalancer   10.105.59.75    192.168.100.250   80:31629/TCP   3m5s
```

注意：pool 外の IP アドレスを指定すると pending となり IP アドレスが付与されません ⚠️

## まとめ

今回は L2 での MetalLB を試してみました 🎯 次は BGP Configuration（L3）を試してみる予定です。

MetalLB を導入することで、オンプレミス環境でもクラウドと同様に LoadBalancer Service を使用できるようになります 🚀

## 参考文献

- [【手順あり】MetalLBの使い方から動きまで解説します - フラミナル](https://blog.framinal.life/entry/2020/04/16/022042)
- [Kubernetes] オンプレK8sでもtype:LoadBalancer Serviceが使えるようになるMetalLBを入れてみた - zaki work log](https://zaki-hmkc.hatenablog.com/entry/2020/07/10/235944)
- [KubernetesロードバランサーのMetalLBを導入した話(Necoプロジェクト体験入部) - Cybozu Inside Out | サイボウズエンジニアのブログ](https://blog.cybozu.io/entry/2019/03/25/093000)