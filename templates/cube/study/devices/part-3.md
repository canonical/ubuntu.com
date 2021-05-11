---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Device Mapper"
  description: "Device Mapper"
  auto_paginate: True
---

There is a special facility in the Linux kernel to manage logical
block devices, called *device mapper*. For brevity, this is often
abbreviated as *dm*.

Device mapper is really a full-blown framework for managing block
devices that allows users to build intricate layered storage
configurations, but two applications of that framework stand out as
being most widely used:

* Logical Volume Management (LVM).
* `dm-crypt`, a device mapper facility to manage block-level device
  encryption.

### LVM

LVM is a facility that allows users to:

* Define physical block devices (or partitions) as *Physical
  Volumes* (PVs).
* Combine one or more PVs into *Volume Groups* (VGs).
* Carve out multiple *Logical Volumes* (LVs), each of
  which then acts as a block device in its own right.

For example, if you were operating on a server that has two unused
block devices named `/dev/vdb` and `/dev/vdc`, you could initialize
both as PVs, and then assign them to a VG named `volumes`:

```
# pvcreate /dev/vdb /dev/vdc
  Physical volume "/dev/vdb" successfully created.
  Physical volume "/dev/vdc" successfully created.

# vgcreate volumes /dev/vdb /dev/vdc
  Volume group "volumes" successfully created
```

Then, if you wanted to carve out two logical volumes, each 3 GiB in
size and named `mail` and `www`, you could use:

```
root@bob:~# lvcreate -n mail -L 3G volumes
  Logical volume "mail" created.
root@bob:~# lvcreate -n www -L 3G volumes
  Logical volume "www" created.
```

At this stage, LVM has created two block devices for you, which you
can access as `/dev/volumes/mail` and `/dev/volumes/www`. You can now
use these *logical* block devices as you would any *physical* block
devices, and dm will do the work for translating any block I/O operations on
your LVs into physical storage I/O.


### `dm-crypt`

`dm-crypt` is another device mapper facility that allows users to
create volumes whose data is transparently decrypted when read
into memory, and transparently encrypted when written to disk.

You create and manipulate `dm-crypt` devices with the `cryptsetup`
utility. Most `dm-crypt` devices will typically use the Linux Unified
Key Setup (LUKS), and thus are commonly referred to as *LUKS
volumes*.

To create a LUKS volume on a block device named `/dev/vdb`, you could
use `cryptsetup luksFormat` in the following manner:

```
# cryptsetup luksFormat /dev/vdb

WARNING!
========
This will overwrite data on /dev/vdb irrevocably.

Are you sure? (Type uppercase yes): YES
Enter passphrase for /dev/vdb: 
Verify passphrase: 
```

You will be prompted to give your passphrase twice.

Then, to use your transparently encrypted device, you would use
`cryptsetup luksOpen`, specifying a logical device name:

```
# cryptsetup luksOpen /dev/vdb encrypteddev
Enter passphrase for /dev/vdb: 
```

In this example, once your correct passphrase is accepted, your block device becomes
available as `/dev/mapper/encrypteddev`. You can
then use that logical device like any other block device. Any data you
write to it will pass through a layer of secure encryption before
being committed to physical storage on `/dev/vdb`.
