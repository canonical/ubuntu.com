---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Block Devices"
  description: "Block Devices"
  auto_paginate: True
---

A *block device,* on a Linux system such as Ubuntu, is a simple
abstraction of a device that allows *block-level input/output,*
colloquially known as 'block I/O'.

The simplest example of a block device is one that represents a disk
drive, which can include:

* A spinning hard drive.
* A Solid State Drive (SSD) using flash memory.
* A persistent-memory card, such as an NVM Express (NVMe) device.
* A Secure Digital (SD, miniSD, or microSD) card.
* A MultiMediaCard (MMC) or embedded MultiMediaCard (eMMC).

Note that this list is not exhaustive. There are many other possibilities.

In addition, Linux has multiple *virtual devices* that also expose a
block device abstraction, such as logical volumes or encrypted block
devices.


## Block I/O

Block input and output (block I/O) is extremely simple: a block device
is logically composed of a sequential number of fixed-length data
chunks called *blocks*. On the device, every block has a number, a
simple zero-indexed integer. This is known as the *offset*. The
offset uniquely identifies each block on the device, and is purely a
logical address. The fact that all blocks on the device have a purely
sequential offset does not reflect the physical layout or structure of
the device.

During a *read* operation on a block device, the
calling process selects a starting block identified by its offset, and
then reads a certain number of blocks into a memory buffer. 

A *write* operation is the exact reverse: the calling process
selects a starting block, and then writes the content of the memory
buffer to the device.

The operation of selecting a starting block, given by its offset, is
known as a *seek*.

For all this to work, the size of a memory buffer (a *page*) must be
an integer multiple of the block size. Linux systems achieve this by
operating on a block size that is either 512 or 4,096 bytes, and a
page size that is either 4,096 bytes (4 KiB) or a multiple thereof.

Block devices in and of themselves only know about blocks. They have
no concept of the semantics of files or directories; that is the
domain of filesystems.


## Block Device Nodes

Every block device that a Linux system knows about has a
representation in the `/dev` tree, via a *block device node.* (These
nodes are actually virtual files, which may be a bit confusing at this
point. Try not to worry about that too much. Just think of them as a
logical representation of a physical device.)

Every block device has a unique name that follows a naming
scheme. Which naming scheme that is depends on the type of block
device:

* Many block devices use the Small Computer Systems Interface (SCSI)
  bus. Their device nodes are named `/dev/sdX`, where `X` is a letter
  from `a` to `z`. If your system has more than 26 SCSI devices,
  those would be named from `/dev/sdaa` through `/dev/sdzz`.

* NVMe devices use a naming scheme of `/dev/nvmeNnN`, where both
  instances of `N` are each a  number, not a letter.

* SD, microSD, and MMC cards all use a naming convention of
  `/dev/mmcblkN`, where `N` is again a number.

* On virtual machines, you will also find block devices using the VirtIO
  bus, which are named `/dev/vdX`, where `X` is a letter as with SCSI
  devices.
  
Logical block devices may use a variety of other naming schemes,
including `/dev/dm-N` for device-mapper block devices.

You can enumerate all the block device nodes that your system knows
about by looking at the content of **/proc/partitions**. For example,
on a machine with a single NVMe device you might see something like this:

```
$ cat /proc/partitions 
major minor  #blocks  name

 259        0  500107608 nvme0n1
 259        1     524288 nvme0n1p1
 259        2     499712 nvme0n1p2
 259        3  499082240 nvme0n1p3
 253        0  499080192 dm-0
 253        1   12582912 dm-1
 253        2   16777216 dm-2
 253        3   25165824 dm-3
 253        4  109051904 dm-4
 253        5    8388608 dm-5
 253        6   50331648 dm-6
```

What are 'partitions', and what are all those `dm-` devices about?
The next section will explain.
