---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "KVM-Based Virtual Machines"
  description: "KVM-Based Virtual Machines"
  auto_paginate: True
---

The KVM virtualisation technology was added to the Linux kernel
starting with the 2.6.20 version. Ubuntu 20.04 LTS runs the 5.4 Linux
kernel, hence, the KVM kernel functionality is installed by default. KVM acts
like a hypervisor and facilitates running multiple VMs on a host,
referred to as 'guests'.

We can determine whether a system is ready to run KVM VMs using the
`kvm-ok` command:

```
$ kvm-ok
INFO: /dev/kvm exists
KVM acceleration can be used
```

To be able to boot a KVM VM, we need QEMU. QEMU stands for Quick EMUlator.
It emulates physical hardware that we need when we boot virtual
machines.

QEMU emulates a wide range of hardware devices, among them:

* Storage devices.
* Network devices.
* CPU devices.
* Memory devices.
* Controller devices.
* USB devices.
* Input devices (like keyboards and mice).
* Display devices.
* Sound devices.

We can list all the devices QEMU can emulate with the
`qemu-system-x86_64 -device` command, which is part of the `qemu-kvm`
package:

```
$ qemu-system-x86_64 -device ?
Controller/Bridge/Hub devices:
name "i82801b11-bridge", bus PCI
name "igd-passthrough-isa-bridge", bus PCI, desc "ISA bridge faked to support IGD PT"
name "ioh3420", bus PCI, desc "Intel IOH device id 3420 PCIE Root Port"
name "pci-bridge", bus PCI, desc "Standard PCI Bridge"
name "pci-bridge-seat", bus PCI, desc "Standard PCI Bridge (multiseat)"
name "pcie-pci-bridge", bus PCI
name "pcie-root-port", bus PCI, desc "PCI Express Root Port"
name "pxb", bus PCI, desc "PCI Expander Bridge"
name "pxb-pcie", bus PCI, desc "PCI Express Expander Bridge"
name "usb-host", bus usb-bus
name "usb-hub", bus usb-bus
name "vfio-pci-igd-lpc-bridge", bus PCI, desc "VFIO dummy ISA/LPC bridge for IGD assignment"
name "x3130-upstream", bus PCI, desc "TI X3130 Upstream Port of PCI Express Switch"
name "xio3130-downstream", bus PCI, desc "TI X3130 Downstream Port of PCI Express Switch"
USB devices:
name "ich9-usb-ehci1", bus PCI
name "ich9-usb-ehci2", bus PCI
name "ich9-usb-uhci1", bus PCI
name "ich9-usb-uhci2", bus PCI
name "ich9-usb-uhci3", bus PCI
name "ich9-usb-uhci4", bus PCI
name "ich9-usb-uhci5", bus PCI
name "ich9-usb-uhci6", bus PCI
name "nec-usb-xhci", bus PCI
name "pci-ohci", bus PCI, desc "Apple USB Controller"
name "piix3-usb-uhci", bus PCI
name "piix4-usb-uhci", bus PCI
name "qemu-xhci", bus PCI
name "usb-ehci", bus PCI
name "vt82c686b-usb-uhci", bus PCI
Storage devices:
name "am53c974", bus PCI, desc "AMD Am53c974 PCscsi-PCI SCSI adapter"
name "dc390", bus PCI, desc "Tekram DC-390 SCSI adapter"
name "floppy", bus floppy-bus, desc "virtual floppy drive"
name "ich9-ahci", bus PCI, alias "ahci"
name "ide-cd", bus IDE, desc "virtual IDE CD-ROM"
name "ide-drive", bus IDE, desc "virtual IDE disk or CD-ROM (legacy)"
name "ide-hd", bus IDE, desc "virtual IDE disk"
name "isa-fdc", bus ISA
name "isa-ide", bus ISA
name "lsi53c810", bus PCI
name "lsi53c895a", bus PCI, alias "lsi"
name "megasas", bus PCI, desc "LSI MegaRAID SAS 1078"
name "megasas-gen2", bus PCI, desc "LSI MegaRAID SAS 2108"
name "mptsas1068", bus PCI, desc "LSI SAS 1068"
name "nvme", bus PCI, desc "Non-Volatile Memory Express"
name "piix3-ide", bus PCI
name "piix3-ide-xen", bus PCI
name "piix4-ide", bus PCI
name "pvscsi", bus PCI
name "scsi-block", bus SCSI, desc "SCSI block device passthrough"
name "scsi-cd", bus SCSI, desc "virtual SCSI CD-ROM"
name "scsi-disk", bus SCSI, desc "virtual SCSI disk or CD-ROM (legacy)"
name "scsi-generic", bus SCSI, desc "pass through generic scsi device (/dev/sg*)"
name "scsi-hd", bus SCSI, desc "virtual SCSI disk"
name "sd-card", bus sd-bus
name "sdhci-pci", bus PCI
name "usb-bot", bus usb-bus
name "usb-mtp", bus usb-bus, desc "USB Media Transfer Protocol device"
name "usb-storage", bus usb-bus
name "usb-uas", bus usb-bus
name "vhost-scsi", bus virtio-bus
name "vhost-scsi-pci", bus PCI
name "vhost-scsi-pci-non-transitional", bus PCI
name "vhost-scsi-pci-transitional", bus PCI
name "vhost-user-blk", bus virtio-bus
name "vhost-user-blk-pci", bus PCI
name "vhost-user-blk-pci-non-transitional", bus PCI
name "vhost-user-blk-pci-transitional", bus PCI
name "vhost-user-fs-device", bus virtio-bus
name "vhost-user-fs-pci", bus PCI
name "vhost-user-scsi", bus virtio-bus
name "vhost-user-scsi-pci", bus PCI
name "vhost-user-scsi-pci-non-transitional", bus PCI
name "vhost-user-scsi-pci-transitional", bus PCI
name "virtio-9p-device", bus virtio-bus
name "virtio-9p-pci", bus PCI, alias "virtio-9p"
name "virtio-9p-pci-non-transitional", bus PCI
name "virtio-9p-pci-transitional", bus PCI
name "virtio-blk-device", bus virtio-bus
name "virtio-blk-pci", bus PCI, alias "virtio-blk"
name "virtio-blk-pci-non-transitional", bus PCI
name "virtio-blk-pci-transitional", bus PCI
name "virtio-scsi-device", bus virtio-bus
name "virtio-scsi-pci", bus PCI, alias "virtio-scsi"
name "virtio-scsi-pci-non-transitional", bus PCI
name "virtio-scsi-pci-transitional", bus PCI
Network devices:
name "e1000", bus PCI, alias "e1000-82540em", desc "Intel Gigabit Ethernet"
name "e1000-82544gc", bus PCI, desc "Intel Gigabit Ethernet"
name "e1000-82545em", bus PCI, desc "Intel Gigabit Ethernet"
name "e1000e", bus PCI, desc "Intel 82574L GbE Controller"
name "i82550", bus PCI, desc "Intel i82550 Ethernet"
name "i82551", bus PCI, desc "Intel i82551 Ethernet"
name "i82557a", bus PCI, desc "Intel i82557A Ethernet"
name "i82557b", bus PCI, desc "Intel i82557B Ethernet"
name "i82557c", bus PCI, desc "Intel i82557C Ethernet"
name "i82558a", bus PCI, desc "Intel i82558A Ethernet"
name "i82558b", bus PCI, desc "Intel i82558B Ethernet"
name "i82559a", bus PCI, desc "Intel i82559A Ethernet"
name "i82559b", bus PCI, desc "Intel i82559B Ethernet"
name "i82559c", bus PCI, desc "Intel i82559C Ethernet"
name "i82559er", bus PCI, desc "Intel i82559ER Ethernet"
name "i82562", bus PCI, desc "Intel i82562 Ethernet"
name "i82801", bus PCI, desc "Intel i82801 Ethernet"
name "ne2k_isa", bus ISA
name "ne2k_pci", bus PCI
name "pcnet", bus PCI
name "pvrdma", bus PCI, desc "RDMA Device"
name "rocker", bus PCI, desc "Rocker Switch"
name "rtl8139", bus PCI
name "tulip", bus PCI
name "usb-bt-dongle", bus usb-bus
name "usb-net", bus usb-bus
name "virtio-net-device", bus virtio-bus
name "virtio-net-pci", bus PCI, alias "virtio-net"
name "virtio-net-pci-non-transitional", bus PCI
name "virtio-net-pci-transitional", bus PCI
name "vmxnet3", bus PCI, desc "VMWare Paravirtualized Ethernet v3"
Input devices:
name "ccid-card-emulated", bus ccid-bus, desc "emulated smartcard"
name "ccid-card-passthru", bus ccid-bus, desc "passthrough smartcard"
name "i8042", bus ISA
name "ipoctal232", bus IndustryPack, desc "GE IP-Octal 232 8-channel RS-232 IndustryPack"
name "isa-parallel", bus ISA
name "isa-serial", bus ISA
name "pci-serial", bus PCI
name "pci-serial-2x", bus PCI
name "pci-serial-4x", bus PCI
name "tpci200", bus PCI, desc "TEWS TPCI200 IndustryPack carrier"
name "usb-braille", bus usb-bus
name "usb-ccid", bus usb-bus, desc "CCID Rev 1.1 smartcard reader"
name "usb-kbd", bus usb-bus
name "usb-mouse", bus usb-bus
name "usb-serial", bus usb-bus
name "usb-tablet", bus usb-bus
name "usb-wacom-tablet", bus usb-bus, desc "QEMU PenPartner Tablet"
name "vhost-user-input", bus virtio-bus
name "vhost-user-input-pci", bus PCI
name "virtconsole", bus virtio-serial-bus
name "virtio-input-host-device", bus virtio-bus
name "virtio-input-host-pci", bus PCI, alias "virtio-input-host"
name "virtio-keyboard-device", bus virtio-bus
name "virtio-keyboard-pci", bus PCI, alias "virtio-keyboard"
name "virtio-mouse-device", bus virtio-bus
name "virtio-mouse-pci", bus PCI, alias "virtio-mouse"
name "virtio-serial-device", bus virtio-bus
name "virtio-serial-pci", bus PCI, alias "virtio-serial"
name "virtio-serial-pci-non-transitional", bus PCI
name "virtio-serial-pci-transitional", bus PCI
name "virtio-tablet-device", bus virtio-bus
name "virtio-tablet-pci", bus PCI, alias "virtio-tablet"
name "virtserialport", bus virtio-serial-bus
Display devices:
name "ati-vga", bus PCI
name "bochs-display", bus PCI
name "cirrus-vga", bus PCI, desc "Cirrus CLGD 54xx VGA"
name "isa-cirrus-vga", bus ISA
name "isa-vga", bus ISA
name "qxl", bus PCI, desc "Spice QXL GPU (secondary)"
name "qxl-vga", bus PCI, desc "Spice QXL GPU (primary, vga compatible)"
name "ramfb", bus System, desc "ram framebuffer standalone device"
name "secondary-vga", bus PCI
name "sga", bus ISA, desc "Serial Graphics Adapter"
name "VGA", bus PCI
name "vhost-user-gpu", bus virtio-bus
name "vhost-user-gpu-pci", bus PCI
name "vhost-user-vga", bus PCI
name "virtio-gpu-device", bus virtio-bus
name "virtio-gpu-pci", bus PCI, alias "virtio-gpu"
name "virtio-vga", bus PCI
name "vmware-svga", bus PCI
Sound devices:
name "AC97", bus PCI, desc "Intel 82801AA AC97 Audio"
name "adlib", bus ISA, desc "Yamaha YM3812 (OPL2)"
name "cs4231a", bus ISA, desc "Crystal Semiconductor CS4231A"
name "ES1370", bus PCI, desc "ENSONIQ AudioPCI ES1370"
name "gus", bus ISA, desc "Gravis Ultrasound GF1"
name "hda-duplex", bus HDA, desc "HDA Audio Codec, duplex (line-out, line-in)"
name "hda-micro", bus HDA, desc "HDA Audio Codec, duplex (speaker, microphone)"
name "hda-output", bus HDA, desc "HDA Audio Codec, output-only (line-out)"
name "ich9-intel-hda", bus PCI, desc "Intel HD Audio Controller (ich9)"
name "intel-hda", bus PCI, desc "Intel HD Audio Controller (ich6)"
name "sb16", bus ISA, desc "Creative Sound Blaster 16"
name "usb-audio", bus usb-bus
Misc devices:
name "amd-iommu", bus System, desc "AMD IOMMU (AMD-Vi) DMA Remapping device"
name "edu", bus PCI
name "hyperv-testdev", bus ISA
name "i2c-ddc", bus i2c-bus
name "i6300esb", bus PCI
name "ib700", bus ISA
name "intel-iommu", bus System, desc "Intel IOMMU (VT-d) DMA Remapping device"
name "isa-applesmc", bus ISA
name "isa-debug-exit", bus ISA
name "isa-debugcon", bus ISA
name "ivshmem-doorbell", bus PCI, desc "Inter-VM shared memory"
name "ivshmem-plain", bus PCI, desc "Inter-VM shared memory"
name "kvaser_pci", bus PCI, desc "Kvaser PCICANx"
name "loader", desc "Generic Loader"
name "mioe3680_pci", bus PCI, desc "Mioe3680 PCICANx"
name "pc-testdev", bus ISA
name "pci-testdev", bus PCI, desc "PCI Test Device"
name "pcm3680_pci", bus PCI, desc "Pcm3680i PCICANx"
name "pvpanic", bus ISA
name "smbus-ipmi", bus i2c-bus
name "tpm-crb"
name "usb-redir", bus usb-bus
name "vfio-pci", bus PCI, desc "VFIO-based PCI device assignment"
name "vfio-pci-nohotplug", bus PCI, desc "VFIO-based PCI device assignment"
name "vhost-vsock-device", bus virtio-bus
name "vhost-vsock-pci", bus PCI
name "vhost-vsock-pci-non-transitional", bus PCI
name "vhost-vsock-pci-transitional", bus PCI
name "virtio-balloon-device", bus virtio-bus
name "virtio-balloon-pci", bus PCI, alias "virtio-balloon"
name "virtio-balloon-pci-non-transitional", bus PCI
name "virtio-balloon-pci-transitional", bus PCI
name "virtio-crypto-device", bus virtio-bus
name "virtio-crypto-pci", bus PCI
name "virtio-pmem-pci", bus PCI
name "virtio-rng-device", bus virtio-bus
name "virtio-rng-pci", bus PCI, alias "virtio-rng"
name "virtio-rng-pci-non-transitional", bus PCI
name "virtio-rng-pci-transitional", bus PCI
name "vmcoreinfo"
name "vmgenid"
CPU devices:
name "486-v1-x86_64-cpu"
name "486-x86_64-cpu"
name "athlon-v1-x86_64-cpu"
name "athlon-x86_64-cpu"
name "base-x86_64-cpu"
name "Broadwell-IBRS-x86_64-cpu"
name "Broadwell-noTSX-IBRS-x86_64-cpu"
name "Broadwell-noTSX-x86_64-cpu"
name "Broadwell-v1-x86_64-cpu"
name "Broadwell-v2-x86_64-cpu"
name "Broadwell-v3-x86_64-cpu"
name "Broadwell-v4-x86_64-cpu"
name "Broadwell-x86_64-cpu"
name "Cascadelake-Server-noTSX-x86_64-cpu"
name "Cascadelake-Server-v1-x86_64-cpu"
name "Cascadelake-Server-v2-x86_64-cpu"
name "Cascadelake-Server-v3-x86_64-cpu"
name "Cascadelake-Server-x86_64-cpu"
name "Conroe-v1-x86_64-cpu"
name "Conroe-x86_64-cpu"
name "Cooperlake-v1-x86_64-cpu"
name "Cooperlake-x86_64-cpu"
name "core2duo-v1-x86_64-cpu"
name "core2duo-x86_64-cpu"
name "coreduo-v1-x86_64-cpu"
name "coreduo-x86_64-cpu"
name "Denverton-v1-x86_64-cpu"
name "Denverton-x86_64-cpu"
name "Dhyana-v1-x86_64-cpu"
name "Dhyana-x86_64-cpu"
name "EPYC-IBPB-x86_64-cpu"
name "EPYC-Rome-v1-x86_64-cpu"
name "EPYC-Rome-x86_64-cpu"
name "EPYC-v1-x86_64-cpu"
name "EPYC-v2-x86_64-cpu"
name "EPYC-v3-x86_64-cpu"
name "EPYC-x86_64-cpu"
name "Haswell-IBRS-x86_64-cpu"
name "Haswell-noTSX-IBRS-x86_64-cpu"
name "Haswell-noTSX-x86_64-cpu"
name "Haswell-v1-x86_64-cpu"
name "Haswell-v2-x86_64-cpu"
name "Haswell-v3-x86_64-cpu"
name "Haswell-v4-x86_64-cpu"
name "Haswell-x86_64-cpu"
name "host-x86_64-cpu"
name "Icelake-Client-noTSX-x86_64-cpu"
name "Icelake-Client-v1-x86_64-cpu"
name "Icelake-Client-v2-x86_64-cpu"
name "Icelake-Client-x86_64-cpu"
name "Icelake-Server-noTSX-x86_64-cpu"
name "Icelake-Server-v1-x86_64-cpu"
name "Icelake-Server-v2-x86_64-cpu"
name "Icelake-Server-x86_64-cpu"
name "IvyBridge-IBRS-x86_64-cpu"
name "IvyBridge-v1-x86_64-cpu"
name "IvyBridge-v2-x86_64-cpu"
name "IvyBridge-x86_64-cpu"
name "KnightsMill-v1-x86_64-cpu"
name "KnightsMill-x86_64-cpu"
name "kvm32-v1-x86_64-cpu"
name "kvm32-x86_64-cpu"
name "kvm64-v1-x86_64-cpu"
name "kvm64-x86_64-cpu"
name "max-x86_64-cpu"
name "n270-v1-x86_64-cpu"
name "n270-x86_64-cpu"
name "Nehalem-IBRS-x86_64-cpu"
name "Nehalem-v1-x86_64-cpu"
name "Nehalem-v2-x86_64-cpu"
name "Nehalem-x86_64-cpu"
name "Opteron_G1-v1-x86_64-cpu"
name "Opteron_G1-x86_64-cpu"
name "Opteron_G2-v1-x86_64-cpu"
name "Opteron_G2-x86_64-cpu"
name "Opteron_G3-v1-x86_64-cpu"
name "Opteron_G3-x86_64-cpu"
name "Opteron_G4-v1-x86_64-cpu"
name "Opteron_G4-x86_64-cpu"
name "Opteron_G5-v1-x86_64-cpu"
name "Opteron_G5-x86_64-cpu"
name "Penryn-v1-x86_64-cpu"
name "Penryn-x86_64-cpu"
name "pentium-v1-x86_64-cpu"
name "pentium-x86_64-cpu"
name "pentium2-v1-x86_64-cpu"
name "pentium2-x86_64-cpu"
name "pentium3-v1-x86_64-cpu"
name "pentium3-x86_64-cpu"
name "phenom-v1-x86_64-cpu"
name "phenom-x86_64-cpu"
name "qemu32-v1-x86_64-cpu"
name "qemu32-x86_64-cpu"
name "qemu64-v1-x86_64-cpu"
name "qemu64-x86_64-cpu"
name "SandyBridge-IBRS-x86_64-cpu"
name "SandyBridge-v1-x86_64-cpu"
name "SandyBridge-v2-x86_64-cpu"
name "SandyBridge-x86_64-cpu"
name "Skylake-Client-IBRS-x86_64-cpu"
name "Skylake-Client-noTSX-IBRS-x86_64-cpu"
name "Skylake-Client-v1-x86_64-cpu"
name "Skylake-Client-v2-x86_64-cpu"
name "Skylake-Client-v3-x86_64-cpu"
name "Skylake-Client-x86_64-cpu"
name "Skylake-Server-IBRS-x86_64-cpu"
name "Skylake-Server-noTSX-IBRS-x86_64-cpu"
name "Skylake-Server-v1-x86_64-cpu"
name "Skylake-Server-v2-x86_64-cpu"
name "Skylake-Server-v3-x86_64-cpu"
name "Skylake-Server-x86_64-cpu"
name "Snowridge-v1-x86_64-cpu"
name "Snowridge-v2-x86_64-cpu"
name "Snowridge-x86_64-cpu"
name "Westmere-IBRS-x86_64-cpu"
name "Westmere-v1-x86_64-cpu"
name "Westmere-v2-x86_64-cpu"
name "Westmere-x86_64-cpu"
Uncategorized devices:
name "AMDVI-PCI", bus PCI
name "ipmi-bmc-extern"
name "ipmi-bmc-sim"
name "isa-ipmi-bt", bus ISA
name "isa-ipmi-kcs", bus ISA
name "mc146818rtc", bus ISA
name "nvdimm", desc "DIMM memory module"
name "pc-dimm", desc "DIMM memory module"
name "pci-ipmi-bt", bus PCI, desc "PCI IPMI BT"
name "pci-ipmi-kcs", bus PCI, desc "PCI IPMI KCS"
name "tpm-tis", bus ISA
name "virtio-pmem", bus virtio-bus
```

To facilitate creating an Ubuntu KVM VM on a host running Ubuntu,
we need a few more things besides the `qemu-kvm` package.

We need to install `libvirt-daemon-system` and `libvirt-clients`
packages:

* `libvirt-daemon-system` contains daemon configuration files for
  the `libvirtd` virtualisation management system.
* `libvirt-clients` installs libvirt client tools to connect to
  `libvirtd`. These make it possible to issue tasks and collect configuration information
   about the host and guest systems.

The user that creates VMs must be a member of the `libvirt` group.
You can verify this with the `groups` command:

```
$ groups
ubuntu adm dialout cdrom floppy sudo audio dip video plugdev netdev lxd libvirt
```

The `virsh` command from the `libvirt-clients` package is a command-line
interface to `libvirt` for creating, pausing, shutting down, or
deleting VMs.

We can use `virsh` to verify that `libvirt` is installed properly:

```
$ sudo virsh list --all
 Id   Name   State
--------------------
```

<!--

(THIS IS OLD CONTENT, MARKED INCORRECT IN BUG #1920115.)
(DELETE THIS SECTION AFTER CONFIRMING NEW ADDITIONS ARE CORRECT.)

When we create a new VM, we want to be able to connect to it via a
network interface. We need to install the `bridge-utils` package and
configure a bridge interface that connects the host to the VMs
running on it:

```
$ brctl show
bridge name  bridge id         STP enabled  interfaces
br0          8000.fa163e2b0203 yes          ens4
                                            vnet1
```

`br0` connects the `ens4` interface on the host system to the `vnet1`
interface on the guest system.

-->

When we create new VMs with `libvirt`, a bridge interface is automatically
created that connects the host to the VMs running on it. However, if
you have reason to modify the bridge interface manually, you can use
the tools from `libvirt-clients`:

```
$ virsh net-info default
Name: default
UUID: c20c8fa2-85bb-431f-b323-2eaed297bf7c
Active: yes
Persistent: yes
Autostart: yes
Bridge: virbr0
```

```
$ virsh net-dumpxml default
<network connections='3'>
  <name>default</name>
  <uuid>c20c8fa2-85bb-431f-b323-2eaed297bf7c</uuid>
  <forward mode='nat'>
    <nat>
      <port start='1024' end='65535'/>
    </nat>
  </forward>
  <bridge name='virbr0' stp='on' delay='0'/>
  <mac address='52:54:00:95:e4:2a'/>
  <ip address='192.168.122.1' netmask='255.255.255.0'>
    <dhcp>
      <range start='192.168.122.2' end='192.168.122.254'/>
    </dhcp>
  </ip>
</network>
```

When creating new VMs, we also need an Ubuntu cloud image, which is a
pre-installed customized disk image. We can download Ubuntu cloud images
from [cloud-images.ubuntu.com](https://cloud-images.ubuntu.com/).

`libguestfs-tools` is a library that provides tools for accessing
and modifying virtual disk images.
If we want to set a root password for an image, for example, we can use
the `virt-customize` command:

```
$ sudo virt-customize -a focal-server-cloudimg-amd64-disk-kvm.img --root-password password:xnKoG9zJyoxMp6LyBtv6whZW
```

Next, we need a tool to provision new KVM VMs. We have a few options:

* `virt-manager`
* `vagrant`
* `oVirt`
* `virt-install`

We can use `virt-install` to create a new KVM VM in the following way:

```
$ sudo virt-install --name vm01 --vcpus=2 --memory 4096 \
                  -w network=default --network bridge=br0,model=virtio \
                  --disk ~/ubuntu-20.04-minimal-cloudimg-amd64.img \
                  --import --nographics
```

This command lists the following arguments:

*  The name of the VM (`--name`).
*  The number of virtual cores configured for the guest (`--vcpus`).
*  The amount of memory allocated for the guest (`--memory`).
*  The network that connects the guest and the host (`--network`).
*  The storage media for the guest (`--disk`).
*  An option to skip the OS installation process and build the guest
   using the disk image (`--import`).
*  An option to disable graphics (`--nographics`).

We can list VMs with `virsh` and see that the VM is running:

```
$ sudo virsh list --all
 Id   Name     State
------------------------
 1    vm01     running
$ sudo virsh dominfo vm01
Id:             1
Name:           vm01
UUID:           f93f552d-a232-46f6-8dc7-669ac7b509d7
OS Type:        hvm
State:          running
CPU(s):         2
CPU time:       26.7s
Max memory:     4194304 KiB
Used memory:    4194304 KiB
Persistent:     yes
Autostart:      disable
Managed save:   no
Security model: apparmor
Security DOI:   0
Security label: libvirt-f93f552d-a232-46f6-8dc7-669ac7b509d7 (enforcing)
```

If we want to see the VM configuration, we use the following command:

```xml
$ sudo virsh dumpxml vm01
<domain type='kvm' id='6'>
  <name>vm01</name>
  <uuid>f93f552d-a232-46f6-8dc7-669ac7b509d7</uuid>
  <memory unit='KiB'>4194304</memory>
  <currentMemory unit='KiB'>4194304</currentMemory>
  <vcpu placement='static'>2</vcpu>
  <resource>
    <partition>/machine</partition>
  </resource>
  <os>
    <type arch='x86_64' machine='pc-i440fx-focal'>hvm</type>
    <boot dev='hd'/>
  </os>
  <features>
    <acpi/>
    <apic/>
    <vmport state='off'/>
  </features>
  <cpu mode='custom' match='exact' check='full'>
    <model fallback='forbid'>Haswell-noTSX</model>
    <vendor>Intel</vendor>
    <feature policy='require' name='vme'/>
    <feature policy='require' name='vmx'/>
    <feature policy='require' name='f16c'/>
    <feature policy='require' name='rdrand'/>
    <feature policy='require' name='hypervisor'/>
    <feature policy='require' name='arat'/>
    <feature policy='require' name='tsc_adjust'/>
    <feature policy='require' name='umip'/>
    <feature policy='require' name='arch-capabilities'/>
    <feature policy='require' name='xsaveopt'/>
    <feature policy='require' name='abm'/>
    <feature policy='require' name='skip-l1dfl-vmentry'/>
    <feature policy='require' name='pschange-mc-no'/>
  </cpu>
  <clock offset='utc'>
    <timer name='rtc' tickpolicy='catchup'/>
    <timer name='pit' tickpolicy='delay'/>
    <timer name='hpet' present='no'/>
  </clock>
  <on_poweroff>destroy</on_poweroff>
  <on_reboot>restart</on_reboot>
  <on_crash>destroy</on_crash>
  <pm>
    <suspend-to-mem enabled='no'/>
    <suspend-to-disk enabled='no'/>
  </pm>
  <devices>
    <emulator>/usr/bin/qemu-system-x86_64</emulator>
    <disk type='file' device='disk'>
      <driver name='qemu' type='qcow2'/>
      <source file='/home/ubuntu/tmp/ubuntu-20.04-minimal-cloudimg-amd64.img' index='1'/>
      <backingStore/>
      <target dev='hda' bus='ide'/>
      <alias name='ide0-0-0'/>
      <address type='drive' controller='0' bus='0' target='0' unit='0'/>
    </disk>
    <controller type='usb' index='0' model='ich9-ehci1'>
      <alias name='usb'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x06' function='0x7'/>
    </controller>
    <controller type='usb' index='0' model='ich9-uhci1'>
      <alias name='usb'/>
      <master startport='0'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x06' function='0x0' multifunction='on'/>
    </controller>
    <controller type='usb' index='0' model='ich9-uhci2'>
      <alias name='usb'/>
      <master startport='2'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x06' function='0x1'/>
    </controller>
    <controller type='usb' index='0' model='ich9-uhci3'>
      <alias name='usb'/>
      <master startport='4'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x06' function='0x2'/>
    </controller>
    <controller type='pci' index='0' model='pci-root'>
      <alias name='pci.0'/>
    </controller>
    <controller type='ide' index='0'>
      <alias name='ide'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x01' function='0x1'/>
    </controller>
    <controller type='virtio-serial' index='0'>
      <alias name='virtio-serial0'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x07' function='0x0'/>
    </controller>
    <interface type='network'>
      <mac address='52:54:00:a6:0d:08'/>
      <source network='default' portid='4b5d26ea-1a45-4f26-ba3a-21ae393ff8e3' bridge='virbr0'/>
      <target dev='vnet2'/>
      <model type='e1000'/>
      <alias name='net0'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x03' function='0x0'/>
    </interface>
    <interface type='bridge'>
      <mac address='52:54:00:ab:4d:29'/>
      <source bridge='br0'/>
      <target dev='vnet3'/>
      <model type='virtio'/>
      <alias name='net1'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x04' function='0x0'/>
    </interface>
    <serial type='pty'>
      <source path='/dev/pts/4'/>
      <target type='isa-serial' port='0'>
        <model name='isa-serial'/>
      </target>
      <alias name='serial0'/>
    </serial>
    <console type='pty' tty='/dev/pts/4'>
      <source path='/dev/pts/4'/>
      <target type='serial' port='0'/>
      <alias name='serial0'/>
    </console>
    <channel type='spicevmc'>
      <target type='virtio' name='com.redhat.spice.0' state='disconnected'/>
      <alias name='channel0'/>
      <address type='virtio-serial' controller='0' bus='0' port='1'/>
    </channel>
    <input type='tablet' bus='usb'>
      <alias name='input0'/>
      <address type='usb' bus='0' port='1'/>
    </input>
    <input type='mouse' bus='ps2'>
      <alias name='input1'/>
    </input>
    <input type='keyboard' bus='ps2'>
      <alias name='input2'/>
    </input>
    <graphics type='spice' port='5900' autoport='yes' listen='127.0.0.1'>
      <listen type='address' address='127.0.0.1'/>
      <image compression='off'/>
    </graphics>
    <sound model='ich6'>
      <alias name='sound0'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x05' function='0x0'/>
    </sound>
    <video>
      <model type='qxl' ram='65536' vram='65536' vgamem='16384' heads='1' primary='yes'/>
      <alias name='video0'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x02' function='0x0'/>
    </video>
    <redirdev bus='usb' type='spicevmc'>
      <alias name='redir0'/>
      <address type='usb' bus='0' port='2'/>
    </redirdev>
    <redirdev bus='usb' type='spicevmc'>
      <alias name='redir1'/>
      <address type='usb' bus='0' port='3'/>
    </redirdev>
    <memballoon model='virtio'>
      <alias name='balloon0'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x08' function='0x0'/>
    </memballoon>
  </devices>
  <seclabel type='dynamic' model='apparmor' relabel='yes'>
    <label>libvirt-f93f552d-a232-46f6-8dc7-669ac7b509d7</label>
    <imagelabel>libvirt-f93f552d-a232-46f6-8dc7-669ac7b509d7</imagelabel>
  </seclabel>
  <seclabel type='dynamic' model='dac' relabel='yes'>
    <label>+64055:+108</label>
    <imagelabel>+64055:+108</imagelabel>
  </seclabel>
</domain>
```

The configuration shows that QEMU is used to emulate devices.

```xml
    <emulator>/usr/bin/qemu-system-x86_64</emulator>
```


If we want to add additional storage capacity to the newly created
VM, we can use the `virsh` command to create a volume:

```
$ sudo virsh vol-create-as ubuntu volume.qcow2  2G
```

We created a QCOW2 volume of 2 GiB. QCOW2 stands for QEMU Copy-On-Write.
It is the core storage format for QEMU emulated disks.

We can confirm that the volume exists:

```
$ sudo virsh vol-list ubuntu --details
 Name                                      Path                                                   Type   Capacity   Allocation
--------------------------------------------------------------------------------------------------------------------------------
 ubuntu-20.04-minimal-cloudimg-amd64.img   /home/ubuntu/ubuntu-20.04-minimal-cloudimg-amd64.img   file   2.20 GiB   214.13 MiB
 Vagrantfile                               /home/ubuntu/Vagrantfile                               file   2.94 KiB   4.00 KiB
 vm01.img                                  /home/ubuntu/vm01.img                                  file   2.20 GiB   213.94 MiB
 volume.qcow2                              /home/ubuntu/volume.qcow2                              file   2.00 GiB   2.00 GiB

```

To attach the volume to the VM, we use `virsh` again:

```
$ sudo virsh attach-disk --domain testapp --source /home/ubuntu/volume.qcow2 --persistent --target vdb
```

We can suspend, resume, and shut down a VM:

```
$ sudo virsh suspend vm01
Domain vm01 suspended
$ sudo virsh resume vm01
Domain vm01 resumed
$ sudo virsh shutdown vm01
Domain vm01 is being shutdown

```

We can take snapshots of a VM to preserve the state of a virtual
machine at a given time:

```
$ sudo virsh snapshot-create vm01
Domain snapshot 1605610868 created
$ sudo virsh snapshot-list vm01
 Name         Creation Time               State
---------------------------------------------------
 1605610868   2020-11-17 11:01:08 +0000   running
```

To see the QEMU and `libvirt` enhancements in Ubuntu 20.04 LTS, refer to the
[QEMU release notes](https://wiki.ubuntu.com/FocalFossa/ReleaseNotes#QEMU)
and [libvirt release notes](https://wiki.ubuntu.com/FocalFossa/ReleaseNotes#libvirt).
