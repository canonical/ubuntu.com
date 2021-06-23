---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Securing a Server – Advanced"
  description: "Securing a Server – Advanced"
  auto_paginate: True
---

In this section, we will look at some advanced security characteristics that we need
to consider when running Ubuntu Server.

## AppArmor

Ubuntu offers advanced security features with AppArmor.
AppArmor is a security extension to the Linux kernel that can be used
to confine applications.

AppArmor is installed by default with Ubuntu 20.04 LTS.

AppArmor uses profiles to confine applications, and the profiles can
be configured to run in *enforce* or *complain* mode.

* **Enforce** means the policy defined in the profile is applied, and
  violations of that policy are reported in **syslog**  or **auditd**
  logs.
* **Complain** means the policy defined in the profile will not be
  applied, but violations of the policy will be reported in **syslog**
  or **auditd** logs.

AppArmor restricts applications rather than users. AppArmor profiles
can restrict access to files and folders for an installed application,
or the actions a process can take.

AppArmor is enabled by default, and should not be disabled. If the
default configuration interferes with what we are trying to do,
we should configure AppArmor to allow the access we need instead
of disabling the service.

An example of why AppArmor is so important is the story around
the Shellshock bug.
Shellshock allows an attacker to cause Bash to run arbitrary
commands sent via HTTP requests to a webserver that is running on the
targeted machine. An AppArmor profile that confines the webserver
would not allow an attacker to gain control of the operating system
hosting the webserver.
Without an AppArmor profile, if the webserver is compromised, the
whole server hosting it is compromised too.

Here is an example of an AppArmor profile:

```
ubuntu@deploy:~$ cat /etc/apparmor.d/usr.sbin.tcpdump
# vim:syntax=apparmor
#include <tunables/global>

/usr/sbin/tcpdump {
  #include <abstractions/base>
  #include <abstractions/nameservice>
  #include <abstractions/user-tmp>

  capability net_raw,
  capability setuid,
  capability setgid,
  capability dac_override,
  capability chown,
  network raw,
  network packet,

  # for -D
  @{PROC}/bus/usb/ r,
  @{PROC}/bus/usb/** r,

  # for finding an interface
  /dev/ r,
  @{PROC}/[0-9]*/net/dev r,
  /sys/bus/usb/devices/ r,
  /sys/class/net/ r,
  /sys/devices/**/net/** r,

  # for -j
  capability net_admin,

  # for tracing USB bus, which libpcap supports
  /dev/usbmon* r,
  /dev/bus/usb/ r,
  /dev/bus/usb/** r,

  # for init_etherarray(), with -e
  /etc/ethers r,

  # for USB probing (see libpcap-1.1.x/pcap-usb-linux.c:probe_devices())
  /dev/bus/usb/**/[0-9]* w,

  # for -z
  /{usr/,}bin/gzip ixr,
  /{usr/,}bin/bzip2 ixr,

  # for -F and -w
  audit deny @{HOME}/.* mrwkl,
  audit deny @{HOME}/.*/ rw,
  audit deny @{HOME}/.*/** mrwkl,
  audit deny @{HOME}/bin/ rw,
  audit deny @{HOME}/bin/** mrwkl,
  owner @{HOME}/ r,
  owner @{HOME}/** rw,

  # for -r, -F and -w
  /**.[pP][cC][aA][pP] rw,

  # for convenience with -r (ie, read pcap files from other sources)
  /var/log/snort/*log* r,

  /usr/sbin/tcpdump mr,

  # Site-specific additions and overrides. See local/README for details.
  #include <local/usr.sbin.tcpdump>
}
```

This example lists access controls for capabilities, networking,
and file access. Looking at the rules above, when we run `tcpdump`
with the `-D` option, the command is allowed to read files under
**/proc/bus/usb**. AppArmor restricts `tcpdump` when trying to find
interfaces to specific directories under **/dev**, **/proc**, and **/sys**,
on which only read access is allowed. If we run `tcpdump` with the
`-z gzip` or `-z bzip2` option so that the network capture file
is compressed, AppArmor allows 'ixr' (inherit execute and read) access
to **/bin/gzip** and **/bin/bzip2**. If we want to save the network traffic
capture to a file, and we run `tcpdump` with the `-F` and
`-w` options, AppArmor allows general access to the home directory
if you are the user owning the home directory, but it denies access
to hidden and **bin** directories in the home directory.

## Certificates

A digital certificate is an electronic document used to prove the
ownership of an electronic encryption key. We use a digital certificate
to prove that we are who we say we are.

In the previous section, we mentioned the importance of using encrypted
communication. Encrypted communication is possible only after
an exchange and validation of encryption keys.

Certificates play an important role in securing communication
between servers, and between end-users and servers. The most common use
of certificates is for HTTPS-based web services.
When a user accesses a website, it does so via the HTTPS protocol. The user must rely on the webserver it
communicates with if they want to send credit card information
or other personal data.

As a consequence, we want certificates that are valid for a limited
period of time. We also want to be able to replace certificates, in an
automated way, before they expire.


## Some Security Practices

A good security practice is to subscribe to 
[Ubuntu's security notices](https://ubuntu.com/security/notices), and to remain
informed about new security vulnerabilities.

Another good practice is to periodically audit logs on your servers,
and there are several tools that can help with this job.

To see the list of security features available on Ubuntu 20.04 LTS,
refer to the [Ubuntu Wiki](https://wiki.ubuntu.com/Security/Features).
