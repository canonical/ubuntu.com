---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Storage"
  description: "Storage"
  auto_paginate: True
---

Storage means recording digital media on storage devices, like hard
disks. Every storage device on Ubuntu is a block device. Filesystems are helper
tools that make it easier to use block devices.

We discuss block devices and filesystems in a previous chapter.
Filesystems control how data is stored and retrieved from a storage
medium.

Two noteworthy filesystems that stand out from traditional formats are `zfs` and `btrfs`.

For example, both `zfs` and `btrfs` are built with scalability in mind
and can create and manage storage pools that span several disks.
Storage pools are logical partitions in a storage cluster of aggregated
physical disks. Storage pools can expand or reduce available capacity.
Administrators can create pools for particular types of data, such as
block devices, or to separate one group of users from another.

Unlike some traditional filesystems, `zfs` and `btrfs` can self-heal and are
not as susceptible to corruption. Both `zfs` and `btrfs` can detect
corrupted blocks and overwrite them with data from mirrors.
Traditional filesystems like `ext2`, `ext3`, and `ext4`, are unable to
determine whether a block is corrupted and fix it; instead, we need to
manually issue `fsck` (file system check) to check and repair such filesystems.
However, `fsck` is unnecessary on `zfs` and `btrfs`.

`zfs` and `btrfs` are copy-on-write filesystems. This means they do
not overwrite data in place, but append and then shift the pointers marking
the records that contain data.

Both `zfs` and `btrfs` provide administrative tools that are fairly
easy to use.

The `btrfs` filesystem is licensed under the GNU GPL, whereas
`zfs` is licensed under the CDDL (commonly pronounced 'cuddle').
CDDL is a copyleft license, and its compatibility status with Linux
is an issue of much debate.

Ubuntu supports both `btrfs` and `zfs`, and Ubuntu 20.04 enables
new `zfs` features like:

* Native Encryption
* Device removal
* Pool TRIM
* Sequential scrub and resilver

For more information, see the 
[Ubuntu 20.04 LTS release notes](https://wiki.ubuntu.com/FocalFossa/ReleaseNotes#Storage.2FFile_Systems).
