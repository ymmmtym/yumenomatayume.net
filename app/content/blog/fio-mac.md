---
title: "Mac に接続したボリュームの性能を比較してみた 📊"
description: "fio というツールを使って、Mac のルートボリューム・HDD・SSD・Google Drive でボリュームの性能を比較してみました。"
pubDate: "2022-09-06"
heroImage: ""
tags: ["fio", "storage"]
---

Macに色々なストレージを接続しているんですが、「実際どれくらい性能差があるんだろう？」と気になったので、`fio` というツールを使って性能比較をしてみました！📈

測定に使った設定ファイルはこちら：

```plain text
[random-read]
rw=randread
size=1000m
directory=/path/to/readfile
```

## 比較対象・構成

`directory=/path/to/readfile` を、それぞれ以下のボリュームに設定して性能を比較しました：

- **Mac ルートボリューム**：内蔵SSD
- **Google Drive**：`/Volumes` にマウント済み
- **HDD**：`/Volumes` にマウント、USBハブ経由で接続
- **SSD**：`/Volumes` にマウント、USBハブ経由で接続

## 結果

意外な結果が出ました！🤔

**Google Drive > Mac > SSD > HDD**

Google Driveが一番速いという驚きの結果に...これはキャッシュの影響かもしれませんね。

## 詳細ログ

### ルートボリューム
```bash
❯ fio random-read.fio
random-read: (g=0): rw=randread, bs=(R) 4096B-4096B, (W) 4096B-4096B, (T) 4096B-4096B, ioengine=psync, iodepth=1
fio-3.29
Starting 1 process
random-read: Laying out IO file (1 file / 1000MiB)
Jobs: 1 (f=1): [r(1)][100.0%][r=106MiB/s][r=27.2k IOPS][eta 00m:00s]
random-read: (groupid=0, jobs=1): err= 0: pid=66536: Thu Jan 20 12:34:10 2022
  read: IOPS=19.3k, BW=75.3MiB/s (79.0MB/s)(1000MiB/13272msec)
    clat (nsec): min=0, max=5999.0k, avg=51588.51, stdev=82894.72
     lat (nsec): min=0, max=6000.0k, avg=51613.29, stdev=82895.28
    clat percentiles (nsec):
     |  1.00th=[      0],  5.00th=[   1004], 10.00th=[   1004],
     | 20.00th=[   1004], 30.00th=[   1004], 40.00th=[  70144],
     | 50.00th=[  75264], 60.00th=[  77312], 70.00th=[  79360],
     | 80.00th=[  81408], 90.00th=[  83456], 95.00th=[  84480],
     | 99.00th=[  91648], 99.50th=[ 111104], 99.90th=[1777664],
     | 99.95th=[1974272], 99.99th=[2867200]
   bw (  KiB/s): min= 3473, max=124208, per=99.07%, avg=76437.73, stdev=21134.22, samples=26
   iops        : min=  868, max=31052, avg=19109.15, stdev=5283.54, samples=26
  lat (nsec)   : 2=1.93%
  lat (usec)   : 2=33.55%, 4=3.13%, 10=0.01%, 20=0.01%, 50=0.12%
  lat (usec)   : 100=60.55%, 250=0.53%, 500=0.04%, 750=0.01%, 1000=0.01%
  lat (msec)   : 2=0.09%, 4=0.04%, 10=0.01%
  cpu          : usr=0.91%, sys=9.11%, ctx=158373, majf=0, minf=11
  IO depths    : 1=100.0%, 2=0.0%, 4=0.0%, 8=0.0%, 16=0.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued rwts: total=256000,0,0,0 short=0,0,0,0 dropped=0,0,0,0
     latency   : target=0, window=0, percentile=100.00%, depth=1

Run status group 0 (all jobs):
   READ: bw=75.3MiB/s (79.0MB/s), 75.3MiB/s-75.3MiB/s (79.0MB/s-79.0MB/s), io=1000MiB (1049MB), run=13272-13272msec
```

### Google Drive
```bash
❯ fio random-read.fio
random-read: (g=0): rw=randread, bs=(R) 4096B-4096B, (W) 4096B-4096B, (T) 4096B-4096B, ioengine=psync, iodepth=1
fio-3.29
Starting 1 process
random-read: Laying out IO file (1 file / 1000MiB)
Jobs: 1 (f=1): [r(1)][100.0%][r=152MiB/s][r=38.9k IOPS][eta 00m:00s]
random-read: (groupid=0, jobs=1): err= 0: pid=66240: Thu Jan 20 12:33:17 2022
  read: IOPS=30.3k, BW=118MiB/s (124MB/s)(1000MiB/8455msec)
    clat (nsec): min=0, max=42935k, avg=32618.99, stdev=111174.50
     lat (nsec): min=0, max=42935k, avg=32650.49, stdev=111174.77
    clat percentiles (nsec):
     |  1.00th=[     0],  5.00th=[  1004], 10.00th=[  1004], 20.00th=[  1004],
     | 30.00th=[  1004], 40.00th=[  2008], 50.00th=[ 46848], 60.00th=[ 48896],
     | 70.00th=[ 50944], 80.00th=[ 54016], 90.00th=[ 58112], 95.00th=[ 64768],
     | 99.00th=[ 94720], 99.50th=[116224], 99.90th=[218112], 99.95th=[296960],
     | 99.99th=[856064]
   bw (  KiB/s): min=75754, max=169615, per=97.69%, avg=118309.75, stdev=23018.88, samples=16
   iops        : min=18938, max=42403, avg=29577.19, stdev=5754.64, samples=16
  lat (nsec)   : 2=1.03%
  lat (usec)   : 2=31.24%, 4=9.84%, 10=0.07%, 20=0.02%, 50=19.32%
  lat (usec)   : 100=37.61%, 250=0.79%, 500=0.06%, 750=0.01%, 1000=0.01%
  lat (msec)   : 2=0.01%, 4=0.01%, 10=0.01%, 20=0.01%, 50=0.01%
  cpu          : usr=2.16%, sys=15.21%, ctx=151144, majf=0, minf=16
  IO depths    : 1=100.0%, 2=0.0%, 4=0.0%, 8=0.0%, 16=0.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued rwts: total=256000,0,0,0 short=0,0,0,0 dropped=0,0,0,0
     latency   : target=0, window=0, percentile=100.00%, depth=1

Run status group 0 (all jobs):
   READ: bw=118MiB/s (124MB/s), 118MiB/s-118MiB/s (124MB/s-124MB/s), io=1000MiB (1049MB), run=8455-8455msec
```

### HDD
```bash
❯ fio random-read.fio
random-read: (g=0): rw=randread, bs=(R) 4096B-4096B, (W) 4096B-4096B, (T) 4096B-4096B, ioengine=psync, iodepth=1
fio-3.29
Starting 1 process
random-read: Laying out IO file (1 file / 1000MiB)
Jobs: 1 (f=1): [r(1)][100.0%][r=4152KiB/s][r=1038 IOPS][eta 00m:01s]
random-read: (groupid=0, jobs=1): err= 0: pid=67703: Thu Jan 20 13:11:49 2022
  read: IOPS=124, BW=497KiB/s (509kB/s)(1000MiB/2058435msec)
    clat (nsec): min=0, max=221774k, avg=8039861.52, stdev=5137360.10
     lat (nsec): min=0, max=221774k, avg=8039931.66, stdev=5137362.15
    clat percentiles (nsec):
     |  1.00th=[    1004],  5.00th=[    1004], 10.00th=[  481280],
     | 20.00th=[ 4177920], 30.00th=[ 5537792], 40.00th=[ 6848512],
     | 50.00th=[ 8159232], 60.00th=[ 9502720], 70.00th=[10813440],
     | 80.00th=[12124160], 90.00th=[13434880], 95.00th=[14221312],
     | 99.00th=[24248320], 99.50th=[30801920], 99.90th=[35913728],
     | 99.95th=[39059456], 99.99th=[64749568]
   bw (  KiB/s): min=  198, max= 4916, per=99.91%, avg=497.11, stdev=169.03, samples=4071
   iops        : min=   49, max= 1229, avg=123.86, stdev=42.27, samples=4071
  lat (nsec)   : 2=0.19%
  lat (usec)   : 2=4.88%, 4=2.90%, 10=0.71%, 20=0.01%, 50=0.01%
  lat (usec)   : 100=0.01%, 250=0.01%, 500=3.37%, 750=2.96%, 1000=0.22%
  lat (msec)   : 2=0.03%, 4=3.49%, 10=44.90%, 20=35.03%, 50=1.27%
  lat (msec)   : 100=0.03%, 250=0.01%
  cpu          : usr=0.02%, sys=0.39%, ctx=235259, majf=2, minf=14
  IO depths    : 1=100.0%, 2=0.0%, 4=0.0%, 8=0.0%, 16=0.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued rwts: total=256000,0,0,0 short=0,0,0,0 dropped=0,0,0,0
     latency   : target=0, window=0, percentile=100.00%, depth=1

Run status group 0 (all jobs):
   READ: bw=497KiB/s (509kB/s), 497KiB/s-497KiB/s (509kB/s-509kB/s), io=1000MiB (1049MB), run=2058435-2058435msec
```

### SSD
```bash
❯ fio random-read.fio
random-read: (g=0): rw=randread, bs=(R) 4096B-4096B, (W) 4096B-4096B, (T) 4096B-4096B, ioengine=psync, iodepth=1
fio-3.29
Starting 1 process
Jobs: 1 (f=1): [r(1)][100.0%][r=26.8MiB/s][r=6863 IOPS][eta 00m:00s]
random-read: (groupid=0, jobs=1): err= 0: pid=67123: Thu Jan 20 12:36:57 2022
  read: IOPS=4333, BW=16.9MiB/s (17.7MB/s)(1000MiB/59076msec)
    clat (nsec): min=0, max=12262k, avg=230454.14, stdev=172977.69
     lat (nsec): min=0, max=12262k, avg=230481.48, stdev=172978.11
    clat percentiles (nsec):
     |  1.00th=[      0],  5.00th=[   1004], 10.00th=[   1004],
     | 20.00th=[   1004], 30.00th=[   2008], 40.00th=[ 280576],
     | 50.00th=[ 288768], 60.00th=[ 296960], 70.00th=[ 317440],
     | 80.00th=[ 354304], 90.00th=[ 432128], 95.00th=[ 473088],
     | 99.00th=[ 602112], 99.50th=[ 626688], 99.90th=[ 675840],
     | 99.95th=[ 700416], 99.99th=[1318912]
   bw (  KiB/s): min=11912, max=27576, per=99.89%, avg=17315.51, stdev=2992.88, samples=117
   iops        : min= 2978, max= 6894, avg=4328.52, stdev=748.27, samples=117
  lat (nsec)   : 2=1.56%
  lat (usec)   : 2=28.30%, 4=2.34%, 10=0.01%, 20=0.01%, 50=0.01%
  lat (usec)   : 100=0.01%, 250=0.09%, 500=65.98%, 750=1.68%, 1000=0.02%
  lat (msec)   : 2=0.01%, 4=0.01%, 10=0.01%, 20=0.01%
  cpu          : usr=0.26%, sys=8.06%, ctx=174478, majf=0, minf=11
  IO depths    : 1=100.0%, 2=0.0%, 4=0.0%, 8=0.0%, 16=0.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued rwts: total=256000,0,0,0 short=0,0,0,0 dropped=0,0,0,0
     latency   : target=0, window=0, percentile=100.00%, depth=1

Run status group 0 (all jobs):
   READ: bw=16.9MiB/s (17.7MB/s), 16.9MiB/s-16.9MiB/s (17.7MB/s-17.7MB/s), io=1000MiB (1049MB), run=59076-59076msec
```
