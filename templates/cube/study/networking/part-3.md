---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Networking Utilities"
  description: "Networking Utilities"
  auto_paginate: True
---

In this section, we will look at some useful networking tools.

One of the most commonly used tools is `ping`. We use `ping` to test
whether a host is reachable. We often run the `ping` command followed by a
hostname or IP address, but this tool comes with many helpful options.

For example, we can use `ping` to determine the MTU size of a path:

```
$ ping -s 1472 -M do -i 0.2 -c 50 alice
```

The `-s` option specifies the size of the packet to be sent, in bytes.
The `-M` option is for selecting the path MTU discovery strategy, and
when set to `do` it means we prohibit packet fragmentation. The `-i`
option sets the time interval to be used between sending packets, and
the `-c` option specifies how many packets we want to send.

`nping` is an open-source network packet generation tool, which
we can use to generate packets of a wide range of protocols. `nping`
is part of the `nmap` package.

Here is an example where we use `nping` to send TCP packets on the
port 80:

```
$ sudo nping --tcp -p 80 --flags rst --ttl 2 192.168.0.100

Starting Nping 0.7.80 ( https://nmap.org/nping ) at 2020-11-06 09:58 UTC
SENT (0.0076s) TCP 192.168.122.111:3824 > 192.168.0.100:80 R ttl=2 id=37949 iplen=40  seq=565435000 win=1480 
SENT (1.0079s) TCP 192.168.122.111:3824 > 192.168.0.100:80 R ttl=2 id=37949 iplen=40  seq=565435000 win=1480 
SENT (2.0092s) TCP 192.168.122.111:3824 > 192.168.0.100:80 R ttl=2 id=37949 iplen=40  seq=565435000 win=1480 
SENT (3.0106s) TCP 192.168.122.111:3824 > 192.168.0.100:80 R ttl=2 id=37949 iplen=40  seq=565435000 win=1480 
SENT (4.0120s) TCP 192.168.122.111:3824 > 192.168.0.100:80 R ttl=2 id=37949 iplen=40  seq=565435000 win=1480 
^C 
Max rtt: N/A | Min rtt: N/A | Avg rtt: N/A
Raw packets sent: 5 (200B) | Rcvd: 0 (0B) | Lost: 5 (100.00%)
Nping done: 1 IP address pinged in 4.89 seconds

```

If we want to test whether a port is open on a remote host, we have
quite a few alternatives.

We can use `telnet`:

```
~$ telnet alice 22
Trying 192.168.122.111...
Connected to alice.example.com.
Escape character is '^]'.
SSH-2.0-OpenSSH_8.2p1 Ubuntu-4ubuntu0.1
```

We can use `curl`, a tool used for transferring data between servers
over a long list of protocols. `curl` is installed by default with
Ubuntu server.

```
$ curl -v telnet://alice:22
*   Trying 192.168.122.111:22...
* TCP_NODELAY set
* Connected to alice (192.168.122.111) port 22 (#0)
SSH-2.0-OpenSSH_8.2p1 Ubuntu-4ubuntu0.1

```

We can even use the network downloader `wget`:

```
$ wget alice:22
--2020-11-05 23:01:39--  http://alice:22/
Resolving alice (alice)... 192.168.122.111
Connecting to alice (alice)|192.168.122.111|:22... connected.
```

We can use the `netcat` command:

```
$ nc -zv alice 22
Connection to alice 22 port [tcp/ssh] succeeded!
```

We can use the `nmap` port scanner:

```
$ nmap -p 22 alice
Starting Nmap 7.80 ( https://nmap.org ) at 2020-11-05 23:07 UTC
Nmap scan report for alice (192.168.122.111)
Host is up (0.0017s latency).
rDNS record for 192.168.122.111: alice.example.com

PORT   STATE SERVICE
22/tcp open  ssh

Nmap done: 1 IP address (1 host up) scanned in 0.04 seconds
```

However, sometimes none of the aforementioned tools are available
(for example, if a server is security-hardened).
In this case, we can use the pseudo-device file `/dev/tcp`:

```
$ cat < /dev/tcp/alice/22
SSH-2.0-OpenSSH_8.2p1 Ubuntu-4ubuntu0.1
```

If instead of checking for open ports on a remote server, we want
to find out the open ports on the local server, we can use `netstat`.

With `netstat` we can print networking connections, routing tables,
interface statistics and other interesting information.

```
$ netstat -tulpn
(Not all processes could be identified, non-owned process info
 will not be shown, you would have to be root to see it all.)
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name    
tcp        0      0 192.168.123.1:53        0.0.0.0:*               LISTEN      -                   
tcp        0      0 127.0.0.53:53           0.0.0.0:*               LISTEN      -                   
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      -                   
tcp6       0      0 :::22                   :::*                    LISTEN      -                   
udp        0      0 192.168.123.1:53        0.0.0.0:*                           -                   
udp        0      0 127.0.0.53:53           0.0.0.0:*                           -                   
udp        0      0 0.0.0.0:67              0.0.0.0:*                           -                   
udp        0      0 192.168.122.100:68      0.0.0.0:*                           -     
```

When we run `netstat` with the `-tulpn` options, we print TCP and UDP
listening connections showing the PID and name of the program using
the socket.

The `netstat` utility has been out there for a long time, but now
it's replaced by `ss`. On an Ubuntu Server installation, `ss` is
installed by default, while `netstat` is not.

To list the open ports that are listening for TCP connections, run
`ss` with the `-l` option for listening sockets, and the `-t` option for
TCP sockets.

```
ubuntu@deploy:~$ ss -ltn
State       Recv-Q      Send-Q           Local Address:Port           Peer Address:Port     Process      
LISTEN      0           32               192.168.123.1:53                  0.0.0.0:*                     
LISTEN      0           4096             127.0.0.53%lo:53                  0.0.0.0:*                     
LISTEN      0           128                    0.0.0.0:22                  0.0.0.0:*                     
LISTEN      0           128                       [::]:22                     [::]:*                     
LISTEN      0           511                          *:80                        *:*                     
ubuntu@deploy:~$ 

```

Another useful tool is `lsof`, which lists open files, where a file
may be a regular file, a directory, a block file, a character
special file, an executing text reference, a library, a stream or a
network file.

If we want to list the TCP open ports using `lsof`, then we can run:

```
sudo lsof -i TCP -s TCP:LISTEN
```

If no other tools are available, open ports can be derived from
the information in the **/proc/net/tcp** and **/proc/net/udp** files.

```
ubuntu@deploy:~$ cat /proc/net/tcp
  sl  local_address rem_address   st tx_queue rx_queue tr tm->when retrnsmt   uid  timeout inode
   0: 017BA8C0:0035 00000000:0000 0A 00000000:00000000 00:00000000 00000000     0        0 27832 1 0000000000000000 100 0 0 10 0
   1: 3500007F:0035 00000000:0000 0A 00000000:00000000 00:00000000 00000000   101        0 19529 1 0000000000000000 100 0 0 10 0
   2: 00000000:0016 00000000:0000 0A 00000000:00000000 00:00000000 00000000     0        0 22328 1 0000000000000000 100 0 0 10 0
   3: 647AA8C0:831A 183E1E8D:0050 06 00000000:00000000 03:0000112F 00000000     0        0 0 3 0000000000000000
   4: 647AA8C0:0016 38C77B5B:D900 01 000000AC:00000000 01:0000001A 00000000     0        0 60904 4 0000000000000000 26 4 31 10 61
   5: 647AA8C0:8316 183E1E8D:0050 06 00000000:00000000 03:00000EB0 00000000     0        0 0 3 0000000000000000
   6: 647AA8C0:0016 38C77B5B:BEA0 01 00000000:00000000 02:00042323 00000000     0        0 49702 2 0000000000000000 27 4 30 10 46
   7: 647AA8C0:0016 A73A841F:8B96 01 00000000:00000000 02:000608E2 00000000     0        0 60861 2 0000000000000000 20 4 1 10 -1
```

The lines 2, 4, 5, 6, and 7 show `00000000:0016` and `647AA8C0:0016`.
The first part is the local IPv4 address, in little-endian four-byte
hex format, and the second part, `0016`, is the TCP port in hex format
as well.

If we take for example `647AA8C0:0016`, the IP address is `64` `7A`
`A8` `C0`, which converted to decimal is `100` `122` `168` `100`.
Since this is a little-endian number, with the least significant byte
first, we need to reverse the order, and we will get the `192.168.122.100`
IP address. The port `0016` in hex format converts to `22` in decimal,
so this is the ssh port.

When we troubleshoot networks, we often need to take a network trace.
In such cases, `tcpdump` comes in handy.
`tcpdump` comes with a vast number of options and filters we can use,
which are described in its [manual page](https://www.tcpdump.org/manpages/tcpdump.1.html).
`tcpdump` is installed by default on Ubuntu Server.

Here is an example of the `tcpdump` command. We capture traffic from all
the interfaces with the `-i any` option, `-s 0` to capture each frame
in its entirety, `-v` for verbose output, `-n` because we want IP
addresses in the trace instead of hostnames, and `-l` to see the data
while capturing it.

```
$ sudo tcpdump -i any -s 0 -v -n -l | egrep -i "POST /|GET /|Host:"
tcpdump: listening on any, link-type LINUX_SLL (Linux cooked v1), capture size 262144 bytes
GET / HTTP/1.1
Host: icanhazip.com
GET / HTTP/1.1
Host: askubuntu.com
GET / HTTP/1.1
Host: netplan.io
```
