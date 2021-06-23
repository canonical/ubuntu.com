---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "mkfs"
  description: "mkfs"
  auto_paginate: True
---

`mkfs` (from 'make file system') is the generic utility for creating
file systems. It has a `-t` option that enables you to select the
specific filesystem type. The `mkfs` binary itself is really a
wrapper that implements some generic command-line options, and hands
off to *another* binary like `mkfs.ext4` or `mkfs.btrfs` to do the
heavy lifting.

To create a file system on a block device, you use the following
syntax:

```bash
mkfs -t <type> -L <label> <blockdev>
```

For example, to create an `ext4` filesystem on a partition named
`/dev/vdb1` and assign the label `mail`, you would invoke:

```bash
mkfs -t ext4 -L mail /dev/vdb1
```

The label is an optional identifier that normally reflects the purpose
of the filesystem. In the example above, you would assume that the
filesystem would be used as email storage.

There are *lots* of other options you can set on filesystems, which
you can use for tweaking the physical layout of filesystem data on
the underlying block devices, for specifying the filesystem’s
behavior upon an I/O error on the device, and many other
optimisations.

Most of the time, however, simply using the default `mkfs` options
results in a filesystem that is well suited for the vast majority of
its use cases.
