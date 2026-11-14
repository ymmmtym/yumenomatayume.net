---
title: "[Qwiklabs] Introduction to AWS Identity and Access Management（ハンズオン）を実施してみました 🔐"
description: ""
pubDate: "2021-08-24"
tags: ["qwiklabs","aws","google","iam","s3","ec2"]
heroImage: "https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/aws-iam-qwiklabs-1?_a=BAMAMiFE0"
---

https://www.qwiklabs.com/focuses/18123?catalog_rank=%7B%22rank%22%3A11%2C%22num_filters%22%3A0%2C%22has_search%22%3Atrue%7D&parent=catalog&search_id=12441744

トレーニング内容の再配布はできないため、コースの概要や受講した感想をご紹介します。



## 概要

- ハンズオン形式で IAM(Identity and Access Management) の使い方を学習できます。
- 無料のコースであるため、Google のアカウントがあれば実施できます。

### 実施できること

- IAM ユーザを IAM ユーザグループに割り当てる
- IAM ユーザに正しい権限が付与されているかテストする
  - ログインできること
  - 設定した権限のみの動作が行えること

### 使用するサービス

- AWS IAM
- Amazon EC2
- Amazon S3

## 構成図

3 ユーザと、3 ユーザグループが用意されています。

ユーザグループにはそれぞれ以下のポリシーが設定されています。

- S3 読み取り権限
- EC2 読み取り権限
- EC2 管理権限（特定インスタンスの起動と停止が可能）

これらのユーザグループに、それぞれユーザを割り当てます。

![https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/aws-iam-qwiklabs-1?_a=BAMAMiFE0](https://imgur.com/dNuMVRC.png)

## 手順

詳細はQwiklabs をご覧ください🙇🏻‍♀️

## 感想

- IAM で細かく権限の設定ができることを知りました。
- 権限がない時に各サービスはどのような表示になるのか実際にみることができました。

インスタンスに対して何も権限がないときは、インスタンスが表示されません。

![https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/aws-iam-qwiklabs-2?_a=BAMAMiFE0](https://imgur.com/nL4uSFQ.png)

インスタンスに接続するためにも権限が必要です。

![https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/aws-iam-qwiklabs-3?_a=BAMAMiFE0](https://imgur.com/s1vTe1d.png)