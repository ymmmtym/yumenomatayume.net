---
title: "自宅KubernetesクラスターのSecret管理ガイド 🔐"
description: "GitOpsを実践する自宅Kubernetesクラスターで、マニフェストに認証情報を残さずにシークレット管理を行う方法"
pubDate: "2026-03-21"
tags: ["kubernetes", "infisical", "secrets", "gitops", "homelab", "terraform"]
---

このガイドでは、GitOpsを実践する自宅Kubernetesクラスターにおいて、マニフェストに認証情報を残さずにシークレット管理を行う方法を説明します。

## 概要

### 課題

- AWSではIRSAを使えばシークレットがコードに残らない
- オンプレミス環境でIRSA相当の仕組みが必要
- クラスター再構築時にもシークレット管理を継続したい
- GitOpsでマニフェストを管理しながら、認証情報は含めたくない

### 選択した解決策

**Infisical + Kubernetes ServiceAccount認証**

- Kubernetes ServiceAccountベースの認証（IRSAと同じ原理）
- Infisical側の設定をTerraformで管理
- Synology NAS上でInfisicalを運用
- マニフェストに認証情報を含めない

## アーキテクチャ

```
Synology NAS
  ├── Infisical (Docker Compose)
  │   ├── PostgreSQL
  │   └── Redis
  └── Vaultwarden (人間用パスワード管理)

    ↓ Terraform管理

Infisical
  ├── Project: kubernetes-homelab
  ├── Environments: prod/staging/dev
  ├── Identity: kubernetes-cluster
  └── Kubernetes Auth設定

    ↓ ServiceAccount認証

Kubernetes Cluster
  ├── Infisical Operator / External Secrets Operator
  ├── Token Reviewer ServiceAccount
  └── Application Pods
```

### 認証フロー

1. PodがServiceAccountトークン（JWT）を取得
2. InfisicalにJWTを送信してログイン
3. InfisicalがKubernetes APIでJWTを検証
4. 検証成功後、Infisicalがアクセストークンを発行
5. PodがアクセストークンでInfisical APIにアクセス
6. シークレットがKubernetes Secretとして同期される

## セットアップ手順

### 1. Synology上のInfisical構築

#### Docker Compose設定

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: infisical-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: infisical
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: infisical
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - infisical-network

  redis:
    image: redis:7-alpine
    container_name: infisical-redis
    restart: unless-stopped
    networks:
      - infisical-network

  infisical:
    image: infisical/infisical:latest
    container_name: infisical
    restart: unless-stopped
    depends_on:
      - postgres
      - redis
    ports:
      - "8080:8080"
    environment:
      # データベース
      DB_CONNECTION_URI: postgresql://infisical:${POSTGRES_PASSWORD}@postgres:5432/infisical
      REDIS_URL: redis://redis:6379
      
      # セキュリティ
      ENCRYPTION_KEY: ${ENCRYPTION_KEY}  # 32文字以上
      AUTH_SECRET: ${AUTH_SECRET}        # 32文字以上
      
      # サイト設定
      SITE_URL: http://synology.local:8080
      
      # SMTP（オプション）
      SMTP_HOST: ${SMTP_HOST}
      SMTP_PORT: 587
      SMTP_USERNAME: ${SMTP_USERNAME}
      SMTP_PASSWORD: ${SMTP_PASSWORD}
      SMTP_FROM_ADDRESS: noreply@yourdomain.com
    volumes:
      - infisical-data:/app/data
    networks:
      - infisical-network

volumes:
  postgres-data:
  infisical-data:

networks:
  infisical-network:
    driver: bridge
```

#### 環境変数ファイル

```bash
# .env
POSTGRES_PASSWORD=<強力なパスワード>
ENCRYPTION_KEY=$(openssl rand -base64 32)
AUTH_SECRET=$(openssl rand -base64 32)
SMTP_HOST=smtp.gmail.com
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=app-password
```

#### 起動

```bash
docker-compose up -d

# 初回アクセス
# http://synology.local:8080
# 管理者アカウントを作成
```

### 2. Kubernetes側の準備

#### Token Reviewer用のServiceAccount作成

```yaml
# k8s/infisical-auth-serviceaccount.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: infisical-auth
  namespace: default
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: infisical-auth-token-review-binding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: system:auth-delegator
subjects:
- kind: ServiceAccount
  name: infisical-auth
  namespace: default
---
apiVersion: v1
kind: Secret
type: kubernetes.io/service-account-token
metadata:
  name: infisical-auth-token
  namespace: default
  annotations:
    kubernetes.io/service-account.name: "infisical-auth"
```

#### 適用とServiceAccountへのリンク

```bash
kubectl apply -f k8s/infisical-auth-serviceaccount.yaml

# ServiceAccountにSecretをリンク
kubectl patch serviceaccount infisical-auth -n default \
  -p '{"secrets": [{"name": "infisical-auth-token"}]}'

# トークンを確認（Terraform実行時に使用）
kubectl get secret infisical-auth-token -n default \
  -o jsonpath='{.data.token}' | base64 -d
```

### 3. Terraform設定

#### ディレクトリ構成

```
terraform/infisical/
├── provider.tf
├── variables.tf
├── main.tf
├── outputs.tf
├── terraform.tfvars.example
└── terraform.tfvars  # .gitignore に追加
```

#### provider.tf

```hcl
terraform {
  required_version = ">= 1.0"
  
  required_providers {
    infisical = {
      source  = "infisical/infisical"
      version = "~> 0.11.0"
    }
  }
}

provider "infisical" {
  host          = var.infisical_url
  client_id     = var.infisical_admin_client_id
  client_secret = var.infisical_admin_client_secret
}
```

#### variables.tf

```hcl
variable "infisical_url" {
  description = "Infisical instance URL"
  type        = string
  default     = "http://synology.local:8080"
}

variable "infisical_admin_client_id" {
  description = "Admin identity client ID"
  type        = string
  sensitive   = true
}

variable "infisical_admin_client_secret" {
  description = "Admin identity client secret"
  type        = string
  sensitive   = true
}

variable "infisical_org_id" {
  description = "Infisical organization ID"
  type        = string
}

variable "kubernetes_api_url" {
  description = "Kubernetes API server URL"
  type        = string
}

variable "kubernetes_ca_cert" {
  description = "Kubernetes cluster CA certificate"
  type        = string
  sensitive   = true
}

variable "token_reviewer_jwt" {
  description = "Token reviewer JWT"
  type        = string
  sensitive   = true
}

variable "allowed_service_accounts" {
  description = "Allowed service account names"
  type        = list(string)
  default     = ["infisical-operator", "external-secrets"]
}

variable "allowed_namespaces" {
  description = "Allowed namespaces"
  type        = list(string)
  default     = ["infisical-operator-system"]
}
```

#### main.tf

```hcl
# プロジェクト作成
resource "infisical_project" "kubernetes" {
  name = "kubernetes-homelab"
  slug = "k8s-homelab"
}

# 環境作成
resource "infisical_project_environment" "production" {
  project_id = infisical_project.kubernetes.id
  name       = "production"
  slug       = "prod"
}

resource "infisical_project_environment" "staging" {
  project_id = infisical_project.kubernetes.id
  name       = "staging"
  slug       = "staging"
}

# Kubernetes認証用のIdentity作成
resource "infisical_identity" "kubernetes_cluster" {
  name   = "kubernetes-cluster"
  role   = "no-access"
  org_id = var.infisical_org_id
}

# Kubernetes Auth設定
resource "infisical_identity_kubernetes_auth" "k8s_auth" {
  identity_id = infisical_identity.kubernetes_cluster.id
  
  kubernetes_host    = var.kubernetes_api_url
  token_reviewer_jwt = var.token_reviewer_jwt
  
  allowed_names      = join(",", var.allowed_service_accounts)
  allowed_namespaces = join(",", var.allowed_namespaces)
  
  kubernetes_ca_certificate = var.kubernetes_ca_cert
  
  access_token_ttl            = 3600
  access_token_max_ttl        = 7200
  access_token_num_uses_limit = 0
  access_token_trusted_ips    = ["0.0.0.0/0"]
}

# Identityをプロジェクトに追加
resource "infisical_project_identity" "k8s_cluster" {
  project_id  = infisical_project.kubernetes.id
  identity_id = infisical_identity.kubernetes_cluster.id
  
  roles = [
    {
      role_slug = "viewer"
      environments = [
        infisical_project_environment.production.slug,
        infisical_project_environment.staging.slug
      ]
    }
  ]
}

# シークレット作成例
resource "infisical_secret" "database_password" {
  for_each = toset(["prod", "staging"])
  
  workspace_id = infisical_project.kubernetes.id
  environment  = each.value
  secret_path  = "/database"
  
  type         = "shared"
  secret_key   = "POSTGRES_PASSWORD"
  secret_value = var.db_passwords[each.value]
}
```

#### outputs.tf

```hcl
output "project_id" {
  description = "Infisical project ID"
  value       = infisical_project.kubernetes.id
}

output "identity_id" {
  description = "Kubernetes cluster identity ID"
  value       = infisical_identity.kubernetes_cluster.id
}

output "environments" {
  description = "Created environments"
  value = {
    production = infisical_project_environment.production.slug
    staging    = infisical_project_environment.staging.slug
  }
}
```

### 4. セットアップスクリプト

```bash
#!/bin/bash
# scripts/setup-infisical.sh
set -euo pipefail

echo "=== Infisical Kubernetes認証セットアップ ==="

# Kubernetes情報取得
echo "→ Kubernetes情報取得中..."
K8S_API_URL=$(kubectl config view --raw --minify --flatten \
  -o jsonpath='{.clusters[0].cluster.server}')
K8S_CA_CERT=$(kubectl config view --raw --minify --flatten \
  -o jsonpath='{.clusters[0].cluster.certificate-authority-data}' | base64 -d)

# Token Reviewer JWT取得
echo "→ Token Reviewer JWT取得中..."
if ! kubectl get secret infisical-auth-token -n default &>/dev/null; then
    echo "❌ Secret 'infisical-auth-token' が見つかりません"
    echo "先にKubernetes側でServiceAccountを作成してください"
    exit 1
fi

TOKEN_REVIEWER_JWT=$(kubectl get secret infisical-auth-token -n default \
  -o jsonpath='{.data.token}' | base64 -d)

# Terraform変数設定
echo "→ Terraform変数設定中..."
export TF_VAR_infisical_admin_client_id="$(pass show homelab/infisical-admin-client-id)"
export TF_VAR_infisical_admin_client_secret="$(pass show homelab/infisical-admin-client-secret)"
export TF_VAR_kubernetes_ca_cert="${K8S_CA_CERT}"
export TF_VAR_token_reviewer_jwt="${TOKEN_REVIEWER_JWT}"
export TF_VAR_infisical_org_id="$(pass show homelab/infisical-org-id)"

# Terraform実行
echo "→ Terraform実行中..."
cd terraform/infisical
terraform init
terraform plan

read -p "Terraform applyを実行しますか？ (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    terraform apply
    echo "✅ セットアップ完了！"
else
    echo "キャンセルされました"
fi
```

### 5. Infisical Operator / External Secrets Operatorのインストール

#### Infisical Operatorの場合

```bash
helm repo add infisical https://dl.cloudsmith.io/public/infisical/helm-charts/helm/charts/
helm repo update

helm install infisical-secrets-operator infisical/secrets-operator \
  --namespace infisical-operator-system \
  --create-namespace
```

#### InfisicalSecretリソースの作成

```yaml
# k8s/apps/myapp/infisical-secret.yaml
apiVersion: secrets.infisical.com/v1alpha1
kind: InfisicalSecret
metadata:
  name: database-credentials
  namespace: production
spec:
  hostAPI: http://synology.local:8080
  
  authentication:
    kubernetesAuth:
      identityId: "<terraform output identity_id>"
      serviceAccountRef:
        name: myapp
        namespace: production
  
  secretsScope:
    projectSlug: k8s-homelab
    envSlug: prod
    secretsPath: /database
  
  managedSecretReference:
    secretName: database-credentials
    secretNamespace: production
    creationPolicy: Owner
```

#### 適用

```bash
kubectl apply -f k8s/apps/myapp/infisical-secret.yaml

# Secretが作成されたか確認
kubectl get secret database-credentials -n production
kubectl describe infisicalsecret database-credentials -n production
```

## クラスター再構築時の手順

### 手順

```bash
# 1. Kubernetes側の準備
kubectl apply -f k8s/infisical-auth-serviceaccount.yaml
kubectl patch serviceaccount infisical-auth -n default \
  -p '{"secrets": [{"name": "infisical-auth-token"}]}'

# 2. Terraform再適用
./scripts/setup-infisical.sh

# 3. Infisical Operatorインストール
helm install infisical-secrets-operator infisical/secrets-operator \
  --namespace infisical-operator-system \
  --create-namespace

# 4. アプリケーションのInfisicalSecretデプロイ
kubectl apply -f k8s/apps/
```

### ポイント

- **Infisical側のデータは保持される**（Synology NAS上）
- Terraform再実行で設定を復元
- マニフェストはGitOpsで管理

## ネットワークセキュリティ

### Synology Firewallでの制限

```bash
# KubernetesノードのIPからのみInfisicalへのアクセスを許可
# Synology DSM > コントロールパネル > セキュリティ > ファイアウォール
```

### NetworkPolicyでの制限

```yaml
# Infisical Operatorのみが外部と通信
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: infisical-operator-egress
  namespace: infisical-operator-system
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: secrets-operator
  policyTypes:
  - Egress
  egress:
  - to:
    - ipBlock:
        cidr: <synology-ip>/32
    ports:
    - protocol: TCP
      port: 8080
  # DNS解決用
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: UDP
      port: 53
```

## トラブルシューティング

### Infisical APIが認証を拒否する

```bash
# Infisical Operatorのログ確認
kubectl logs -n infisical-operator-system \
  deployment/infisical-secrets-operator -f

# InfisicalSecretのステータス確認
kubectl describe infisicalsecret <name> -n <namespace>
```

**確認ポイント:**
- ServiceAccountが`allowed_names`に含まれているか
- Namespaceが`allowed_namespaces`に含まれているか
- Token Reviewer JWTが有効か
- Kubernetes CA証明書が正しいか

### ServiceAccountトークンが見つからない

```bash
# ServiceAccountにSecretが紐付いているか確認
kubectl get serviceaccount infisical-auth -n default -o yaml

# Secretが存在するか確認
kubectl get secret infisical-auth-token -n default

# 手動でリンク
kubectl patch serviceaccount infisical-auth -n default \
  -p '{"secrets": [{"name": "infisical-auth-token"}]}'
```

### Infisicalに接続できない

```bash
# Podからの疎通確認
kubectl run test --rm -it --image=curlimages/curl -- sh
curl -v http://synology.local:8080/api/status

# DNS解決確認
nslookup synology.local
```

## 他の選択肢との比較

### HashiCorp Vault

**メリット:**
- 業界標準、実績豊富
- 動的シークレット生成
- 豊富なエコシステム

**デメリット:**
- Unseal操作が必要（再起動の度に）
- セットアップが複雑
- UIがやや古い

### Sealed Secrets

**メリット:**
- シンプル
- 追加インフラ不要

**デメリット:**
- クラスター再構築時に鍵管理が必要
- 鍵のバックアップ必須

### External Secrets + Bitwarden/Vaultwarden

**メリット:**
- 既存のVaultwardenを活用

**デメリット:**
- Kubernetes ServiceAccount認証非対応
- 初期トークンが必要（鶏と卵問題）

## まとめ

### この構成のメリット

✅ **マニフェストに認証情報不要** - GitOpsフレンドリー  
✅ **Kubernetes ServiceAccount認証** - IRSAと同じ原理  
✅ **クラスター再構築に強い** - Infisical側のデータは保持  
✅ **Terraform管理** - インフラストラクチャとしてのコード  
✅ **環境分離** - prod/staging/devで異なるシークレット  
✅ **運用が楽** - Vaultのようなunseal不要

### 推奨する運用フロー

1. **日常的なシークレット追加・変更** → Infisical UI or Terraform
2. **クラスター構築** → セットアップスクリプト1回実行
3. **アプリケーションデプロイ** → GitOpsで自動
4. **シークレットローテーション** → Infisicalで変更、自動同期

この構成により、自宅Kubernetesクラスターでも本番環境レベルのシークレット管理が実現できます。
