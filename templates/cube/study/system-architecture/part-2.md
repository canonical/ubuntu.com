---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Hardware Components"
  description: "Hardware Components"
  auto_paginate: True
---

When you want to install Ubuntu on a server or a laptop, you need to
know the hardware architecture of that system so that you can
download and install the correct Ubuntu version.

A system's hardware architecture is determined by its processor
architecture.

If you have an x86_64 CPU on
your system, you need to download and install the Ubuntu AMD64 version
(for example, Ubuntu 20.04 LTS).

If you have an ARM64 CPU on
your system, then you need to download and install the Ubuntu ARM64
version (for example, Ubuntu 20.04.1 LTS that supports ARM-based
servers).

This applies even when selecting a simple user application, if for
some reason you choose to install it from a `.deb` package instead of
using a package manager like `apt`. If you try to install an ARM64
package on an x86_64 system, you will get an error:

```
$ sudo apt install ./cmatrix_2.0-2_arm64.deb
Reading package lists... Done
Building dependency tree
Reading state information... Done
Note, selecting 'cmatrix:arm64' instead of './cmatrix_2.0-2_arm64.deb'
Some packages could not be installed. This may mean that you have
requested an impossible situation or if you are using the unstable
distribution that some required packages have not yet been created
or been moved out of Incoming.
The following information may help to resolve the situation:

The following packages have unmet dependencies:
 cmatrix:arm64 : Depends: libc6:arm64 (>= 2.17) but it is not installable
                 Depends: libncurses6:arm64 (>= 6) but it is not installable
                 Depends: libtinfo6:arm64 (>= 6) but it is not installable
                 Recommends: kbd:arm64 but it is not installable
E: Unable to correct problems, you have held broken packages.
```

## Identify Hardware Architecture

On a system that is running Ubuntu, we can determine the hardware
architecture using the `uname` command that prints system information.
We can run the command with the `-m` option to print the machine name,
or the `-p` option to print the processor type, or `-i` option to
print the hardware platform:

```
$ uname -m
x86_64
$ uname -p
x86_64
$ uname -i
x86_64
```

## Identify Whether a Server is a VM or Physical Machine

Occasionally, we log in to a system without having too much information
ahead about its hardware. If we need to identify virtual or physical
devices, there are quite a few command-line tools we can use.

To start with, if we want to find out if the system we are currently
logged in to is a physical server or a virtual machine (VM),
we can use `dmidecode`.

```
$ sudo dmidecode -s system-manufacturer
OpenStack Foundation
```

The manufacturer information in the preceding example shows this is a VM.

```
$ sudo dmidecode -s system-manufacturer
Dell Inc.
```

The manufacturer information in the preceding case shows this is a physical machine.

We can also use `hostnamectl`.

```
$ hostnamectl status
   Static hostname: deploy
         Icon name: computer-vm
           Chassis: vm
        Machine ID: d58354ed6b5f4b71868a6574d9019003
           Boot ID: feb1c9749ce147e89efc177bf0fe5066
    Virtualization: kvm
  Operating System: Ubuntu 20.04.1 LTS
            Kernel: Linux 5.4.0-54-generic
      Architecture: x86-64
```

`Icon name: computer-vm`, `Chassis: vm`, and  `Virtualization: kvm`
indicate this is a VM.

```
$ hostnamectl status
   Static hostname: twiggy
         Icon name: computer-laptop
           Chassis: laptop
        Machine ID: 11fb78c21a724ff0947bce5b8fe152fb
           Boot ID: 07f2cbadb5f34663baf701578da0b664
  Operating System: Ubuntu 20.04.1 LTS
            Kernel: Linux 5.4.0-53-generic
      Architecture: x86-64
```

`Icon name: computer-laptop` and `Chassis: laptop` indicate this is a
physical machine.

Other commands like `lshw` and `systemd-detect-virt` provide information
on whether the system is a VM or a physical machine.

```
$ sudo lshw -class system
deploy
    description: Computer
    product: OpenStack Nova
    vendor: OpenStack Foundation
    version: 20.0.2
    serial: d58354ed-6b5f-4b71-868a-6574d9019003
    width: 64 bits
    capabilities: smbios-2.8 dmi-2.8 smp vsyscall32
    configuration: boot=normal family=Virtual Machine uuid=ED5483D5-5F6B-714B-868A-6574D9019003
  *-pnp00:00
       product: PnP device PNP0b00
       physical id: 1
       capabilities: pnp
       configuration: driver=rtc_cmos
```

```
$ systemd-detect-virt
kvm
```

## Identify CPU

`lscpu` displays information about the CPU and its specifications.
`lscpu` collects information from **/proc/cpuinfo**.

```
$ lscpu
Architecture:                    x86_64
CPU op-mode(s):                  32-bit, 64-bit
Byte Order:                      Little Endian
Address sizes:                   40 bits physical, 48 bits virtual
CPU(s):                          4
On-line CPU(s) list:             0-3
Thread(s) per core:              1
Core(s) per socket:              1
Socket(s):                       4
NUMA node(s):                    1
Vendor ID:                       GenuineIntel
CPU family:                      6
Model:                           60
Model name:                      Intel Core Processor (Haswell, no TSX)
Stepping:                        1
CPU MHz:                         2593.992
BogoMIPS:                        5187.98
Virtualization:                  VT-x
Hypervisor vendor:               KVM
Virtualization type:             full
L1d cache:                       128 KiB
L1i cache:                       128 KiB
L2 cache:                        16 MiB
L3 cache:                        64 MiB
NUMA node0 CPU(s):               0-3
Vulnerability Itlb multihit:     KVM: Mitigation: Split huge pages
Vulnerability L1tf:              Mitigation; PTE Inversion; VMX conditional cache flushes, SMT disabled
Vulnerability Mds:               Vulnerable: Clear CPU buffers attempted, no microcode; SMT Host state unknown
Vulnerability Meltdown:          Mitigation; PTI
Vulnerability Spec store bypass: Vulnerable
Vulnerability Spectre v1:        Mitigation; usercopy/swapgs barriers and __user pointer sanitization
Vulnerability Spectre v2:        Mitigation; Full generic retpoline, STIBP disabled, RSB filling
Vulnerability Srbds:             Unknown: Dependent on hypervisor status
Vulnerability Tsx async abort:   Not affected
Flags:                           fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush mmx fxsr sse sse2 syscall nx rd
                                 tscp lm constant_tsc rep_good nopl xtopology cpuid tsc_known_freq pni pclmulqdq vmx ssse3 fma cx16 pcid sse4_1 
                                 sse4_2 x2apic movbe popcnt tsc_deadline_timer aes xsave avx f16c rdrand hypervisor lahf_lm abm cpuid_fault invp
                                 cid_single pti tpr_shadow vnmi flexpriority ept vpid ept_ad fsgsbase bmi1 avx2 smep bmi2 erms invpcid xsaveopt 
                                 arat
```

Here is what the preceding output reveals about the CPU:

* It is from Intel – 'Model name: Intel Core Processor (Haswell, no TSX)'
* It has 4 cores – 'CPU(s): 4'
* Hyperthreading is disabled – 'Thread(s) per core: 1'
* Its speed is 2,6 GHz – 'CPU MHz: 2593.992'
* It has 16 MiB L2 cache – 'L2 cache: 16 MiB'
* It has 64 MiB of L3 cache – 'L3 cache: 64 MiB'

We can retrieve information about the CPU using the `lshw` command
in JSON format:

```
$ sudo lshw -c CPU -json |  jq '.[0]'
{                           
  "id": "cpu:0",
  "class": "processor",
  "claimed": true,
  "handle": "DMI:0400",
  "description": "CPU",
  "product": "Intel Core Processor (Haswell, no TSX)",
  "vendor": "Intel Corp.",
  "physid": "400",
  "businfo": "cpu@0",
  "version": "pc-i440fx-4.0",
  "slot": "CPU 0",
  "units": "Hz",
  "size": 2000000000,
  "capacity": 2000000000,
  "width": 64,
  "configuration": {
    "cores": "1",
    "enabledcores": "1",
    "threads": "1"
  },
  "capabilities": {
    "fpu": "mathematical co-processor",
    "fpu_exception": "FPU exceptions reporting",
    "wp": true,
    "vme": "virtual mode extensions",
    "de": "debugging extensions",
    "pse": "page size extensions",
    "tsc": "time stamp counter",
    "msr": "model-specific registers",
    "pae": "4GB+ memory addressing (Physical Address Extension)",
    "mce": "machine check exceptions",
    "cx8": "compare and exchange 8-byte",
    "apic": "on-chip advanced programmable interrupt controller (APIC)",
    "sep": "fast system calls",
    "mtrr": "memory type range registers",
    "pge": "page global enable",
    "mca": "machine check architecture",
    "cmov": "conditional move instruction",
    "pat": "page attribute table",
    "pse36": "36-bit page size extensions",
    "clflush": true,
    "mmx": "multimedia extensions (MMX)",
    "fxsr": "fast floating point save/restore",
    "sse": "streaming SIMD extensions (SSE)",
    "sse2": "streaming SIMD extensions (SSE2)",
    "syscall": "fast system calls",
    "nx": "no-execute bit (NX)",
    "rdtscp": true,
    "x86-64": "64bits extensions (x86-64)",
    "constant_tsc": true,
    "rep_good": true,
    "nopl": true,
    "xtopology": true,
    "cpuid": true,
    "tsc_known_freq": true,
    "pni": true,
    "pclmulqdq": true,
    "vmx": true,
    "ssse3": true,
    "fma": true,
    "cx16": true,
    "pcid": true,
    "sse4_1": true,
    "sse4_2": true,
    "x2apic": true,
    "movbe": true,
    "popcnt": true,
    "tsc_deadline_timer": true,
    "aes": true,
    "xsave": true,
    "avx": true,
    "f16c": true,
    "rdrand": true,
    "hypervisor": true,
    "lahf_lm": true,
    "abm": true,
    "cpuid_fault": true,
    "invpcid_single": true,
    "pti": true,
    "tpr_shadow": true,
    "vnmi": true,
    "flexpriority": true,
    "ept": true,
    "vpid": true,
    "ept_ad": true,
    "fsgsbase": true,
    "bmi1": true,
    "avx2": true,
    "smep": true,
    "bmi2": true,
    "erms": true,
    "invpcid": true,
    "xsaveopt": true,
    "arat": true
  }
}
```

## Identify Memory

To identify the physical memory type and its specifications, we
can use either `dmidecode` or `lshw`.

```
$ sudo dmidecode -t  memory
# dmidecode 3.2
Getting SMBIOS data from sysfs.
SMBIOS 2.8 present.

Handle 0x1000, DMI type 16, 23 bytes
Physical Memory Array
	Location: Other
	Use: System Memory
	Error Correction Type: Multi-bit ECC
	Maximum Capacity: 16 GB
	Error Information Handle: Not Provided
	Number Of Devices: 1

Handle 0x1100, DMI type 17, 40 bytes
Memory Device
	Array Handle: 0x1000
	Error Information Handle: Not Provided
	Total Width: Unknown
	Data Width: Unknown
	Size: 16384 MB
	Form Factor: DIMM
	Set: None
	Locator: DIMM 0
	Bank Locator: Not Specified
	Type: RAM
	Type Detail: Other
	Speed: Unknown
	Manufacturer: QEMU
	Serial Number: Not Specified
	Asset Tag: Not Specified
	Part Number: Not Specified
	Rank: Unknown
	Configured Memory Speed: Unknown
	Minimum Voltage: Unknown
	Maximum Voltage: Unknown
	Configured Voltage: Unknown
```

```
$ sudo lshw -c MEMORY -json
[                           
  {
    "id" : "firmware",
    "class" : "memory",
    "claimed" : true,
    "description" : "BIOS",
    "vendor" : "SeaBIOS",
    "physid" : "0",
    "version" : "1.10.2-1ubuntu1",
    "date" : "04/01/2014",
    "units" : "bytes",
    "size" : 98304
  },
  {
    "id" : "memory",
    "class" : "memory",
    "claimed" : true,
    "handle" : "DMI:1000",
    "description" : "System Memory",
    "physid" : "1000",
    "units" : "bytes",
    "size" : 17179869184,
    "configuration" : {
      "errordetection" : "multi-bit-ecc"
    },
    "capabilities" : {
      "ecc" : "Multi-bit error-correcting code (ECC)"
    },
    "children" : [
      {
        "id" : "bank",
        "class" : "memory",
        "claimed" : true,
        "handle" : "DMI:1100",
        "description" : "DIMM RAM",
        "vendor" : "QEMU",
        "physid" : "0",
        "slot" : "DIMM 0",
        "units" : "bytes",
        "size" : 17179869184
      }
    ]
  }
]
```

Here is what the preceding outputs tell us about the memory:

* Its size is 16 GB – 'Maximum Capacity: 16 GB'
* It is emulated memory – 'Manufacturer: QEMU'
* The firmware vendor SeaBIOS is an open-source firmware used for
  emulators like QEMU – "vendor" : "SeaBIOS"

`lsmem` displays the ranges of available memory:

```
$ lsmem
RANGE                                 SIZE  STATE REMOVABLE  BLOCK
0x0000000000000000-0x00000000bfffffff   3G online       yes   0-23
0x0000000100000000-0x000000043fffffff  13G online       yes 32-135

Memory block size:       128M
Total online memory:      16G
Total offline memory:      0B
```

If we want to find out statistics about free and used memory, we
can use the `free` command or check the **/proc/meminfo** file content.

## Identify Disks

Let's look at some commands we can use to identify disks and
partitions.

Again, `lshw` provides useful information.

```
$ sudo lshw -c DISK
  *-cdrom
       description: DVD reader
       product: QEMU DVD-ROM
       vendor: QEMU
       physical id: 0.0.0
       bus info: scsi@0:0.0.0
       logical name: /dev/cdrom
       logical name: /dev/dvd
       logical name: /dev/sr0
       version: 2.5+
       capabilities: removable audio dvd
       configuration: ansiversion=5 status=ready
     *-medium
          physical id: 0
          logical name: /dev/cdrom
  *-virtio3
       description: Virtual I/O device
       physical id: 0
       bus info: virtio@3
       logical name: /dev/vda
       size: 50GiB (53GB)
       capabilities: gpt-1.00 partitioned partitioned:gpt
       configuration: driver=virtio_blk guid=7607a859-3608-4807-b8c1-43f9d7e0e1fc logicalsectorsize=512 sectorsize=512
```

On this system, we have an emulated DVD and a virtio disk drive of
50 GiB.

If we want to find out the partitions on this disk, we can either
check the contents of the **/proc/partitions** file, or use the `fdisk`
command:

```
$ sudo fdisk -l /dev/vda
Disk /dev/vda: 50 GiB, 53687091200 bytes, 104857600 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: gpt
Disk identifier: 7607A859-3608-4807-B8C1-43F9D7E0E1FC
Device      Start       End   Sectors  Size Type
/dev/vda1  227328 104857566 104630239 49.9G Linux filesystem
/dev/vda14   2048     10239      8192    4M BIOS boot
/dev/vda15  10240    227327    217088  106M EFI System
Partition table entries are not in disk order.
```

## Identify Network Devices

To identify network interfaces, we can use the `lshw` command with an
option to display the network devices and bus information like
PCI addresses:

```
$ sudo lshw -C network -businfo
Bus info          Device        Class          Description
==========================================================
pci@0000:00:03.0                network        Virtio network device
virtio@0          ens3          network        Ethernet interface
pci@0000:00:04.0                network        Virtio network device
virtio@1          ens4          network        Ethernet interface
                  virbr0-nic    network        Ethernet interface
                  lxdbr0        network        Ethernet interface
                  virbr0        network        Ethernet interface
                  br0           network        Ethernet interface
                  veth3cfd2fcd  network        Ethernet interface
```

We can use `lspci` to list the PCI buses and devices connected to them:

```
$ sudo lspci
00:00.0 Host bridge: Intel Corporation 440FX - 82441FX PMC [Natoma] (rev 02)
00:01.0 ISA bridge: Intel Corporation 82371SB PIIX3 ISA [Natoma/Triton II]
00:01.1 IDE interface: Intel Corporation 82371SB PIIX3 IDE [Natoma/Triton II]
00:01.2 USB controller: Intel Corporation 82371SB PIIX3 USB [Natoma/Triton II] (rev 01)
00:01.3 Bridge: Intel Corporation 82371AB/EB/MB PIIX4 ACPI (rev 03)
00:02.0 VGA compatible controller: Cirrus Logic GD 5446
00:03.0 Ethernet controller: Red Hat, Inc. Virtio network device
00:04.0 Ethernet controller: Red Hat, Inc. Virtio network device
00:05.0 Communication controller: Red Hat, Inc. Virtio console
00:06.0 SCSI storage controller: Red Hat, Inc. Virtio block device
00:07.0 Unclassified device [00ff]: Red Hat, Inc. Virtio memory balloon
```
