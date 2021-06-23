---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Storage Benchmarking"
  description: "Storage Benchmarking"
  auto_paginate: True
---

A wide range of storage benchmarking tools is available, but in this
section we will talk mainly about `fio`.

`fio` is short for flexible I/O tester. It is an open-source tool for
storage benchmarking that can generate IO workloads with reads and
writes that simulate real-world storage workloads.

The [Storage Networking Industry Association](https://www.snia.org/)
provides some complex testing tools that create nice plots having
`fio` storage benchmark data as input.

With `fio`, we can measure IOPS performance and save the results in
a performance report.

We can run `fio` in the following way:

```
$ sudo fio --filename=/dev/vdc --direct=1 --rw=randrw --bs=4k \
           --ioengine=libaio --iodepth=256 --runtime=60 --numjobs=4 \
           --time_based --group_reporting --name=iops-test \
           --eta-newline=1 --output=iops_report
Jobs: 4 (f=4): [m(4)][5.0%][r=19.0MiB/s,w=19.9MiB/s][r=4873,w=5107 IOPS][eta 00m:57s]
Jobs: 4 (f=4): [m(4)][6.7%][r=19.6MiB/s,w=19.6MiB/s][r=5011,w=5028 IOPS][eta 00mJobs: 4 (f=4): [m(4)][8.3%][r=19.6MiB/s,w=19.4MiB/s][r=5030,w=4954 IOPS][eta 00m:55s] 
Jobs: 4 (f=4): [m(4)][10.0%][r=17.8MiB/s,w=17.7MiB/s][r=4553,w=4537 IOPS][eta 00Jobs: 4 (f=4): [m(4)][11.7%][r=21.4MiB/s,w=21.2MiB/s][r=5488,w=5430 IOPS][eta 00m:53s] 
Jobs: 4 (f=4): [m(4)][13.3%][r=19.6MiB/s,w=19.5MiB/s][r=5017,w=4986 IOPS][eta 00Jobs: 4 (f=4): [m(4)][15.0%][r=19.6MiB/s,w=19.5MiB/s][r=5016,w=4992 IOPS][eta 00m:51s] 
Jobs: 4 (f=4): [m(4)][16.7%][r=19.3MiB/s,w=19.8MiB/s][r=4933,w=5071 IOPS][eta 00Jobs: 4 (f=4): [m(4)][18.3%][r=19.4MiB/s,w=19.7MiB/s][r=4972,w=5037 IOPS][eta 00m:49s] 
Jobs: 4 (f=4): [m(4)][21.3%][r=19.7MiB/s,w=19.3MiB/s][r=5035,w=4943 IOPS][eta 00Jobs: 4 (f=4): [m(4)][21.7%][r=16.2MiB/s,w=16.4MiB/s][r=4152,w=4209 IOPS][eta 00m:47s] 
Jobs: 4 (f=4): [m(4)][24.6%][r=4092KiB/s,w=3944KiB/s][r=1023,w=986 IOPS][eta 00mJobs: 4 (f=4): [m(4)][25.0%][r=1937KiB/s,w=2250KiB/s][r=484,w=562 IOPS][eta 00m:45s]  
Jobs: 4 (f=4): [m(4)][27.9%][r=7096KiB/s,w=7144KiB/s][r=1774,w=1786 IOPS][eta 00Jobs: 4 (f=4): [m(4)][28.3%][r=15.4MiB/s,w=15.7MiB/s][r=3949,w=4020 IOPS][eta 00m:43s] 
Jobs: 4 (f=4): [m(4)][31.1%][r=2740KiB/s,w=2832KiB/s][r=685,w=708 IOPS][eta 00m:Jobs: 4 (f=4): [m(4)][31.7%][r=5733KiB/s,w=5697KiB/s][r=1433,w=1424 IOPS][eta 00m:41s]
Jobs: 4 (f=4): [m(4)][33.3%][r=1433KiB/s,w=1289KiB/s][r=358,w=322 IOPS][eta 00m:Jobs: 4 (f=4): [m(4)][35.0%][r=4476KiB/s,w=4136KiB/s][r=1119,w=1034 IOPS][eta 00m:39s]
Jobs: 4 (f=4): [m(4)][36.7%][r=5445KiB/s,w=5473KiB/s][r=1361,w=1368 IOPS][eta 00Jobs: 4 (f=4): [m(4)][39.3%][r=8464KiB/s,w=8248KiB/s][r=2116,w=2062 IOPS][eta 00m:37s] 
Jobs: 4 (f=4): [m(4)][40.0%][r=4360KiB/s,w=4480KiB/s][r=1090,w=1120 IOPS][eta 00Jobs: 4 (f=4): [m(4)][42.6%][r=21.8MiB/s,w=21.2MiB/s][r=5588,w=5439 IOPS][eta 00m:35s] 
Jobs: 4 (f=4): [m(4)][43.3%][r=19.4MiB/s,w=19.7MiB/s][r=4971,w=5042 IOPS][eta 00Jobs: 4 (f=4): [m(4)][45.9%][r=19.6MiB/s,w=19.5MiB/s][r=5015,w=4997 IOPS][eta 00m:33s] 
Jobs: 4 (f=4): [m(4)][47.5%][r=19.2MiB/s,w=19.9MiB/s][r=4924,w=5084 IOPS][eta 00Jobs: 4 (f=4): [m(4)][48.3%][r=19.7MiB/s,w=19.4MiB/s][r=5037,w=4956 IOPS][eta 00m:31s] 
Jobs: 4 (f=4): [m(4)][50.8%][r=19.3MiB/s,w=19.8MiB/s][r=4936,w=5065 IOPS][eta 00Jobs: 4 (f=4): [m(4)][51.7%][r=19.5MiB/s,w=19.7MiB/s][r=4982,w=5035 IOPS][eta 00m:29s] 
Jobs: 4 (f=4): [m(4)][54.1%][r=19.3MiB/s,w=19.8MiB/s][r=4948,w=5057 IOPS][eta 00Jobs: 4 (f=4): [m(4)][55.0%][r=19.4MiB/s,w=19.5MiB/s][r=4966,w=5001 IOPS][eta 00m:27s] 
Jobs: 4 (f=4): [m(4)][57.4%][r=19.8MiB/s,w=19.0MiB/s][r=5067,w=4876 IOPS][eta 00Jobs: 4 (f=4): [m(4)][58.3%][r=19.8MiB/s,w=19.4MiB/s][r=5076,w=4964 IOPS][eta 00m:25s] 
Jobs: 4 (f=4): [m(4)][60.7%][r=19.7MiB/s,w=19.5MiB/s][r=5039,w=4980 IOPS][eta 00Jobs: 4 (f=4): [m(4)][61.7%][r=19.4MiB/s,w=19.6MiB/s][r=4954,w=5019 IOPS][eta 00m:23s] 
Jobs: 4 (f=4): [m(4)][63.9%][r=20.2MiB/s,w=19.2MiB/s][r=5166,w=4925 IOPS][eta 00Jobs: 4 (f=4): [m(4)][65.6%][r=19.3MiB/s,w=19.8MiB/s][r=4946,w=5068 IOPS][eta 00m:21s] 
Jobs: 4 (f=4): [m(4)][67.2%][r=19.9MiB/s,w=19.2MiB/s][r=5088,w=4911 IOPS][eta 00Jobs: 4 (f=4): [m(4)][68.9%][r=19.7MiB/s,w=19.5MiB/s][r=5031,w=4983 IOPS][eta 00m:19s] 
Jobs: 4 (f=4): [m(4)][70.5%][r=19.9MiB/s,w=19.2MiB/s][r=5082,w=4922 IOPS][eta 00Jobs: 4 (f=4): [m(4)][72.1%][r=19.4MiB/s,w=19.6MiB/s][r=4976,w=5019 IOPS][eta 00m:17s] 
Jobs: 4 (f=4): [m(4)][73.8%][r=19.6MiB/s,w=19.5MiB/s][r=5015,w=4998 IOPS][eta 00Jobs: 4 (f=4): [m(4)][75.4%][r=19.5MiB/s,w=19.6MiB/s][r=4991,w=5011 IOPS][eta 00m:15s] 
Jobs: 4 (f=4): [m(4)][76.7%][r=19.6MiB/s,w=19.5MiB/s][r=5017,w=4994 IOPS][eta 00Jobs: 4 (f=4): [m(4)][78.7%][r=19.4MiB/s,w=19.6MiB/s][r=4966,w=5026 IOPS][eta 00m:13s] 
Jobs: 4 (f=4): [m(4)][80.3%][r=19.5MiB/s,w=19.6MiB/s][r=5002,w=5008 IOPS][eta 00Jobs: 4 (f=4): [m(4)][82.0%][r=19.1MiB/s,w=19.0MiB/s][r=4896,w=5113 IOPS][eta 00m:11s] 
Jobs: 4 (f=4): [m(4)][83.6%][r=19.6MiB/s,w=19.5MiB/s][r=5022,w=4992 IOPS][eta 00Jobs: 4 (f=4): [m(4)][85.2%][r=19.6MiB/s,w=19.5MiB/s][r=5006,w=4991 IOPS][eta 00m:09s] 
Jobs: 4 (f=4): [m(4)][86.9%][r=19.7MiB/s,w=19.3MiB/s][r=5049,w=4952 IOPS][eta 00Jobs: 4 (f=4): [m(4)][88.5%][r=19.6MiB/s,w=19.6MiB/s][r=5011,w=5006 IOPS][eta 00m:07s] 
Jobs: 4 (f=4): [m(4)][90.2%][r=19.3MiB/s,w=19.8MiB/s][r=4935,w=5075 IOPS][eta 00Jobs: 4 (f=4): [m(4)][91.8%][r=19.3MiB/s,w=19.7MiB/s][r=4944,w=5049 IOPS][eta 00m:05s] 
Jobs: 4 (f=4): [m(4)][93.4%][r=19.6MiB/s,w=19.4MiB/s][r=5012,w=4966 IOPS][eta 00Jobs: 4 (f=4): [m(4)][95.1%][r=13.8MiB/s,w=13.0MiB/s][r=3528,w=3575 IOPS][eta 00m:03s] 
Jobs: 4 (f=4): [m(4)][96.7%][r=21.4MiB/s,w=20.8MiB/s][r=5482,w=5313 IOPS][eta 00Jobs: 4 (f=4): [m(4)][98.4%][r=19.7MiB/s,w=19.4MiB/s][r=5036,w=4973 IOPS][eta 00m:01s] 

```

In this test, `fio` runs with the following settings:

* We test the `vdc` drive.
* We use 50% random reads and 50% random writes.
* We use a block size of 4 KiB.
* We use an I/O depth of 256.
* We run 4 jobs.
* We run the test for 60 seconds.
* We save the report to a file named **iops_report**.

I/O depth is the amount of I/Os `fio` tries to issue at a given time.
The number of jobs is the number of clones spawned as an independent
thread or process.

The test report looks like this:

```
$ cat iops_report 
iops-test-job: (g=0): rw=randrw, bs=(R) 4096B-4096B, (W) 4096B-4096B, (T) 4096B-4096B, ioengine=libaio, iodepth=256
...
fio-3.16
Starting 4 processes

iops-test-job: (groupid=0, jobs=4): err= 0: pid=2277: Tue Nov 24 23:05:09 2020
  read: IOPS=4293, BW=16.8MiB/s (17.6MB/s)(1010MiB/60205msec)
    slat (nsec): min=1795, max=806398k, avg=449741.99, stdev=3302935.32
    clat (msec): min=23, max=11823, avg=115.82, stdev=213.70
     lat (msec): min=25, max=11823, avg=116.27, stdev=213.84
    clat percentiles (msec):
     |  1.00th=[   50],  5.00th=[   75], 10.00th=[   83], 20.00th=[   89],
     | 30.00th=[   93], 40.00th=[   95], 50.00th=[   97], 60.00th=[  100],
     | 70.00th=[  102], 80.00th=[  104], 90.00th=[  109], 95.00th=[  131],
     | 99.00th=[  625], 99.50th=[ 1150], 99.90th=[ 2937], 99.95th=[ 4530],
     | 99.99th=[ 8087]
   bw (  KiB/s): min=  136, max=23472, per=100.00%, avg=17341.20, stdev=1478.69, samples=476
   iops        : min=   34, max= 5868, avg=4335.23, stdev=369.68, samples=476
  write: IOPS=4293, BW=16.8MiB/s (17.6MB/s)(1010MiB/60205msec); 0 zone resets
    slat (usec): min=2, max=927373, avg=474.73, stdev=5337.43
    clat (msec): min=22, max=2555, avg=120.92, stdev=120.84
     lat (msec): min=25, max=2555, avg=121.40, stdev=121.27
    clat percentiles (msec):
     |  1.00th=[   60],  5.00th=[   78], 10.00th=[   82], 20.00th=[   87],
     | 30.00th=[   91], 40.00th=[   96], 50.00th=[  103], 60.00th=[  109],
     | 70.00th=[  118], 80.00th=[  128], 90.00th=[  140], 95.00th=[  155],
     | 99.00th=[  617], 99.50th=[ 1045], 99.90th=[ 1603], 99.95th=[ 2198],
     | 99.99th=[ 2500]
   bw (  KiB/s): min=  120, max=24936, per=100.00%, avg=17340.13, stdev=1483.36, samples=476
   iops        : min=   30, max= 6234, avg=4334.96, stdev=370.85, samples=476
  lat (msec)   : 50=0.78%, 100=56.09%, 250=40.42%, 500=1.50%, 750=0.34%
  lat (msec)   : 1000=0.29%, 2000=0.48%, >=2000=0.11%
  cpu          : usr=0.51%, sys=1.31%, ctx=75840, majf=0, minf=55
  IO depths    : 1=0.1%, 2=0.1%, 4=0.1%, 8=0.1%, 16=0.1%, 32=0.1%, >=64=100.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.1%
     issued rwts: total=258497,258469,0,0 short=0,0,0,0 dropped=0,0,0,0
     latency   : target=0, window=0, percentile=100.00%, depth=256

Run status group 0 (all jobs):
   READ: bw=16.8MiB/s (17.6MB/s), 16.8MiB/s-16.8MiB/s (17.6MB/s-17.6MB/s), io=1010MiB (1059MB), run=60205-60205msec
  WRITE: bw=16.8MiB/s (17.6MB/s), 16.8MiB/s-16.8MiB/s (17.6MB/s-17.6MB/s), io=1010MiB (1059MB), run=60205-60205msec

Disk stats (read/write):
  vdc: ios=258618/258453, merge=5/51, ticks=6939767/8215404, in_queue=14116728, util=88.27%
```

Instead of building a command with numerous arguments, we can create
a file that sets all the arguments that we need.

For example, we can create a file with the following content that we
can then use to test disk throughput performance:

```
[global]
bs=64K
iodepth=64
direct=1
ioengine=libaio
group_reporting
time_based
runtime=60
numjobs=4
name=raw-read
rw=read

[job1]
filename=/dev/vdc
```

This `fio` configuration file sets the following:

* It tests the `vdc` disk.
* It uses a block size of 64 KiB.
* It uses an I/O depth of 64.
* It uses 4 jobs.
* It runs for 60 seconds.
* It saves the report to a file named **throughput_report**.

Then, to measure disk throughput performance, we run `fio` in the
following way:

```
$ sudo fio test.fio --output=throughput_report
```

The test report looks like this:

```
$ cat throughput_report 
job1: (g=0): rw=read, bs=(R) 64.0KiB-64.0KiB, (W) 64.0KiB-64.0KiB, (T) 64.0KiB-64.0KiB, ioengine=libaio, iodepth=64
...
fio-3.16
Starting 4 processes

job1: (groupid=0, jobs=4): err= 0: pid=2473: Tue Nov 24 23:31:20 2020
  read: IOPS=3603, BW=225MiB/s (236MB/s)(13.3GiB/60309msec)
    slat (nsec): min=1742, max=962502, avg=6140.70, stdev=7665.68
    clat (usec): min=33, max=1098.8k, avg=70986.01, stdev=95262.83
     lat (usec): min=40, max=1098.8k, avg=70992.31, stdev=95264.06
    clat percentiles (usec):
     |  1.00th=[    135],  5.00th=[    251], 10.00th=[    441],
     | 20.00th=[    898], 30.00th=[   1254], 40.00th=[   1762],
     | 50.00th=[   6915], 60.00th=[  62653], 70.00th=[ 106431],
     | 80.00th=[ 149947], 90.00th=[ 204473], 95.00th=[ 256902],
     | 99.00th=[ 367002], 99.50th=[ 408945], 99.90th=[ 574620],
     | 99.95th=[ 775947], 99.99th=[1082131]
   bw (  KiB/s): min=73088, max=567879, per=100.00%, avg=231503.48, stdev=22368.23, samples=480
   iops        : min= 1142, max= 8872, avg=3617.08, stdev=349.49, samples=480
  lat (usec)   : 50=0.01%, 100=0.33%, 250=4.66%, 500=6.15%, 750=4.96%
  lat (usec)   : 1000=6.66%
  lat (msec)   : 2=19.73%, 4=6.07%, 10=1.97%, 20=1.40%, 50=5.43%
  lat (msec)   : 100=11.19%, 250=26.01%, 500=5.29%, 750=0.10%, 1000=0.03%
  lat (msec)   : 2000=0.02%
  cpu          : usr=0.22%, sys=0.72%, ctx=111744, majf=0, minf=4153
  IO depths    : 1=0.1%, 2=0.1%, 4=0.1%, 8=0.1%, 16=0.1%, 32=0.1%, >=64=99.9%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.1%, >=64=0.0%
     issued rwts: total=217319,0,0,0 short=0,0,0,0 dropped=0,0,0,0
     latency   : target=0, window=0, percentile=100.00%, depth=64

Run status group 0 (all jobs):
   READ: bw=225MiB/s (236MB/s), 225MiB/s-225MiB/s (236MB/s-236MB/s), io=13.3GiB (14.2GB), run=60309-60309msec

Disk stats (read/write):
  vdc: ios=119350/0, merge=93821/0, ticks=7841385/0, in_queue=7659052, util=76.83%
```
