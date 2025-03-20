---
wrapper_template: "legal/_base_legal_markdown.html"
context:
  title: "MOTD Information"
  description: "This legal notice tells you about the information we collect using MOTD"
  update_date: "June 2020"
  copydoc: https://docs.google.com/document/d/1pe_72kC7bClPqlgHU6maSMHYhAAuQdfCcNvAo-lDYVg/
---

# Legal Notice — MOTD Information

This legal notice tells you about the information we collect using MOTD — Message of the Day. "motd-news" is a package that makes a call periodically to Canonical servers to get updated news for support and informational purposes. An example of an MOTD is shown at the end of this notice. As part of sending the message information is also collected by Canonical as set out below.

## Who are we?

We are Canonical Group Limited. Our address is 5 New Street Square, London, EC4A 3TW, United Kingdom. You can contact us by post at the address set out in the “right to complain” section, below or by email to [legal@canonical.com](mailto:legal@canonical.com) for the attention of "Legal".

## What information do we collect?

The following data is being collected by Canonical

| What is being sent?                                                                                                                                               | Example                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Version of Ubuntu (/etc/lsb-release)                                                                                                                              | "Ubuntu/18.04.3/LTS"                       |
| Operating System Name (uname -o)                                                                                                                                  | "GNU/Linux"                                |
| Kernel Version (uname -r)                                                                                                                                         | "4.15.0-72-generic"                        |
| Machine Hardware Name (uname -m)                                                                                                                                  | "x86_64"                                   |
| CPU Brand & Model (/proc/cpuinfo)                                                                                                                                 | "Intel(R)/Core(TM)/i5-8500B/CPU/@/3.00GHZ" |
| System Uptime (time since last boot) & Idle time (/proc/uptime)                                                                                                   | "uptime/108266.13/212047.71"               |
| cloud_id (/usr/bin/cloud-id) — Way to know what cloud (if any) this machine is running on.                                                                        | "aws" or "openstack" or "unknown"          |
| "Curl" version — the command used to get the message from the URL has its version appended. This is standard practice in a 'user-agent' string for HTTP requests. | "7.58.0-2ubuntu3.8"                        |

None of this data can be used to identify a machine or user.

Along with this data, the IP address and other network information is transmitted to facilitate communication on the internet from the Ubuntu machine to Canonical. This information is not stored by Canonical.

## How do you disable the collection?

Note that all of the system information may be shared with Canonical. If you would prefer that Canonical does not receive any item of system information, please do not consent to it being sent. You can disable this service as follows:

/etc/default/motd-news has an `ENABLED=1` setting that if set to `0` will turn off this functionality.

## Why do we collect this information?

The purpose of sending the system information is so that Canonical can tailor the message returned by https://motd.ubuntu.com. This allows Canonical to make users aware of new features of Ubuntu or services from Canonical that would be interesting to the Ubuntu user on the command line. For instance, something specific to only users with Intel CPUs, or specific to only users of older versions of Ubuntu.

## What do we do with your information?

Your information is stored in our systems and may be processed by Canonical globally.

## How long do we keep your information for?

We keep the system information for so long as reasonably required in accordance with our record retention policy.

## Your rights over your system information

You can decide whether to share the system information with Canonical or not.

If you do share the system information with Canonical we are unable to identify you against your system information, so we are unable to provide you with a copy of the system information or to delete the system information on request.

## Contact

Questions, comments and requests regarding this legal notice are welcomed and should be addressed to [legal@canonical.com](mailto:legal@canonical.com) or to the address below:

```
Legal, Canonical
2nd Floor, Clarendon House,
Victoria Street,
Douglas IM1 2LN,
Isle of Man
```

## Example motd-news Message

This is an example of a motd-news message:

```
* MicroK8s gets a native Windows installer and command-line integration.
https://ubuntu.com/blog/microk8s-installers-windows-and-macos
```

## Example Full MOTD Message

The message below is the full MOTD, displayed when you login via the console to an Ubuntu system. The motd-news portion is highlighted in green, the other pieces of the MOTD are informational only and do not reach out to the internet for any information:

```
Welcome to Ubuntu 18.04.4 LTS (GNU/Linux 4.15.0-101-generic x86_64)

* Documentation: https://help.ubuntu.com * Management: https://landscape.canonical.com * Support: https://ubuntu.com/pro

System information as of Wed Jun 17 11:56:43 MDT 2020

System load: 4.33
Usage of /home: 81.0% of 393.60GB
Memory usage: 63%
Swap usage: 17%
Processes: 1270
Users logged in: 1
IP address for br0: 10.10.0.13

=> / is using 85.0% of 53.79GB

* MicroK8s gets a native Windows installer and command-line integration.

https://ubuntu.com/blog/microk8s-installers-windows-and-macos

36 packages can be updated.
9 updates are security updates.

You have packages from the Hardware Enablement Stack (HWE) installed that
are going out of support on 2023-04-30.

There is a graphics stack installed on this system. An upgrade to a
configuration supported for the full lifetime of the LTS will become
available on 2020-07-21 and can be installed by running 'update-manager'
in the Dash.

*** System restart required ***
```
