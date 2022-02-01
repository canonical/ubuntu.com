---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "LXD"
  description: "LXD"
  auto_paginate: True
---

Linux Container Daemon (LXD) is a technology for managing system
containers. LXD manages Linux Containers (LXCs).

We can define a container as a single process confined to a set of namespaces
and cgroups. This process has PID 1 in its own PID namespace.

Depending on which process we start as PID 1 in the container's PID
namespace, we can identify the type of container.
There are two types of containers.

The first are **system containers**, where PID 1 in the container is a process that
could also serve as the `init` process in the host:

```
root@prometheus:~# ps -eaf
UID          PID    PPID  C STIME TTY          TIME CMD
root           1       0  0 14:02 ?        00:00:00 /sbin/init
root          63       1  0 14:02 ?        00:00:00 /lib/systemd/systemd-journald
```

The second are **application containers**, where PID 1 is a non-`init` process:

```
$ docker run -it ubuntu
root@a56b402babb8:/# ps -eaf
UID          PID    PPID  C STIME TTY          TIME CMD
root           1       0  1 14:13 pts/0    00:00:00 /bin/bash
root          10       1  0 14:14 pts/0    00:00:00 ps -eaf
```

Docker containers are usually application containers, while LXC containers
are typically system containers.

The LXD container manager is installed by default on Ubuntu 20.04 LTS
server, from the Snap Store.

```
$ snap list
Name    Version   Rev    Tracking         Publisher   Notes
core18  20200311  1705   latest/stable    canonical✓  base
lxd     4.0.1     14804  latest/stable/…  canonical✓  -
snapd   2.44.3    7264   latest/stable    canonical✓  snapd
```

Before we can start using LXD, we need to configure it.
We do that with the `lxd init` command. In the following example, we
use default settings to set it up:

```
$ lxd init
Would you like to use LXD clustering? (yes/no) [default=no]: 
Do you want to configure a new storage pool? (yes/no) [default=yes]: 
Name of the new storage pool [default=default]: 
Name of the storage backend to use (lvm, ceph, btrfs, dir) [default=btrfs]: 
Create a new BTRFS pool? (yes/no) [default=yes]: 
Would you like to use an existing block device? (yes/no) [default=no]: 
Size in GB of the new loop device (1GB minimum) [default=15GB]: 
Would you like to connect to a MAAS server? (yes/no) [default=no]: 
Would you like to create a new local network bridge? (yes/no) [default=yes]: 
What should the new bridge be called? [default=lxdbr0]: 
What IPv4 address should be used? (CIDR subnet notation, “auto” or “none”) [default=auto]: 
What IPv6 address should be used? (CIDR subnet notation, “auto” or “none”) [default=auto]: 
Would you like LXD to be available over the network? (yes/no) [default=no]: 
Would you like stale cached images to be updated automatically? (yes/no) [default=yes] 
Would you like a YAML "lxd init" preseed to be printed? (yes/no) [default=no]: 
```

LXD can be configured in clustering mode, where several LXD servers
can use a common database. The `lxc` client manages the cluster nodes.
For clustering to be possible, we need to configure an LXD bootstrap
node. Then the rest of the LXD nodes join the cluster by providing
the bootstrap LXD FQDN or IP address, and the cluster password.

When the LXD nodes join the cluster successfully, they display
an 'ONLINE' state.

```
$ lxc cluster list
+---------+------------------------------+----------+--------+-------------------+--------------+
|  NAME   |             URL              | DATABASE | STATE  |      MESSAGE      | ARCHITECTURE |
+---------+------------------------------+----------+--------+-------------------+--------------+
|  alice  | https://192.168.132.111:8443 | YES      | ONLINE | fully operational | x86_64       |
+---------+------------------------------+----------+--------+-------------------+--------------+
|   bob   | https://192.168.132.112:8443 | YES      | ONLINE | fully operational | x86_64       |
+---------+------------------------------+----------+--------+-------------------+--------------+
| charlie | https://192.168.132.113:8443 | YES      | ONLINE | fully operational | x86_64       |
+---------+------------------------------+----------+--------+-------------------+--------------+
```

LXD supports a variety of storage backends, such as:

* `lvm` volumes.
* The `ceph` storage solution.
* `btrfs` and `zfs` filesystems.
* `dir`, a plain directory structure.

If `zfs` is not installed on the node, the `lxd` configuration defaults
to `btrfs`. If `zfs` is installed, then `zfs` is chosen as the default
storage backend.
LXD creates storage pools on the storage backend, and stores
images, instances, and volumes on them.

LXD can be integrated with MAAS, if MAAS manages the physical network
that LXD uses. This way, the LXC containers will be attached to the
MAAS managed network.

Further into the initial configuration, LXD creates a bridge
interface, `lxdbr0`, which connects the LXD host to the LXD
instances. Of course, LXD can be configured to use existing bridges.

LXD supports several types of networks:

* `bridge`
* `mavclan`
* `sriov`
* `ovn`
* `physical`

LXD can update images automatically. Every 6 hours, LXD searches the
image store for image updates marked with auto-update.
When it finds an update, it downloads it to the image store, updates
the configuration to point to the new image, and removes the old image.

We can list the images in the image store with the `lxd image list`
command:

```
$ lxc image list
+-------+--------------+--------+---------------------------------------------+--------------+-----------+----------+-------------------------------+
| ALIAS | FINGERPRINT  | PUBLIC |                 DESCRIPTION                 | ARCHITECTURE |   TYPE    |   SIZE   |          UPLOAD DATE          |
+-------+--------------+--------+---------------------------------------------+--------------+-----------+----------+-------------------------------+
|       | 00c96b77d1b3 | no     | ubuntu 18.04 LTS amd64 (release) (20201112) | x86_64       | CONTAINER | 189.79MB | Nov 18, 2020 at 12:50am (UTC) |
+-------+--------------+--------+---------------------------------------------+--------------+-----------+----------+-------------------------------+
|       | 1503148c4435 | no     | ubuntu 20.04 LTS amd64 (release) (20201111) | x86_64       | CONTAINER | 355.48MB | Nov 18, 2020 at 12:47am (UTC) |
+-------+--------------+--------+---------------------------------------------+--------------+-----------+----------+-------------------------------+
```

To disable the `auto-update`, set the `images.auto_update_interval` parameter to `0`:

```
$ lxc config set images.auto_update_interval 0
$ lxc config get images.auto_update_interval
0
```

Once we are done with the LXC configuration, we can launch LXC
containers with the command `lxc launch`:

```
$ lxc launch ubuntu:focal focal-lxd-container
Creating focal-lxd-container
Starting focal-lxd-container
```

```
$ lxc launch ubuntu:bionic bionic-lxd-container
Creating bionic-lxd-container
Starting bionic-lxd-container 
```

LXD downloads Ubuntu Focal and Ubuntu Bionic images from the remote
image store, unpacks them, creates the containers, and starts them.

To see where the remote image store is located, use `lxc remote list`:

```
$ lxc remote list
+-----------------+------------------------------------------+---------------+-------------+--------+--------+
|      NAME       |                   URL                    |   PROTOCOL    |  AUTH TYPE  | PUBLIC | STATIC |
+-----------------+------------------------------------------+---------------+-------------+--------+--------+
| images          | https://images.linuxcontainers.org       | simplestreams | none        | YES    | NO     |
+-----------------+------------------------------------------+---------------+-------------+--------+--------+
| local (default) | unix://                                  | lxd           | file access | NO     | YES    |
+-----------------+------------------------------------------+---------------+-------------+--------+--------+
| ubuntu          | https://cloud-images.ubuntu.com/releases | simplestreams | none        | YES    | YES    |
+-----------------+------------------------------------------+---------------+-------------+--------+--------+
| ubuntu-daily    | https://cloud-images.ubuntu.com/daily    | simplestreams | none        | YES    | YES    |
+-----------------+------------------------------------------+---------------+-------------+--------+--------+
```

When the containers are up, we can connect and run commands on them:

```
$ lxc exec focal-lxd-container -- uname -a
Linux focal-lxd-container 5.4.0-54-generic #60-Ubuntu SMP Fri Nov 6 10:37:59 UTC 2020 x86_64 x86_64 x86_64 GNU/Linux
$ lxc exec bionic-lxd-container -- uname -a
Linux bionic-lxd-container 5.4.0-54-generic #60-Ubuntu SMP Fri Nov 6 10:37:59 UTC 2020 x86_64 x86_64 x86_64 GNU/Linux
```

We have two containers, one that uses Ubuntu 20.04 LTS Focal Fossa,
and a second one that uses Ubuntu 18.04 LTS Bionic Beaver.
Both containers run on a host installed with Ubuntu 20.04 LTS.

We want to install applications in these containers, and this is done
easily using the `lxc exec` command:

```
$ lxc exec focal-lxd-container -- apt install rabbitmq-server
Reading package lists... Done
Building dependency tree
Reading state information... Done
...
Adding system user `rabbitmq' (UID 113) ...
Adding new user `rabbitmq' (UID 113) with group `rabbitmq' ...
Not creating home directory `/var/lib/rabbitmq'.
Created symlink /etc/systemd/system/multi-user.target.wants/rabbitmq-server.service → /lib/systemd/system/rabbitmq-s
erver.service.
Processing triggers for systemd (245.4-4ubuntu3.3) ...
Processing triggers for man-db (2.9.1-1) ...
Processing triggers for libc-bin (2.31-0ubuntu9.1) ...
```

This installs `rabbitmq-server` in the `focal-lxd-container`.

We can check that the service we installed is up and running:

```
~$ lxc exec focal-lxd-container -- systemctl status rabbitmq-server
● rabbitmq-server.service - RabbitMQ Messaging Server
     Loaded: loaded (/lib/systemd/system/rabbitmq-server.service; enabled; vendor preset: enabled)
     Active: active (running) since Wed 2020-11-18 01:26:33 UTC; 2min 36s ago
   Main PID: 1757 (beam.smp)
     Status: "Initialized"
      Tasks: 91 (limit: 19175)
     Memory: 81.5M
     CGroup: /system.slice/rabbitmq-server.service
             ├─1753 /bin/sh /usr/sbin/rabbitmq-server
             ├─1757 /usr/lib/erlang/erts-10.6.4/bin/beam.smp -W w -A 64 -MBas ageffcbf -MHas ageffcbf -MBlmbcs 512 >
             ├─2015 erl_child_setup 65536
             ├─2044 inet_gethost 4
             └─2045 inet_gethost 4
```

RabbitMQ runs on port 5672, and if we want to connect to it from the
host, we can add a proxy device to allow forwarding connections
between the host and `focal-lxd-container`:

```
$ lxc config device add focal-lxd-container web proxy listen=tcp:0.0.0.0:5672 connect=tcp:127.0.0.1:5672
```

We can back up LXC containers by taking snapshots:

```
$ lxc snapshot focal-lxd-container focal-lxd-container-snapshot
```

The `lxc info` command provides information about available snapshots:

```
$ lxc info focal-lxd-container
Name: focal-lxd-container
Location: none
Remote: unix://
Architecture: x86_64
Created: 2020/11/18 00:47 UTC
Status: Running
Type: container
Profiles: default
Pid: 9828
Ips:
  lo:	inet	127.0.0.1
  lo:	inet6	::1
  eth0:	inet	10.210.63.78	vethf062f023
  eth0:	inet6	fd42:35a2:a6b1:1d12:216:3eff:fe00:f63c	vethf062f023
  eth0:	inet6	fe80::216:3eff:fe00:f63c	vethf062f023
Resources:
  Processes: 134
  CPU usage:
    CPU usage (in seconds): 43
  Memory usage:
    Memory (current): 1.23GB
    Memory (peak): 1.30GB
  Network usage:
    eth0:
      Bytes received: 39.28MB
      Bytes sent: 108.63kB
      Packets received: 1750
      Packets sent: 1397
    lo:
      Bytes received: 26.61kB
      Bytes sent: 26.61kB
      Packets received: 413
      Packets sent: 413
Snapshots:
  focal-lxd-container-snapshot (taken at 2020/11/18 01:38 UTC) (stateless)
```

We might want to use this snapshot and create a container from it on
another node. We can do this in two ways.

For the first approach, we can add the remote node as a remote image server, then copy over
the snapshot to a new container on the remote system.

On the remote server, we need to configure an admin secret:

```
$ lxc config set core.trust_password p4FF0x6eDCzAFS3iQ3uSfXa8ja63C9GOKrGK
```

We can now add the remote server with `lxc remote add`:

```
$ lxc remote add 192.168.122.112
Generating a client certificate. This may take a minute...
Certificate fingerprint: fdee2eb2facc3062a20616e5fb943bb1b584552c1e0a24351bd1828f6bb6f221
ok (y/n)? y
Admin password for 192.168.122.112:
Client certificate stored at server:  192.168.122.112
```

Then we can copy over the snapshot to a new container on the remote
system:

```
lxc copy focal-lxd-container/focal-lxd-container-snapshot  192.168.122.112:bob-focal-lxd-container

```

For the second approach, we can download the image, transfer it to the remote
node, and import it.

First, we must publish the snapshot:

```
$ lxc publish focal-lxd-container/focal-lxd-container-snapshot --alias rabbitmq
Instance published with fingerprint: 542b2eba35b1ab9c4652a79c0871960618a83156b0003ca0cce5031ef60daaf9
```

Then we download the image locally:

```
$ lxc image export rabbitmq .
Image exported successfully!
```

We transfer the image to the remote server:

```
~$ scp 542b2eba35b1ab9c4652a79c0871960618a83156b0003ca0cce5031ef60daaf9.tar.gz bob:
542b2eba35b1ab9c4652a79c0871960618a83156b0003ca0cce5031ef60daaf9.tar.gz           100%  482MB  80.9MB/s   00:05
```

Then we log in to the remote server and import the image:

```
ubuntu@bob:~$ lxc image import 542b2eba35b1ab9c4652a79c0871960618a83156b0003ca0cce5031ef60daaf9.tar.gz --alias rabbitmq
Image imported with fingerprint: 542b2eba35b1ab9c4652a79c0871960618a83156b0003ca0cce5031ef60daaf9
```

Finally, we create a container that uses the snapshot and start it:

```
$ lxc init my-export bob-rabbitmq
Creating bob-rabbitmq
```

```
$ lxc start rabbitmq-server 
```

```
$ lxc list
+-----------------+---------+----------------------+-----------------------------------------------+-----------+-----------+
|      NAME       |  STATE  |         IPV4         |                     IPV6                      |   TYPE    | SNAPSHOTS |
+-----------------+---------+----------------------+-----------------------------------------------+-----------+-----------+
|  bob-rabbitmq   | RUNNING | 10.55.254.26 (eth0)  | fd42:2c78:fdf2:5b65:216:3eff:fe04:5de2 (eth0) | CONTAINER | 0         |
+-----------------+---------+----------------------+-----------------------------------------------+-----------+-----------+
```


For more detailed information, refer to the
[LXD documentation](https://linuxcontainers.org/lxd/docs/master/).
