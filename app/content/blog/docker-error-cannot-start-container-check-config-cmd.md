---
title: "コンテナが Error: Cannot Start Container で起動できない時に確認すること 🐳"
description: "コンテナのコマンドが存在しないときは docker inspect コマンドで設定を見てみましょう。"
pubDate: "2025-05-08"
tags: ["container", "docker"]
---

`docker inspect` コマンドで設定を確認する。

`Config.Cmd` の箇所を見る。

```bash
> docker pull busybox:latest
latest: Pulling from library/busybox
5bc51b87d4ec: Pull complete
Digest: sha256:d80cd694d3e9467884fcb94b8ca1e20437d8a501096cdf367a5a1918a34fc2fd
Status: Downloaded newer image for busybox:latest
docker.io/library/busybox:latest
❯ docker inspect busybox:latest
[
    {
        "Id": "sha256:3fba0c87fcc8ba126bf99e4ee205b43c91ffc6b15bb052315312e71bc6296551",
        "RepoTags": [
            "busybox:latest"
        ],
        "RepoDigests": [
            "busybox@sha256:9ae97d36d26566ff84e8893c64a6dc4fe8ca6d1144bf5b87b2b85a32def253c7"
        ],
        "Parent": "",
        "Comment": "",
        "Created": "2023-05-18T22:34:17Z",
        "DockerVersion": "",
        "Author": "",
        "Config": {
            "Hostname": "",
            "Domainname": "",
            "User": "",
            "AttachStdin": false,
            "AttachStdout": false,
            "AttachStderr": false,
            "Tty": false,
            "OpenStdin": false,
            "StdinOnce": false,
            "Env": null,
            "Cmd": [
                "sh"
            ],
            "Image": "",
            "Volumes": null,
            "WorkingDir": "",
            "Entrypoint": null,
            "OnBuild": null,
            "Labels": null
        },
        "Architecture": "arm64",
        "Variant": "v8",
        "Os": "linux",
        "Size": 4042262,
        "GraphDriver": {
            "Data": {
                "MergedDir": "/var/lib/docker/overlay2/107720d5b5af33f66c16816566b024ac621f040e2bfb41b6334a698c93cdbc7c/merged",
                "UpperDir": "/var/lib/docker/overlay2/107720d5b5af33f66c16816566b024ac621f040e2bfb41b6334a698c93cdbc7c/diff",
                "WorkDir": "/var/lib/docker/overlay2/107720d5b5af33f66c16816566b024ac621f040e2bfb41b6334a698c93cdbc7c/work"
            },
            "Name": "overlay2"
        },
        "RootFS": {
            "Type": "layers",
            "Layers": [
                "sha256:8e13bc96641a6983e79c9569873afe5800b0efb3993c3302763b9f5bc5fb8739"
            ]
        },
        "Metadata": {
            "LastTagTime": "0001-01-01T00:00:00Z"
        }
    }
]

> docker inspect busybox:latest | jq '.[].Config.Entorypoint'
null
> docker inspect busybox:latest | jq '.[].Config.Cmd'
[
  "sh"
]
```
