---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Linux Kernel Architecture"
  description: "Linux Kernel Architecture"
  auto_paginate: True
---

The Linux kernel architecture includes the following parts:

* Process scheduling subsystem
* Inter-process communication subsystem
* Memory management subsystem
* Virtual file system
* Network subsystem

## Process Scheduling

Linux is a multitasking operating system, which means multiple processes
seem to run at the same time. The process scheduler is what makes this
possible. A processor can run only one process at a time. All systems
today use multi-core processors and the number of processes we can run
at a time would be limited to the number of available cores.
By using time-sharing, several processes can run in what
appears to be the same time. The CPU time is divided into time slices,
and the kernel instructs which process should execute in
which time slice.

The process scheduler assigns policies, which are complex algorithms,
and priorities to each process and determines which process thread
will execute next.

The scheduling policies are:

* `SCHED_OTHER` – The default policy, used for processes that need
  normal time-sharing, without other special needs.
* `SCHED_FIFO` – For first-in, first-out real-time processes
* `SCHED_RR` – Round robin policy for real-time processes like sound
  and video applications
* `SCHED_BATCH` – For CPU-hungry processes like compilers and database
  search engines.
* `SCHED_IDLE` – This policy is improved in the 5.4 kernel release,
  and ensures lower latency for high priority processes by using this
  policy for low priority ones.
* `SCHED_DEADLINE` – For multimedia and industrial processes that
  need resource reservation.

We can use the `chrt` command to check the scheduling policy and
the priority of a process.

```
ubuntu@deploy:~$ pidof sshd
11222 11210 10851 10838 742
ubuntu@deploy:~$ chrt -p 11222
pid 11222's current scheduling policy: SCHED_OTHER
pid 11222's current scheduling priority: 0
```

In the preceding example, we are looking at the `sshd` process.
Its policy is set to 'SCHED_OTHER', which means it uses a normal
time-sharing scheduling policy and a priority of '0'.

We can use the same command to find out the priority interval for
each scheduling policy:

```
$ chrt -m
SCHED_OTHER min/max priority: 0/0
SCHED_FIFO min/max priority: 1/99
SCHED_RR min/max priority: 1/99
SCHED_BATCH min/max priority: 0/0
SCHED_IDLE min/max priority: 0/0
SCHED_DEADLINE min/max priority: 0/0
```

If we check the `multipathd` process, we can see that it uses the
'SCHED_RR' round robin real-time scheduling policy and it has a
priority set to 99, the highest possible value.

```
ubuntu@deploy:~$ pidof multipathd
522
ubuntu@deploy:~$ chrt -p 522
pid 522's current scheduling policy: SCHED_RR
pid 522's current scheduling priority: 99
```

## Inter-Process Communication Subsystem

Inter-process communication (IPC) means exchanging data between
multiple threads that belong to the same process.

Here are some examples where processes use IPC to manage shared data:

* Data Transfers – Occur when processes use shared files, pipes, or
  TCP/IP sockets.
* Shared Memory – Occurs when multiple processes access the same block
  of memory.
* System Messages – Occur when signals, semaphores, and locks are used
  to command other processes.

Let's see how inter-process communication takes place when using
pipes.

In the following example, we search for a pattern in **/dev/urandom**. We
use `cat` and `grep` processes that interact with each
other through an unnamed pipe. `cat` writes data from **/dev/urandom**
and `grep` reads it.

```
ubuntu@deploy:~$ cat /dev/urandom | grep "Ubuntu 20.04 LTS" &
[1] 11662
```

If we look at the file descriptors for the `cat` command, we will find
the pipe:

```
ubuntu@deploy:/proc/11631/fd$ cd /proc/11662/fd
ubuntu@deploy:/proc/11662/fd$ ll
total 0
dr-x------ 2 ubuntu ubuntu  0 Nov 10 00:32 ./
dr-xr-xr-x 9 ubuntu ubuntu  0 Nov 10 00:32 ../
lr-x------ 1 ubuntu ubuntu 64 Nov 10 00:32 0 -> 'pipe:[135622]'
lrwx------ 1 ubuntu ubuntu 64 Nov 10 00:32 1 -> /dev/pts/3
lrwx------ 1 ubuntu ubuntu 64 Nov 10 00:32 2 -> /dev/pts/3
```

We can now check which processes use the pipe with the `lsof`
command. Here we can find that `cat` communicates with `grep`:

```
ubuntu@deploy:/proc/11662/fd$ lsof | grep 135622
lsof: WARNING: can't stat() tracefs file system /sys/kernel/debug/tracing
      Output information may be incomplete.
cat       11661                           ubuntu    1w     FIFO               0,13      0t0     135622 pipe
grep      11662                           ubuntu    0r     FIFO               0,13      0t0     135622 pipe
```

We can also use the `strace` command to intercept inter-process
communication:

```
$ strace -p 11661
```

## Memory Management Subsystem

Processes need memory to be able to run, and the memory management
subsystem can dynamically allocate memory to them on request.

The memory management is also responsible for implementing the virtual
memory, which is a way of translating virtual memory addresses (used
by processes) to physical memory addresses located in the physical RAM.
Virtual memory can also increase the amount of available memory by
adding external storage devices (like hard-disks) to act as if they
were part of the physical RAM.

If we want to see how much memory a process consumes, we can use the
`pmap` command:

```
$ sudo pmap 12425
12425:   grep --color=auto Ubuntu 20.04 LTS
00005591ba581000     16K r---- grep
00005591ba585000    136K r-x-- grep
00005591ba5a7000     36K r---- grep
00005591ba5b1000      4K r---- grep
00005591ba5b2000      4K rw--- grep
00005591ba5b3000      8K rw---   [ anon ]
00005591bb3a3000    132K rw---   [ anon ]
00007fc6f4c55000   2968K r---- locale-archive
00007fc6f4f3b000      8K rw---   [ anon ]
00007fc6f4f3d000     28K r---- libpthread-2.31.so
00007fc6f4f44000     68K r-x-- libpthread-2.31.so
00007fc6f4f55000     20K r---- libpthread-2.31.so
00007fc6f4f5a000      4K r---- libpthread-2.31.so
00007fc6f4f5b000      4K rw--- libpthread-2.31.so
00007fc6f4f5c000     16K rw---   [ anon ]
00007fc6f4f60000    148K r---- libc-2.31.so
00007fc6f4f85000   1504K r-x-- libc-2.31.so
00007fc6f50fd000    296K r---- libc-2.31.so
00007fc6f5147000      4K ----- libc-2.31.so
00007fc6f5148000     12K r---- libc-2.31.so
00007fc6f514b000     12K rw--- libc-2.31.so
00007fc6f514e000     16K rw---   [ anon ]
00007fc6f5152000      4K r---- libdl-2.31.so
00007fc6f5153000      8K r-x-- libdl-2.31.so
00007fc6f5155000      4K r---- libdl-2.31.so
00007fc6f5156000      4K r---- libdl-2.31.so
00007fc6f5157000      4K rw--- libdl-2.31.so
00007fc6f5158000      8K r---- libpcre.so.3.13.3
00007fc6f515a000    324K r-x-- libpcre.so.3.13.3
00007fc6f51ab000    120K r---- libpcre.so.3.13.3
00007fc6f51c9000      4K r---- libpcre.so.3.13.3
00007fc6f51ca000      4K rw--- libpcre.so.3.13.3
00007fc6f51cb000      8K rw---   [ anon ]
00007fc6f51d7000      4K r---- ld-2.31.so
00007fc6f51d8000    140K r-x-- ld-2.31.so
00007fc6f51fb000     32K r---- ld-2.31.so
00007fc6f5204000      4K r---- ld-2.31.so
00007fc6f5205000      4K rw--- ld-2.31.so
00007fc6f5206000      4K rw---   [ anon ]
00007ffcfc54c000    132K rw---   [ stack ]
00007ffcfc5cb000     12K r----   [ anon ]
00007ffcfc5ce000      4K r-x--   [ anon ]
ffffffffff600000      4K --x--   [ anon ]
 total             6276K
```

The `pmap` command shows that the total amount of memory consumed by the process
with PID 12425 is 6276KiB. It also displays memory consumption per library used.

## Virtual File System

The virtual file system VFS in the Linux kernel provides filesystem
access to the user processes. It is what makes everything appear like
a file in the Linux operating system; documents, directories,
hard-drives, keyboards, and printers are essentially files.
It also makes it possible for several filesystems to exist side-by-side
on the same operating system installation.

Here's an example where we can see that the disk `vda` appears like
a file on the filesystem.

```
$ ls -l /dev/vda*
brw-rw---- 1 root disk 252,  0 Nov  4 12:53 /dev/vda
brw-rw---- 1 root disk 252,  1 Nov  4 12:53 /dev/vda1
brw-rw---- 1 root disk 252, 14 Nov  4 12:53 /dev/vda14
brw-rw---- 1 root disk 252, 15 Nov  4 12:53 /dev/vda15
ubuntu@deploy:~$ file /dev/vda1
/dev/vda1: block special (252/1)
```

System calls like `open`, `read`, and `write`, which processes use to
interact with the filesystem, are part of the VFS code.

Inodes (index nodes) are used to describe files and directories in
a filesystem.

In the following example, we invoke the `lookup` system call in VFS when
running the `stat` command to get inode information for a file:

```
$ stat /etc/ssh/sshd_config
  File: /etc/ssh/sshd_config
  Size: 3287      	Blocks: 8          IO Block: 4096   regular file
Device: fc01h/64513d	Inode: 1245        Links: 1
Access: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)
Access: 2020-11-04 12:49:34.156000000 +0000
Modify: 2020-04-23 06:43:27.677895955 +0000
Change: 2020-04-23 06:44:52.673853539 +0000
 Birth: -
```

## Network Subsystem

The networking code in the Linux kernel is complex, and is a
significant part of the kernel code. The network subsystem is
responsible for processing data packets, implementing networking
protocols, and other networking functionality.

When a process running in user space needs to communicate with the
kernel network stack, it does so by using sockets. A socket is an
interface to the TCP/IP protocol implementation in the kernel. Sockets
exist as long as the process using them does not close them.

This is a high-level view of what happens in the kernel when a
frame is received:

1. The network interface card (NIC) receives a frame, which is a chunk
   of data that follows a certain format. It transfers the frame to a
   hardware buffer or to a ring buffer, like BPF.
2. The NIC signals the CPU that it received a frame by sending
   a hardware interrupt.
3. The kernel moves the frame from hardware buffers up into
   the kernel network stack. Here, the frame is forwarded higher
   up in the kernel stack, passed to another listening socket, or
   dropped.
4. The frame is moved from the kernel network stack into the
   application via `read`, `recv`, and `recvfrom` system calls.

`tcpdump` captures packet flow through the TCP/IP networking stack.
In the following example, we run `tcpdump` with the `-d` option, which
triggers the kernel's `bpf_asm` assembler to generate BPF bytecode.

```
$ sudo tcpdump -d tcp dst port 80
(000) ldh      [12]
(001) jeq      #0x86dd          jt 2 jf 6
(002) ldb      [20]
(003) jeq      #0x6             jt 4 jf 15
(004) ldh      [56]
(005) jeq      #0x50            jt 14 jf 15
(006) jeq      #0x800           jt 7 jf 15
(007) ldb      [23]
(008) jeq      #0x6             jt 9 jf 15
(009) ldh      [20]
(010) jset     #0x1fff          jt 15 jf 11
(011) ldxb     4*([14]&0xf)
(012) ldh      [x + 16]
(013) jeq      #0x50            jt 14 jf 15
(014) ret      #262144
(015) ret      #0

```
