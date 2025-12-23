---
title: "[Qwiklabs] Introduction to AWS Lambda（ハンズオン）を実施してみました ⚡"
description: ""
pubDate: "2021-08-23"
tags: ["qwiklabs","aws","google","lambda","s3","cloudwatch"]
heroImage: "https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/aws-lambda-qwiklabs-1?_a=BAMAMiFE0"
---

<div class="iframely-embed"><div class="iframely-responsive" style="height: 140px; padding-bottom: 0;"><a href="https://www.qwiklabs.com/focuses/16506?catalog_rank=%7B%22rank%22%3A7%2C%22num_filters%22%3A1%2C%22has_search%22%3Atrue%7D&amp;parent=catalog&amp;search_id=12415632" data-iframely-url="//cdn.iframe.ly/BG3AP5t"></a></div></div>

トレーニング内容の再配布はできないため、コースの概要や受講した感想をご紹介します。


## 概要

- ハンズオン形式で Lambda の使い方を学習できます。
- 無料のコースであるため、Google のアカウントがあれば実施できます。

## 構成図

![https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/aws-lambda-qwiklabs-1?_a=BAMAMiFE0](https://imgur.com/QgwyOz3.png)

ユーザーが S3 バケットに画像ファイルをアップロードした時、自動的に Lambda 関数が実行され、その画像ファイルをリサイズして別の S3 バケットにアップロードされます。

その実行ログを CloudWatch で確認できます。

使用するサービスは以下の通りです。

- AWS Lambda
- Amazon S3
- Amazon CloudWatch Logs

## 手順

Qwiklabs をご覧ください🙇🏻‍♀️

## 感想

- Amazon S3 にファイルがアップロードされたことを**トリガー**に、Lambda 関数を実行する仕組みをハンズオン形式で学ぶことができました。
  - Lambda のコードソースの容量が大きく、コードの中身すべてを見ることはできませんでした。
    ![https://res.cloudinary.com/yumenomatayume/image/upload/f_auto,q_auto/v1/yumenomatayume.net/aws-lambda-qwiklabs-2?_a=BAMAMiFE0](https://imgur.com/W8SfeXf.png)
- ハンズオンでは指定の画像ファイルが準備されてますが、環境構築後は任意のファイルをアップロードして Lambda の動作を試すことができます。