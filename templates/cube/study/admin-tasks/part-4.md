---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Administrative Tasks"
  description: "Administrative Tasks"
  auto_paginate: True
---

## Backup, Monitor, and Logs

Backing up systems, monitoring systems, and auditing logs are more
items on a sysadmin's list.

## Backups

Backing up systems is of critical importance, because backups provide a
way of recovering data following data corruption or data deletion.
Backups are stored remotely on a separate server that sometimes can
be placed at a different geographical location.

Backups should be automated, and a notification should be sent out
if taking a backup fails for some reason. The sysadmin should then
investigate and fix the reason that caused backups to fail.
Backup files should be accompanied by MD5 and SHA256 checksums
when stored on a remote system.

Backups can be

* Full – For example, taking an image of a whole system. This is not advisable
  if we want to take daily backups. It is a solution
  for storing a setup that we consider a basic, reliable configuration.
* Incremental – Meaning we take a complete backup initially, then we
  back up only data that changed since the most recent backup was taken.
* Differential – Meaning we store data that changed from the last
  backup. The more time passes, the bigger the differential backup
  becomes.

Backup activities are usually scheduled at night, or when the system
administrator has assessed is a suitable time.

A wide range of backup tools exists with many useful features. Besides
taking a backup, we can configure the backup tool to save a predetermined number
of backups, we can schedule to take backups at a given time, or
we can send out a notification if a backup fails for some reason.

`rsync` is a fast and versatile file-copying tool that we can use
to take incremental backups. Sophisticated backup tools like
`rsnapshot` and `duplicity` build on top of `rsync`.

If we want to back up the **/var** directory using `rsync` to a remote
destination, we need to run:

```
$ rsync -a /var remote_server:/backup/local_server
```

## Monitoring Systems

Monitoring systems means observing system performance and
resources over time. This way, we can prevent the system from running out
of disk space, for example, or we can distribute load so that systems
do not run out of CPU and memory resources.

Even in this case, automation plays an important role. For example, it is
undoubtedly more useful and reliable to deploy a script that
monitors disk space and sends an alert when the disk space on a
system exceeds a threshold than to log in to individual
machines and manually run `df -h`.

There are plenty of monitoring tools available, from command-line
ones to advanced and feature-rich ones. The more sophisticated
ones include Nagios, Prometheus, Grafana, Zabbix, and Sensu.

We will look at *some* command-line utilities in this section. (We will explore
others — like `tcpdump`, `lsof`, and `ss` — elsewhere in this course.)

The `free` command shows the amount of free memory in a system:

```
$ free -h
              total        used        free      shared  buff/cache   available
Mem:           15Gi       238Mi        15Gi       2.0Mi       307Mi        15Gi
Swap:            0B          0B          0B
```

`free` parses **/proc/meminfo** information. When the `available` memory
column shows a low value or close to 0, we should investigate what
causes the low memory state.

```
$ cat /proc/meminfo
MemTotal:       16397988 kB
MemFree:        15838664 kB
MemAvailable:   15879868 kB
Buffers:           27532 kB
Cached:           246192 kB
SwapCached:            0 kB
Active:           193928 kB
Inactive:         160940 kB
Active(anon):      78600 kB
Inactive(anon):     2140 kB
Active(file):     115328 kB
Inactive(file):   158800 kB
Unevictable:       18464 kB
Mlocked:           18464 kB
SwapTotal:             0 kB
SwapFree:              0 kB
Dirty:                 0 kB
Writeback:             0 kB
AnonPages:         99660 kB
Mapped:            88160 kB
Shmem:              3064 kB
KReclaimable:      41416 kB
Slab:             110288 kB
SReclaimable:      41416 kB
SUnreclaim:        68872 kB
KernelStack:        4160 kB
PageTables:         3008 kB
NFS_Unstable:          0 kB
Bounce:                0 kB
WritebackTmp:          0 kB
CommitLimit:     8198992 kB
Committed_AS:    1351156 kB
VmallocTotal:   34359738367 kB
VmallocUsed:       53180 kB
VmallocChunk:          0 kB
Percpu:             2560 kB
HardwareCorrupted:     0 kB
AnonHugePages:         0 kB
ShmemHugePages:        0 kB
ShmemPmdMapped:        0 kB
FileHugePages:         0 kB
FilePmdMapped:         0 kB
CmaTotal:              0 kB
CmaFree:               0 kB
HugePages_Total:       0
HugePages_Free:        0
HugePages_Rsvd:        0
HugePages_Surp:        0
Hugepagesize:       2048 kB
Hugetlb:               0 kB
DirectMap4k:      163696 kB
DirectMap2M:    16613376 kB
```

`vmstat` reports virtual memory statistics:

```
$ vmstat
procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 0  0      0 33447128 135176 3316516    0    0    18    18  105  359  3  1 96  0  0
```

`df` displays filesystem disk space usage:

```
$ df -h
Filesystem      Size  Used Avail Use% Mounted on
udev            7.8G     0  7.8G   0% /dev
tmpfs           1.6G  1.2M  1.6G   1% /run
/dev/vda1        49G  3.9G   45G   9% /
tmpfs           7.9G     0  7.9G   0% /dev/shm
tmpfs           5.0M     0  5.0M   0% /run/lock
tmpfs           7.9G     0  7.9G   0% /sys/fs/cgroup
/dev/vda15      105M  9.2M   96M   9% /boot/efi
/dev/loop3       56M   56M     0 100% /snap/core18/1932
/dev/loop2       28M   28M     0 100% /snap/snapd/7264
/dev/loop1       70M   70M     0 100% /snap/lxd/18137
/dev/loop0       55M   55M     0 100% /snap/core18/1705
/dev/loop4       70M   70M     0 100% /snap/lxd/18251
/dev/loop5       31M   31M     0 100% /snap/snapd/9721
tmpfs           1.6G     0  1.6G   0% /run/user/1000
```

We should check for available disk space in the 'Available' column
and confirm that we have sufficient space left on the disk. We should also
check the 'Use' column that shows the percentage of used disk space.
In the preceding output, we can see 100% on some loop devices.
The loop devices are used to mount read-only image files that do
not get smaller or larger in size. All the loop devices in the
command output are connected to `snap` images and use the
`SquashFS` filesystem.

`htop` is an interactive process viewer. It is a powerful
command, as it allows one to sort columns. With it, you can sort processes by
memory or CPU consumption, for example.
You can kill processes from `htop` or, if in tree view, you can
kill a process tree by using F5 to toggle to tree view and F9 and
SIGTERM to kill the process.

Should you want to share an `htop` screen, you can use the following command,
where `aha` is an ANSI to HTML converter.

```
echo q | htop | aha --black --line-fix > htop.html
```

```
  1  [                            0.0%]   Tasks: 46, 117 thr; 1 running
  2  [                            0.0%]   Load average: 0.06 0.03 0.01
  3  [                            0.0%]   Uptime: 02:57:49
  4  [                            0.0%]
  Mem[|||                   247M/15.6G]
  Swp[                           0K/0K]
    PID USER      PRI  NI  VIRT   RES   SHR S CPU% MEM%   TIME+  Command
   1999 ubuntu     20   0  8120  3596  3092 R 133.  0.0  0:00.02 htop
      1 root       20   0  164M 11584  8276 S  0.0  0.1  0:01.61 /sbin/init
    372 root       19  -1 84432 19336 18068 S  0.0  0.1  0:00.27 /lib/systemd/systemd
    398 root       20   0 22096  6240  3992 S  0.0  0.0  0:00.62 /lib/systemd/systemd
    549 root       RT   0  273M 17940  8200 S  0.0  0.1  0:00.08 /sbin/multipathd -d
    550 root       RT   0  273M 17940  8200 S  0.0  0.1  0:00.00 /sbin/multipathd -d
    551 root       RT   0  273M 17940  8200 S  0.0  0.1  0:00.01 /sbin/multipathd -d
    552 root       RT   0  273M 17940  8200 S  0.0  0.1  0:00.56 /sbin/multipathd -d
    553 root       RT   0  273M 17940  8200 S  0.0  0.1  0:00.00 /sbin/multipathd -d
    554 root       RT   0  273M 17940  8200 S  0.0  0.1  0:00.00 /sbin/multipathd -d
    544 root       RT   0  273M 17940  8200 S  0.0  0.1  0:00.92 /sbin/multipathd -d
```

`iotop` is similar to `htop`, but monitors I/O usage:

```
Total DISK READ:         0.00 B/s | Total DISK WRITE:         3.38 M/s
Current DISK READ:0.00 B/s | Current DISK WRITE:0.00 B/s
    TID  PRIO  USER     DISK READ  DISK WRITE  SWAPIN     IO>    COMMAND
1068380 be/4 ubuntu 0.00 B/s    3.38 M/s  0.00 %  0.00 % firefox [Backgro~ool #76]
1 be/4 root             0.00 B/s    0.00 B/s  0.00 %  0.00 % systemd --syste~--deserialize 17
      2 be/4 root        0.00 B/s    0.00 B/s  0.00 %  0.00 % [kthreadd]
3 be/0 root             0.00 B/s    0.00 B/s  0.00 %  0.00 % [rcu_gp]
4 be/0 root             0.00 B/s    0.00 B/s  0.00 %  0.00 % [rcu_par_gp]
9 be/0 root             0.00 B/s    0.00 B/s  0.00 %  0.00 % [mm_percpu_wq]
10 be/4 root            0.00 B/s    0.00 B/s  0.00 %  0.00 % [ksoftirqd/0]
11 be/4 root            0.00 B/s    0.00 B/s  0.00 %  0.00 % [rcu_sched]
12 rt/4 root            0.00 B/s    0.00 B/s  0.00 %  0.00 % [migration/0]
13 rt/4 root            0.00 B/s    0.00 B/s  0.00 %  0.00 % [idle_inject/0]
14 be/4 root            0.00 B/s    0.00 B/s  0.00 %  0.00 % [cpuhp/0]
```

`iostat` records CPU and I/O statistics for devices and partitions:

```
$ iostat 
Linux 5.4.0-53-generic (deploy) 	11/16/20 	_x86_64_	(4 CPU)
avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           0.03    0.00    0.02    0.06    0.00   99.89
Device             tps    kB_read/s    kB_wrtn/s    kB_dscd/s    kB_read    kB_wrtn    kB_dscd
loop0             0.13         0.16         0.00         0.00       1591          0          0
loop1             0.00         0.04         0.00         0.00        341          0          0
loop2             0.01         0.17         0.00         0.00       1655          0          0
loop3             0.00         0.00         0.00         0.00          4          0          0
scd0              0.00         0.02         0.00         0.00        168          0          0
vda               1.07        33.64        52.95         0.00     327493     515560          0
```

`iftop` monitors network traffic:

```
                   12.5Kb               25.0Kb              37.5Kb               50.0Kb         62.5Kb
└───────────────────┴────────────────────┴───────────────────┴────────────────────┴────────────────────
deploy.example.com                    => 91.123.199.56                          5.83Kb  5.52Kb  5.84Kb
                                      <=                                        2.03Kb  1.79Kb  1.75Kb
deploy.example.com                    => dns.google                                0b      0b    124b
                                      <=                                           0b      0b    210b
───────────────────────────────────────────────────────────────────────────────────────────────────────
TX:             cum:   22.4KB   peak:   10.9Kb                         rates:   5.83Kb  5.52Kb  5.96Kb
RX:                    7.33KB           5.97Kb                                  2.03Kb  1.79Kb  1.96Kb
TOTAL:                 29.7KB           16.9Kb                                  7.86Kb  7.31Kb  7.92Kb
```

With `sar`, we can monitor CPU, memory, I/O, and collect
performance data. We can then create reports and uncover performance
bottlenecks.

The following command reports CPU utilization every 2 seconds, 3 times:

```
$ sar 2 3
Linux 5.4.0-53-generic (deploy) 	11/13/20 	_x86_64_	(4 CPU)

23:33:35        CPU     %user     %nice   %system   %iowait    %steal     %idle
23:33:37        all      1.37      0.00     49.56      0.00      0.12     48.94
23:33:39        all      1.62      0.00     49.31      0.00      0.00     49.06
23:33:41        all      1.13      0.00     50.00      0.00      0.13     48.74
Average:        all      1.38      0.00     49.62      0.00      0.08     48.92
```

Similarly, we can use `sar` to display memory consumption:

```
$ sar -r 2 3
Linux 5.4.0-53-generic (deploy) 	11/13/20 	_x86_64_	(4 CPU)

23:37:20    kbmemfree   kbavail kbmemused  %memused kbbuffers  kbcached  kbcommit   %commit  kbactive   kbinact   kbdirty
23:37:22     15669800  15846332    189332      1.15     33212    368252   1392980      8.49    319960    175036         0
23:37:24     15669832  15846364    189300      1.15     33212    368252   1392980      8.49    319968    175036         0
23:37:26     15669832  15846364    189300      1.15     33212    368252   1392980      8.49    319968    175036         0
Average:     15669821  15846353    189311      1.15     33212    368252   1392980      8.49    319965    175036         0
ubuntu@deploy:~$ 

```

We can run `sar` and generate a report that we can later
read with `sadf`,  which can display collected data in
multiple formats.

```
$ sar -r 1 3 -o ss.report
$ sadf -d ss.report -- -B
# hostname;interval;timestamp;pgpgin/s;pgpgout/s;fault/s;majflt/s;pgfree/s;pgscank/s;pgscand/s;pgsteal/s;%vmeff
deploy;1;2020-11-13 23:46:13 UTC;0.00;0.00;3.00;0.00;31157.00;0.00;0.00;0.00;0.00
deploy;1;2020-11-13 23:46:14 UTC;0.00;0.00;2.00;0.00;31863.00;0.00;0.00;0.00;0.00
deploy;1;2020-11-13 23:46:15 UTC;0.00;0.00;0.00;0.00;31657.00;0.00;0.00;0.00;0.00
```

We can run the preceding command with the `-j` option and
get the report in JSON format.



## TLS Certificate Renewal

Many services use TLS certificates to encrypt information they
transmit. Certificates have expiration dates, and they need to be
renewed. This is, of course, a sysadmin duty, and ideally certificate
renewal should be automated. Failure to renew TLS certificates before
they expire has serious consequences, resulting in traffic and service
loss.

A tool that can help automate certificate retrieval
and renewal is `certbot`.

You can manually renew a certificate with the following `certbot`
command:

```
$  certbot --force-renewal -d www.example.com
```

Ubuntu configures the automated renewal when installing `certbot`
via the `apt` packet manager. To see when `certbot` will renew
certificates next time, list the `systemd` timers.

```
$ systemctl list-timers
NEXT                        LEFT           LAST                        PASSED     UNIT                        >
Sat 2020-11-14 13:23:17 UTC 2h 19min left  n/a                         n/a        certbot.timer               >
Sat 2020-11-14 18:01:55 UTC 6h left        Sat 2020-11-14 10:25:51 UTC 37min ago  apt-daily.timer             >
Sat 2020-11-14 22:47:35 UTC 11h left       Sat 2020-11-14 10:25:51 UTC 37min ago  motd-news.timer             >
Sat 2020-11-14 23:36:40 UTC 12h left       Sat 2020-11-14 10:26:00 UTC 37min ago  fwupd-refresh.timer         >
Sun 2020-11-15 00:00:00 UTC 12h left       Sat 2020-11-14 10:25:51 UTC 37min ago  logrotate.timer             >
Sun 2020-11-15 00:00:00 UTC 12h left       Sat 2020-11-14 10:25:51 UTC 37min ago  man-db.timer                >
Sun 2020-11-15 03:10:29 UTC 16h left       Mon 2020-11-09 07:54:48 UTC 5 days ago e2scrub_all.timer           >
Sun 2020-11-15 04:04:27 UTC 17h left       Fri 2020-11-13 12:37:48 UTC 22h ago    systemd-tmpfiles-clean.timer>
Sun 2020-11-15 06:29:24 UTC 19h left       Sat 2020-11-14 10:25:51 UTC 37min ago  apt-daily-upgrade.timer     >
Mon 2020-11-16 00:00:00 UTC 1 day 12h left Mon 2020-11-09 07:54:48 UTC 5 days ago fstrim.timer                >
10 timers listed.
```

## Audit Logs

Another sysadmin task is to periodically check logs, which can help
anticipate problems before they occur, or help with understanding
other issues and their underlying causes. Auditing logs gives us
an insight on the system performance as well. If we keep seeing
OOM Killer messages in the logs, this might be an indication that we have a dimensioning
problem and should increase the amount of RAM on that machine.

It is unrealistic to assume a person can log in to several servers and
check each and every log manually, on a daily or weekly basis.

We can, for example, use a script to check `journald` for specific
errors and send an email notification automatically when the error
occurs. This script could utilize the `journald` command in the
following way, to grep for error messages for a specific service:

```
$ journalctl -u ssh.service -b  --grep "Invalid user"
-- Logs begin at Wed 2020-11-04 12:49:26 UTC, end at Sun 2020-11-15 17:17:01 UTC. --
Nov 15 17:13:35 deploy sshd[6710]: Invalid user training from 91.123.199.56 port 37210
Nov 15 17:13:47 deploy sshd[6715]: Invalid user training from 91.123.199.56 port 37254
```

If we get a notification, we can react quickly to investigate and
possibly restore a service that is failing.

To automate auditing logs, we can transfer logs from several servers
to a central server using `rsyslog`. We can then run scripts on
the collected logs or use advanced log analysis tools, like an
ELK stack.

`rsyslog` is installed on Ubuntu 20.04 LTS server by default. To
transfer logs to a central server using `rsyslog`, the server
receiving the logs must run `rsyslog` in server mode. The client
sending the logs must run `rsyslog` in client mode.

On the client, we must configure the `rsyslog` host that will
receive the logs:

```
$cat /etc/rsyslog.d/10-rsyslog.conf
*.*   @bob:514
```

On the server-side, we must specify the protocol and port, and the
destination directory.

```
module(load="imudp")
input(type="imudp" port="514")

module(load="imtcp")
input(type="imtcp" port="514")

$template remote-incoming-logs, "/var/log/%HOSTNAME%/%PROGRAMNAME%.log" 
*.* ?remote-incoming-logs
```

We chose to use both UDP and TCP, and the default port 514. The logs
will be sent to the **/var/log** directory, under a subdirectory
named after the hostname that sends in the logs.
