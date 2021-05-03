---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "mount"
  description: "mount"
  auto_paginate: True
---

While `mkfs` creates a filesystem, `mount` makes it available to
applications on your system.

*Mounting* a filesystem requires a *mount point*, which is a
directory in an existing filesystem that is meant to accommodate the
mounted filesystem. 

This of course means that the filesystem hierarchy rolls up to an
initial anchor point called the *file system root*, which all POSIX
operating systems conventionally call `/`.

The reverse of mounting is the removal of a device from its mount
point, which we call *unmounting*. You can only unmount the file
system when it is not in use, meaning no running processes on the
system use open files on the file system.

One consequence of all this is that one filesystem on any Linux
system is special, namely the filesystem containing `/`. This is
called the *root file system*, and it is mounted first, before all
other filesystems, during system boot. You cannot unmount the root
file system, except after unmounting all other filesystems *and*
shutting down all processes using the root file system – these
conditions are normally only met during system shutdown or reboot.

You have multiple ways of referring to a filesystem to mount:

* You can simply specify the block device the filesystem lives on,
  and its mount point. You normally do not have to specify the filesystem type; the `mount` command is clever enough to find that out
  by interrogating the metadata structures on the block device. For example:
  ```bash
  mount /dev/vdb /srv/www
  ```
* You can refer to the filesystem by its label, if you set one during
  `mkfs`. For example:
  ```bash
  mount LABEL=www /srv/www
  ```
* You can also refer to the filesystem by its UUID, which `mkfs`
  creates automatically. For example:
  ```bash
  mount UUID=6b1c9985-6f91-424f-b965-5070c414d138 /srv/www
  ```

Another frequently-used option is to add the filesystem to the
file system table, **/etc/fstab**. Continuing with the examples from
above, all of the following would be valid **/etc/fstab** entries:

```
/dev/vdb                                               /srv/www   auto defaults 0 0
```

```
LABEL=www                                              /srv/www   auto defaults 0 0
```

```
/dev/disk/by-label/www                                 /srv/www   auto defaults 0 0
```

```
UUID=6b1c9985-6f91-424f-b965-5070c414d138              /srv/www   auto defaults 0 0
```

```
/dev/disk/by-uuid/6b1c9985-6f91-424f-b965-5070c414d138 /srv/www   auto defaults 0 0
```

Once your filesystem has an entry in **/etc/fstab**, you can further
abbreviate your `mount` command:

* Specify the mount point, but not the device:
 ```bash
  mount /srv/www
  ```
* Specify the device, but not the mount point:
 ```bash
  mount LABEL=www
  ```

To mount all filesystems listed in **/etc/fstab**, simply use the following command:

```bash
mount -a
```

To *unmount* a filesystem, use the `umount` command. It always
takes the current mount point or the device; `umount` can infer
the rest from the mount information stored in **/proc/mounts**.

```bash
umount /srv/www
```
