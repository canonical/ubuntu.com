---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Configuring the Linux Kernel"
  description: "Configuring the Linux Kernel"
  auto_paginate: True
---

Ubuntu LTS releases come with a General Availability (GA) kernel for
one version and a Hardware Enablement (HWE) kernel for another version.

Ubuntu 20.04 has been released with the 5.4 generic kernel, and 
the first HWE kernel will be available in Ubuntu 20.04.2. (For
comparison, the first Ubuntu 18.04 release came with the 4.15
generic kernel, and Ubuntu 18.04.2 was released with the 4.18
HWE kernel.) For more information, refer to the Ubuntu Wiki entries on
[LTS Enablement Stacks](https://wiki.ubuntu.com/Kernel/LTSEnablementStack)
and [Rolling HWE Stacks](https://wiki.ubuntu.com/Kernel/RollingLTSEnablementStack).

A generic kernel is a general-purpose kernel that is a viable option
for most of the Ubuntu Server and Desktop installations.
It contains the word 'generic' in its name:

```
$ uname  -r
5.4.0-52-generic
```

An HWE kernel is a later version of the upstream kernel that includes
drivers for newer hardware and other kernel updates.

We can use the `apt` command to find out whether an HWE kernel is available:

```
$ apt search linux.*generic.*hwe.*20.04
linux-generic-hwe-20.04/focal-updates,focal-security 5.4.0.52.55 amd64
  Complete Generic Linux kernel and headers
```

Ubuntu comes with some use-case-specific kernels too, to mention a few:

* generic-hwe-edge – Contains the latest generic-hwe kernel updates.
* lowlatency-hwe-edge – Contains the latest lowlatency-hwe kernel updates.
* kvm – Used when Ubuntu is installed as a KVM guest.
* aws, azure – Used when Ubuntu is running on an AWS or Azure cloud.

If we want to upgrade the kernel on an Ubuntu server to an HWE
kernel version, all we need to do is to install the new kernel
and reboot the machine:

```
$ sudo apt install --install-recommends linux-generic-hwe-20.04
```

## Modules

Kernel modules are independent files that contain kernel code.
The kernel boots faster if it does not load everything at boot-time.
Then, we can extend the kernel by loading only the kernel modules that
we need.

The `lsmod` command lists the kernel modules currently loaded:

```
$ lsmod
Module                  Size  Used by
xt_CHECKSUM            16384  1
xt_MASQUERADE          20480  3
xt_conntrack           16384  1
ipt_REJECT             16384  2
nf_reject_ipv4         16384  1 ipt_REJECT
...
kvm_intel             282624  0
kvm                   663552  1 kvm_intel
input_leds             16384  0
joydev                 24576  0
qemu_fw_cfg            20480  0
mac_hid                16384  0
serio_raw              20480  0
sch_fq_codel           20480  4
ip_tables              32768  3 iptable_filter,iptable_nat,iptable_mangle
...
psmouse               155648  0
virtio_net             53248  0
virtio_blk             20480  3
net_failover           20480  1 virtio_net
failover               16384  1 net_failover
...
```

Where are these modules coming from, and how were they installed?

The modules come from `initrd`, the initial RAM disk. It is a directory structure, and is
the first root filesystem a machine has access to when booting,
before the real root filesystem is loaded.

When booting an Ubuntu server, the boot loader loads the kernel and
the `initrd` image in memory, and then it starts the kernel.

`initrd` contains, amongst others, many kernel modules that are
loaded based on what packages are installed.

We can use the `lsinitramfs` command to list all the available
modules in an `initrd` image, filtering to files with the '.ko'
extension, where 'ko' stands for kernel object.

```
$ lsinitramfs /boot/initrd.img-5.4.0-52-generic | grep .ko
...
usr/lib/modules/5.4.0-52-generic/kernel/arch/x86/crypto/aegis128-aesni.ko
usr/lib/modules/5.4.0-52-generic/kernel/arch/x86/crypto/aesni-intel.ko
usr/lib/modules/5.4.0-52-generic/kernel/arch/x86/crypto/blowfish-x86_64.ko
usr/lib/modules/5.4.0-52-generic/kernel/arch/x86/crypto/camellia-aesni-avx-x86_64.ko
...
usr/lib/modules/5.4.0-52-generic/kernel/arch/x86/kvm/kvm.ko
usr/lib/modules/5.4.0-52-generic/kernel/crypto/842.ko
usr/lib/modules/5.4.0-52-generic/kernel/crypto/adiantum.ko
usr/lib/modules/5.4.0-52-generic/kernel/crypto/aegis128.ko
usr/lib/modules/5.4.0-52-generic/kernel/crypto/aes_ti.ko
...
usr/lib/modules/5.4.0-52-generic/kernel/net/ieee802154/ieee802154.ko
usr/lib/modules/5.4.0-52-generic/kernel/net/ipv4/gre.ko
usr/lib/modules/5.4.0-52-generic/kernel/net/ipv4/udp_tunnel.ko
usr/lib/modules/5.4.0-52-generic/kernel/net/ipv6/ip6_tunnel.ko
usr/lib/modules/5.4.0-52-generic/kernel/net/ipv6/ip6_udp_tunnel.ko
....
usr/lib/modules/5.4.0-52-generic/kernel/sound/core/snd-seq-device.ko
usr/lib/modules/5.4.0-52-generic/kernel/sound/core/snd-timer.ko
usr/lib/modules/5.4.0-52-generic/kernel/sound/core/snd.ko
usr/lib/modules/5.4.0-52-generic/kernel/sound/soc/snd-soc-core.ko
usr/lib/modules/5.4.0-52-generic/kernel/sound/soundcore.ko
```

## Runtime Parameters

Another way we can alter the kernel behavior is by modifying
kernel runtime parameters.

We can list all the kernel runtime parameters with the `sysctl`
command:

```
$ sysctl -a
abi.vsyscall32 = 1
debug.exception-trace = 1
debug.kprobes-optimization = 1
dev.cdrom.autoclose = 1
...
net.ipv6.conf.virbr0-nic.accept_ra_mtu = 1
net.ipv6.conf.virbr0-nic.accept_ra_pinfo = 1
net.ipv6.conf.virbr0-nic.accept_ra_rt_info_max_plen = 0
net.ipv6.conf.virbr0-nic.accept_ra_rt_info_min_plen = 0
net.ipv6.conf.virbr0-nic.accept_ra_rtr_pref = 1
net.ipv6.conf.virbr0-nic.accept_redirects = 1
net.ipv6.conf.virbr0-nic.accept_source_route = 0
...
vm.panic_on_oom = 0
vm.percpu_pagelist_fraction = 0
vm.stat_interval = 1
vm.swappiness = 60
vm.unprivileged_userfaultfd = 1
vm.user_reserve_kbytes = 131072
vm.vfs_cache_pressure = 100
vm.watermark_boost_factor = 0
vm.watermark_scale_factor = 10
vm.zone_reclaim_mode = 0
```

If we want to check the value of a kernel runtime parameter
(such as `fs.file-max`, which defines the maximum number of
open files), we can run `sysctl` like this:

```
$ sudo sysctl fs.file-max
fs.file-max = 9223372036854775807
```
