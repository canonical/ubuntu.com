---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Disk Labels and Partitions"
  description: "Disk Labels and Partitions"
  auto_paginate: True
---

It is possible to use the entirety of a block device for a specific
purpose. For example, you could dedicate a whole Solid-State Drive
(SSD) for use by a single file system. Most of the time, however, you
would want to logically subdivide a drive into *partitions*.

Information about which partitions live on a block device and where is stored in
a special area that is usually at the (logical) start of the
disk. We refer to this bit of data as the *disk label*.

Disk labels come in various formats, but the most important ones are:

* The **MS-DOS** disk label (so named because it was introduced by the
  1980s operating system of the same name).
* The GUID Partition Table (GPT) disk label, which uses Globally Unique Identifiers (GUIDs) as partition labels.
  
The MS-DOS disk label is still common in smaller devices, such as SD and MMC cards,
but it has an important drawback: it cannot handle devices larger than 2 TiB in size.
As devices of that size or larger are now quite common, the GPT disk label is the natural alternative.
The GPT disk label can handle devices with 2^64 logical blocks, resulting in an 8 ZiB maximum for 512-byte block devices.

To create and manipulate partitions on block devices, you have several
tools at your disposal:

* `fdisk`, `cfdisk`, and `sfdisk`: These were historically just for
  MS-DOS disk labels, and have since gained support for GPT disk
  labels.
* `gdisk`, `cgdisk`, and `sgdisk`: These were originally designed for
  GPT disk labels.
* `parted` (terminal) and `gparted` (graphical): These are high-level
  block device and file system manipulation utilities, and support
  either disk label type.

There are several others, but these are the most important ones you
have easy access to on any Ubuntu system.

To illustrate some the information you can retrieve using these tools,
consider the following output from `sgdisk`, printing out information
about an NVMe device:

```
$ sgdisk --print /dev/nvme0n1
Disk /dev/nvme0n1: 1000215216 sectors, 476.9 GiB
Model: KXG50ZNV512G NVMe TOSHIBA 512GB         
Sector size (logical/physical): 512/512 bytes
Disk identifier (GUID): C6734E63-EC8F-4CCF-822A-E2CCF4E1408A
Partition table holds up to 128 entries
Main partition table begins at sector 2 and ends at sector 33
First usable sector is 34, last usable sector is 1000215182
Partitions will be aligned on 2048-sector boundaries
Total free space is 2669 sectors (1.3 MiB)

Number  Start (sector)    End (sector)  Size       Code  Name
   1            2048         1050623   512.0 MiB   EF00  EFI System Partition
   2         1050624         2050047   488.0 MiB   8300  
   3         2050048      1000214527   476.0 GiB   8300  
```

Apart from the fact that this tells you that the block device has
three partitions, and gives you the size and geometry of each, it also
tells you the partition type in the `Code` column of its output. 

You can also retrieve some important information about each partition
using `blkid`:

```
$ blkid /dev/nvme0n1p1
/dev/nvme0n1p1: UUID="E644-6124" TYPE="vfat" PARTLABEL="EFI System Partition" PARTUUID="f32c0662-b371-47b2-8f7e-9392f46832a5"
```

In this example (which refers to an EFI system partition),
`blkid` lists the partition label, and also the unique identifier of
the partition. It also lists the filesystem currently in use on the
partition. More information about filesystems is provided in a later section.
