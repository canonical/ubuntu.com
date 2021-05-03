---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "File Systems"
  description: "File Systems"
  auto_paginate: True
---

Most of the time, you won’t be writing data directly to raw block devices – although
that is a possibility, for certain applications. Instead, you will create and mount
a *filesystem* on the block device.

A filesystem is a POSIX
concept that defines a hierarchical organisation of data. Data is
stored in individual units called *files*. Some files are special
and contain references to other files; these files are called *directories*.

Files obviously have content, but they also carry a large amount
of metadata: files are *owned* by a specific user and group,
permissions on the file are defined in the file’s *mode*, and there
may be additional metadata like *extended attributes* and
*access control lists (ACLs)*.

The POSIX standard defines interfaces for all these concepts, but
their implementation is up to the filesystem. A filesystem normally is
part of the Linux kernel, but there are also filesystems that live in
userspace.

Ubuntu supports multiple Linux filesystems. For the
purposes of this course, we will specifically focus on two
filesystems:

* `ext4` (commonly pronounced *ee-ex-tee-four*) is the fourth
  generation of a lineage of filesystems that runs all the way back
  to 1992’s original extended file system. It is a
  conventional, rewrite-in-place filesystem that was originally
  designed and optimised for spinning disk drives.

* `btrfs` (commonly pronounced *butter-eff-ess*) is a filesystem
  originally devised from scratch for the Linux kernel in 2007. It is
  a copy-on-write file system that was designed with solid-state
  devices from the outset.
