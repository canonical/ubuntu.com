---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Strace"
  description: "Strace"
  auto_paginate: True
---

`strace` is a powerful tool for tracing system calls, signals, and
interactions between the user and kernel spaces. `strace` traces
I/O in plain text.
It comes in handy when troubleshooting programs, trying to isolate
bugs, or simply trying to get a better understanding of how a system
works by tracing its system calls.

It is not recommended to run `strace` in production environments,
as it will seriously impact system performance.
For `strace` to do its job, it pauses the process it traces on each
system call, so that the `strace` debugger can read state. This can
significantly increase latency.

We can use `strace` to trace specific system calls, like `open`,
`read`, or `write`.

Here is an example where we are tracing `write` system calls when
we run the `ls` command:

```
$ sudo strace -e trace=write ls /etc/netplan/
write(1, "50-cloud-init.yaml  br0.yaml\n", 2950-cloud-init.yaml  br0.yaml
) = 29
+++ exited with 0 +++
```

We can also print a summary of all system calls for a target PID:

```
$ sudo strace -c -p 1170
strace: Process 1170 attached
strace: Process 1170 detached
 time     seconds  usecs/call     calls    errors syscall
------ ----------- ----------- --------- --------- ----------------
 45.07    0.000064          16         4           select
 30.99    0.000044          22         2           write
 11.27    0.000016           8         2           read
  8.45    0.000012           1         8           rt_sigprocmask
  2.82    0.000004           4         1           ioctl
  1.41    0.000002           2         1           getpid
------ ----------- ----------- --------- --------- ----------------
100.00    0.000142                    18           total
```
