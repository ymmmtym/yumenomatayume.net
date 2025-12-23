---
title: "SealedSecrets を使ってみた 🔐"
description: "Kubernetes の Secret Manager である SealedSecrets を使ってみました。"
pubDate: "2022-09-05"
tags: ["sealed-secrets", "kubernetes", "kubeseal"]
---

KubernetesでSecretを安全に管理したくて、SealedSecretsを使う機会がありました！インストールから使用方法まで一通りの流れをメモしておきます 📝

## インストール

ここでは、helm（helmfile）を使ってデプロイします。

`./environments/default/values.yaml` を作成した後に、次のような `helmfile.yaml` を作成します：

```yaml
repositories:
  - name: sealed-secrets
    url: https://bitnami-labs.github.io/sealed-secrets

templates:
  default: &default
    chart: sealed-secrets/{{`{{ .Release.Name }}`}}
    namespace: sealed-secrets
    values:
      - "./environments/{{ .Environment.Name }}/values*.yaml"

releases:
  - name: sealed-secrets
    <<: *default
```

apply します。

```yaml
helmfile apply
```

Secret リソースが作成されていることが確認できます。

```bash
❯ kubectl get secrets -n sealed-secrets
NAME                                   TYPE                                  DATA   AGE
default-token-jqzj9                    kubernetes.io/service-account-token   3      12h
sealed-secrets-keydcdkt                kubernetes.io/tls                     2      12h
sealed-secrets-token-plgnb             kubernetes.io/service-account-token   3      12h
sh.helm.release.v1.sealed-secrets.v1   helm.sh/release.v1                    1      12h
```

上記の場合は、 `sealed-secrets-token-plgnb` に公開鍵と秘密鍵のペアが定義されています。
`tls.crt` と `tls.key` に base64 形式でエンコードされた値で格納されています。

```bash
❯ kubectl get secrets -n sealed-secrets -l "sealedsecrets.bitnami.com/sealed-secrets-key=active" -o yaml
apiVersion: v1
items:
- apiVersion: v1
  data:
    tls.crt: !mask
    tls.key: !mask
  kind: Secret
  metadata:
    generateName: sealed-secrets-key
    labels:
      sealedsecrets.bitnami.com/sealed-secrets-key: active
    name: sealed-secrets-keydcdkt
    namespace: sealed-secrets
  type: kubernetes.io/tls
kind: List
metadata:
  resourceVersion: ""
  selfLink: ""
```

SealedSecret リソースを削除した場合などは秘密鍵が更新されるので、上記の鍵をバックアップすることをオススメします。

## SealedSecret リソースの作成

Secret リソースを SealedSecret リソースにパースするためのツール `kubeseal` をインストールします。

```bash
brew install kubeseal
```

sealed-secret で生成された公開鍵を取得します。
`kubeseal` コマンドで実行する場合は以下のようなコマンドになります。

```bash
kubeseal --fetch-cert \
  --controller-namespace=sealed-secrets \
  --controller-name=sealed-secrets \
  > pub-cert.pem
```

`kubectl` コマンドで sealed-secret で作成された Secret リソースを用いて実行する場合は以下になります。

```bash
kubectl get secrets -n sealed-secrets -l "sealedsecrets.bitnami.com/sealed-secrets-key=active" -o json | jq -r .items[].data'["tls.crt"]' | base64 --decode
```

続いて Secret リソースを作成します。

```bash
kubectl -n prometheus create secret generic kubepromsecret \
  --from-literal=username=admin \
  --from-literal=password=admin \
  --dry-run \
  -o yaml > secret.yaml
```

作成された yaml は以下になります。

```yaml
apiVersion: v1
data:
  password: cGFzc3dvcmQK
  username: dXNlcm5hbWUK
kind: Secret
metadata:
  name: kubepromsecret
  namespace: prometheus
type: Opaque
```

SealedSecret リソースを作成します。

```bash
kubeseal --format=yaml --cert=pub-cert.pem < secret.yaml > sealed-secret.yaml
```

すると暗号化された SealedSecret が作成されました。

```bash
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  creationTimestamp: null
  name: kubepromsecret
  namespace: sealed-secrets
spec:
  encryptedData:
    password: AgAHYP044gCzsT85dlnjcH5FCQrZBn71YG3e7ArjEveTwntteQeN2bu1jPnHw3qez4vLTez+QpTsQd6xMFj20Oj4XUqTAsRq36pjg65VI8H6eMhYUlerho5BK5gHt4EFpfpLsPr8ORTq/zzVwAsCpYQeg27ClOt5nJ0+AKCjMNL1N7uKnb1TMl8DBCBWtMWEa+xHHXmQ3fEZC/6AmAoJBgd2bJYR36jxH2Qg6G68qKpkOOzr7h0bVPInGfgzwMT5bdIRt64XTFddVvJ5/pZmBqTFc7Kp1UY7+22IYcyHYaIkuTyPLvnj+jPvd6FeXa6kiTqMvZzRoml39SmCFw9P97r12Kn7zmbZXw1Gh/K02eaCcwjk8ybdC4KXen21mmAqeDHPeK/5G9a7B7l+FZ5DoU8gtklHGVOQoyHZlGfeOyKL6/0/Kv0fP1U8F8AUiBNnyjz2VO2ivkWkeGD0gubF8KoVtDhSzuMoYHHtTMX4R4eKmzZ8EXCmownc2xMF22GYY8JZsNWKtFDNUVfOoq/FRFcNJVEmj7PibYsrw54rb6nODU9ruCuC1walBacrJjEgBQ7IpBNExWw8HisVDzleE2tHa/bDGDy/hxqPsNROrEwwaGzgDWpwTdUKBzGUSxRwIZe8imYMT0UfwRdRPxiR3zvFQd8xPfk8Hi6Tq7gCt4al7RJ7C7b+vDHbBb/XC+PmwLOitSXTRVme+X1Cam/pBZYmsUrSJHNK4hZNmQ5nCZrkpDUUNdTYDAZebQkGqPItOr1RWphjQmzAVdlMI0qUW/agNGce0fAHTAl/WwB/UMMCn6+YGJFMCy2YlAhfSgNUxLk=
    username: AgBr5cg99dAQWhpMhBJOOfUQQP7BZeBQOtb8620lga/kBF9E1vJx9e2W3UuqMlWc+XJUEJmNFv7aEBLH5YlEGBlxf6f7nII1d7zX3F25J4Wb2WLo+GaWbXyu2R8N9L6xdYkoQ/6EpUW9IVxDiMbGQl12mUfg5soWCklyxsQkLoQxzNCj/d+gb3eczGa+N0a1BIEJoAR6watl5wwN1OloPEI8odk/Acuc0SVvVkwgOkTYZX4Ijh9Jkx1heWFgBBbr8K9nibfTS4p9DSHDdJ3fUkBTkKgQV2JucNlcigwwP9dpl0owriTyP+v3chFrHktr8TOoWEOALElMpySLqWpUOhILo17TMtvRNOqDcAMtYBZ+ZJTF056H3ZW3W6VW7WkmZUX/0ECMK3LUoWBlLyQlcgFA73iVtvmHlF3yRBTp9Vj0XuBpqB+PFTbQdjfzahEb4Gh6JvJBFfMWsJCiOuBEZrfg93Nd/XS4w7j6FRmuI/k4Wwd9qwtgRi4MzbGnuVGf00Fu8GMnDCJmpGaOMkRm10uBL1yu4u8CgqOza40cq8JTsy7LFT+IN4w+nCVbe2wwuVT1516XRnZ9kLMfHonFixUMUbCMIc6PcHcQ9IlJajn9EyCQRk7p1233jgoz7QxdGaw2LU/Dhs9+nLu4Da6Jr3MWlGj0+Lk5Wk8I9ce5QUvfPIQRAq1r2lewPH7T0Ed3b/BH1bY4kvc=
    template:
    data: null
    metadata:
      creationTimestamp: null
      name: kubepromsecret
      namespace: sealed-secrets
    type: Opaque
```

この yaml を apply することで、SealedSecret Pod が持っている秘密鍵によって暗号化されたデータが復号化され、Secret リソースが作成されます。

```bash
kubectl apply -f sealed-secret.yaml
```

## 秘密鍵のバックアップとリストア

秘密鍵のバックアップする

```bash
kubectl get secrets -n sealed-secrets -l "sealedsecrets.bitnami.com/sealed-secrets-key=active" -o yaml
```

手元にある秘密鍵に入れ替える

```bash
kubectl replace secret -n sealed-secrets sealed-secret-key -f sealed-secrets-key.yaml
kubectl delete pod -n sealed-secrets -l "app.kubernetes.io/name=sealed-secrets"
```

旧秘密鍵で暗号化した SealedSecret リソースを、新しい鍵に置き換える

```bash
kubeseal --re-encrypt -f sealedsecret.yaml --controller-namespace=sealed-secrets
kubectl apply -f sealedsecret.yaml
```
