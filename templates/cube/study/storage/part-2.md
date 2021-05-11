---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "ZFS and BTRFS"
  description: "ZFS and BTRFS"
  auto_paginate: True
---

## ZFS

ZFS is short for Zettabyte File System. We can install it on Ubuntu
20.04 LTS from the `zfsutils-linux` package.

```
$ sudo apt install zfsutils-linux
```

With `zpool`, we can configure ZFS storage pools that span many drives.

```
$ sudo zpool create mysqldata /dev/vdb
$ sudo zpool add mysqldata /dev/vdc
```

We can extend or reduce a ZFS storage pool by adding or removing block
devices.

```
$ sudo zpool list
NAME      SIZE  ALLOC   FREE  CKPOINT  EXPANDSZ   FRAG    CAP  DEDUP    HEALTH  ALTROOT
mysqldata  6.38G   138K  6.37G        -         -     0%     0%  1.00x    ONLINE  -
```

When we assign full disks to a storage pool, ZFS creates GPT
partitions on them, with one 8 MiB spacer partition at the end of each
disk. This additional partition is not used, and can be deleted.

```
$ lsblk
vdb     252:16   0    2G  0 disk
|-vdb1  252:17   0    2G  0 part
`-vdb9  252:25   0    8M  0 part
vdc     252:32   0    5G  0 disk
|-vdc1  252:33   0    5G  0 part
`-vdc9  252:41   0    8M  0 part
```

```
$ sudo parted  -l
Model: Virtio Block Device (virtblk)
Disk /dev/vdb: 2147MB
Sector size (logical/physical): 512B/512B
Partition Table: gpt
Disk Flags:
Number  Start   End     Size    Filesystem  Name                  Flags
 1      1049kB  2138MB  2137MB               zfs-12f4f69af4780dd7
 9      2138MB  2146MB  8389kB

Model: Virtio Block Device (virtblk)
Disk /dev/vdc: 5369MB
Sector size (logical/physical): 512B/512B
Partition Table: gpt
Disk Flags:
Number  Start   End     Size    Filesystem  Name                  Flags
 1      1049kB  5359MB  5358MB  zfs          zfs-e48b14768540241e
 9      5359MB  5368MB  8389kB
```

To check the status of a newly created pool, run `zpool status`:

```
$ zpool status mysqldata
  pool: mysqldata
 state: ONLINE
  scan: none requested
config:
 NAME        STATE     READ WRITE CKSUM
 mysqldata     ONLINE       0     0     0
  vdb       ONLINE       0     0     0
  vdc       ONLINE       0     0     0
errors: No known data errors
```

Now we can add ZFS datasets, which are filesystems that have their own
properties, and mount them with the `zfs` command:

```
$ sudo zfs create mysqldata/primary
$ sudo zfs create mysqldata/secondary
$ sudo zfs set mountpoint=/opt/mysqldata/primary mysqldata/primary
$ sudo zfs set mountpoint=/opt/mysqldata/secondary mysqldata/secondary
```

```
$ df -hT
Filesystem        Type      Size  Used Avail Use% Mounted on
mysqldata           zfs       6.2G  128K  6.2G   1% /mysqldata
mysqldata/primary   zfs       6.2G  128K  6.2G   1% /mysqldata/primary
mysqldata/secondary zfs       6.2G  128K  6.2G   1% /mysqldata/secondary
```

To query and set the properties of a ZFS file system, use the `zfs get` command:

```
$ zfs get all /opt/mysqldata/primary
NAME             PROPERTY              VALUE                   SOURCE
mysqldata/primary  type                  filesystem              -
mysqldata/primary  creation              Mon Nov 23 15:44 2020   -
mysqldata/primary  used                  24K                     -
mysqldata/primary  available             6.18G                   -
mysqldata/primary  referenced            24K                     -
mysqldata/primary  compressratio         1.00x                   -
mysqldata/primary  mounted               yes                     -
mysqldata/primary  quota                 none                    default
mysqldata/primary  reservation           none                    default
mysqldata/primary  recordsize            128K                    default
mysqldata/primary  mountpoint            /opt/mysqldata/primary  inherited from mysqldata
mysqldata/primary  sharenfs              off                     default
mysqldata/primary  checksum              on                      default
mysqldata/primary  compression           off                     default
mysqldata/primary  atime                 on                      default
mysqldata/primary  devices               on                      default
mysqldata/primary  exec                  on                      default
mysqldata/primary  setuid                on                      default
mysqldata/primary  readonly              off                     default
mysqldata/primary  zoned                 off                     default
mysqldata/primary  snapdir               hidden                  default
mysqldata/primary  aclinherit            restricted              default
mysqldata/primary  createtxg             45                      -
mysqldata/primary  canmount              on                      default
mysqldata/primary  xattr                 on                      default
mysqldata/primary  copies                1                       default
mysqldata/primary  version               5                       -
mysqldata/primary  utf8only              off                     -
mysqldata/primary  normalization         none                    -
mysqldata/primary  casesensitivity       sensitive               -
mysqldata/primary  vscan                 off                     default
mysqldata/primary  nbmand                off                     default
mysqldata/primary  sharesmb              off                     default
mysqldata/primary  refquota              none                    default
mysqldata/primary  refreservation        none                    default
mysqldata/primary  guid                  1657954087631408507     -
mysqldata/primary  primarycache          all                     default
mysqldata/primary  secondarycache        all                     default
mysqldata/primary  usedbysnapshots       0B                      -
mysqldata/primary  usedbydataset         24K                     -
mysqldata/primary  usedbychildren        0B                      -
mysqldata/primary  usedbyrefreservation  0B                      -
mysqldata/primary  logbias               latency                 default
mysqldata/primary  objsetid              263                     -
mysqldata/primary  dedup                 off                     default
mysqldata/primary  mlslabel              none                    default
mysqldata/primary  sync                  standard                default
mysqldata/primary  dnodesize             legacy                  default
mysqldata/primary  refcompressratio      1.00x                   -
mysqldata/primary  written               0                       -
mysqldata/primary  logicalused           12K                     -
mysqldata/primary  logicalreferenced     12K                     -
mysqldata/primary  volmode               default                 default
mysqldata/primary  filesystem_limit      none                    default
mysqldata/primary  snapshot_limit        none                    default
mysqldata/primary  filesystem_count      none                    default
mysqldata/primary  snapshot_count        none                    default
mysqldata/primary  snapdev               hidden                  default
mysqldata/primary  acltype               off                     default
mysqldata/primary  context               none                    default
mysqldata/primary  fscontext             none                    default
mysqldata/primary  defcontext            none                    default
mysqldata/primary  rootcontext           none                    default
mysqldata/primary  relatime              off                     default
mysqldata/primary  redundant_metadata    all                     default
mysqldata/primary  overlay               off                     default
mysqldata/primary  encryption            off                     default
mysqldata/primary  keylocation           none                    default
mysqldata/primary  keyformat             none                    default
mysqldata/primary  pbkdf2iters           0                       default
mysqldata/primary  special_small_blocks  0                       default
```

We can take a read-only snapshot of a ZFS file system with the
`zfs snapshot` command:

```
$ sudo zfs snapshot mysqldata/primary@upgrade-2020-11-24
$ zfs list -t snapshot
NAME                    USED  AVAIL     REFER  MOUNTPOINT
mysqldata/primary@upgrade-2020-11-24     0B      -       24K  -
```

The command takes a snapshot instantly, and it saves the state of the
ZFS file system at a specific point in time. Later on, we can use this
snapshot to roll back to the previous state.

## BTRFS

`btrfs` is installed by default on Ubuntu 20.04 LTS server, and it is
part of the `btrfs-progs` package.

We can create a `btrfs` filesystem across multiple block devices, and we
can dynamically add and remove disks to an existing `btrfs` filesystem.
We do this with the `mkfs.btrfs` command:

```
$ sudo mkfs.btrfs -d single -f /dev/vdd /dev/vde
btrfs-progs v5.4.1
See http://btrfs.wiki.kernel.org for more information.
Label:              (null)
UUID:               753a7481-8c68-4aa5-ab4a-5d1a6753098c
Node size:          16384
Sector size:        4096
Filesystem size:    5.00GiB
Block group profiles:
  Data:             single            8.00MiB
  Metadata:         RAID1           256.00MiB
  System:           RAID1             8.00MiB
SSD detected:       no
Incompat features:  extref, skinny-metadata
Checksum:           crc32c
Number of devices:  2
Devices:
   ID        SIZE  PATH
    1     2.00GiB  /dev/vdd
    2     3.00GiB  /dev/vde
```

The option `-d single` specifies the profile we want to use for the
data block groups.
Similarly, the `-m single` option specifies the profile we want to use for the
metadata block groups.
` -d single` means that data redundancy is disabled.

With `lsblk` or `blkid`, we can see that the two devices have identical
file system UUIDs:

```
$ lsblk -f
NAME FSTYPE LABEL UUID                                 FSAVAIL FSUSE% MOUNTPOINT
vdd  btrfs        753a7481-8c68-4aa5-ab4a-5d1a6753098c
vde  btrfs        753a7481-8c68-4aa5-ab4a-5d1a6753098c
```

```
$ sudo blkid /dev/vdd
/dev/vdd: UUID="753a7481-8c68-4aa5-ab4a-5d1a6753098c" UUID_SUB="d912a7da-8697-487d-9c1c-1a3e1d5a748e" TYPE="btrfs"
$ sudo blkid /dev/vde
/dev/vde: UUID="753a7481-8c68-4aa5-ab4a-5d1a6753098c" UUID_SUB="b45a26f4-2b6e-4f70-b957-1bec20a38ba8" TYPE="btrfs"
```

Unlike `zfs`, which manages storage pools and datasets,
`btrfs` manages volumes and subvolumes. `btrfs` subvolumes and `zfs` datasets
can be mounted as directories. Any time we mount a `btrfs` filesystem
without specifying a `subvolid`, `btrfs` will mount the default subvolume
(subvolid=5).

When we mount a `btrfs` file system that spans several drives, we can
reference any drive that is part of that file system:

```
$ sudo mount /dev/vdd /opt/server-logs
$ df -hT
Filesystem        Type      Size  Used Avail Use% Mounted on
/dev/vdd          btrfs     5.0G  3.6M  4.5G   1% /opt/server-logs
$ lsblk
vdd     252:48   0    2G  0 disk /opt/server-logs
vde     252:64   0    3G  0 disk
```

We used `vdd` to mount the `btrfs` file system. The result is a
5 GiB block device mounted in **/opt/server-log**. The 5 GiB size
comes from adding the `vdd` size of 2 GiB and the `vde` size of 3 GiB.

Unlike `zfs`, which auto-mounts filesystems and pools and does not
require an entry in **/etc/fstab**, `btrfs` normally needs the
following entry to mount the filesystem after system reboot:

```
$ cat /etc/fstab
UUID=753a7481-8c68-4aa5-ab4a-5d1a6753098c  /opt/server-logs btrfs defaults 0 0
```

To create `btrfs` subvolumes, which is the equivalent of `zfs`
datasets, use the `btrfs` command:

```
$ btrfs subvolume create /opt/server-logs/database
Create subvolume '/opt/server-logs/database'
```

We can list the subvolumes and mount the newly created one:

```
$ sudo btrfs subvolume list /opt/server-logs 
ID 257 gen 8 top-level 5 path database
```

```
$ sudo mount -t btrfs  -o subvol=database UUID=753a7481-8c68-4aa5-ab4a-5d1a6753098c /opt/database-logs
$ df -hT
Filesystem        Type      Size  Used Avail Use% Mounted on
/dev/vdd          btrfs     5.0G  3.6M  4.5G   1% /opt/server-logs
/dev/vdd          btrfs     5.0G  3.6M  4.5G   1% /opt/database-logs
```

We mounted the subvolume using the UUID of the top level `btrfs`
filesystem that we listed out with the `lsblk -f` command earlier.

To take a snapshot of a subvolume, use the `btrfs` command:

```
$ sudo btrfs subvolume snapshot /opt/database-logs/ /opt/database-logs/2020-11-24-database-logs-snapshot
Create a snapshot of '/opt/database-logs/' in '/opt/database-logs/2020-11-24-database-logs-snapshot'
```

Display the snapshot with the `btrfs subvolume list` command:

```
$ sudo btrfs subvolume list /opt/server-logs 
ID 257 gen 11 top level 5 path database
ID 258 gen 11 top level 257 path database/2020-11-24-database-logs-snapshot
```
