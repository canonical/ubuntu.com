---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Installing Debian Packages"
  description: "Installing Debian Packages"
  auto_paginate: True
---

`dpkg` is a low-level system tool that installs, upgrades, and
removes Debian packages.

When Ian Murdock, the founder of the Debian project, first created `dpkg`,
it was only a shell script. `dpkg` was later rewritten in Perl, and, even
later, rewritten in C.  `dpkg` was originally an abbreviation for Debian
package.

To install a Debian package using the `dpkg` tool, we need to download
the `.deb` file and store it locally.

The `dpkg` tool keeps a database of all installed packages. This
database is located under **/var/lib/dpkg**.

## `dpkg` Commands

Some important `dpkg` commands, used to list, install, and remove
packages, are as follows:

* To list installed packages:
  ```
  $ sudo dpkg -l
  ```
* To remove an installed package (keeping any configuration files that
  it installed):
  ```
  $ sudo dpkg -r <package>
  ```
* To purge an installed package (meaning to remove the package
  *and* all its configuration files):
  ```
  $ sudo dpkg -P <package>
  ```
* To install a local package (note that this method is rarely used, as using APT is preferred):
  ```
  $ sudo dpkg -i <package>.deb
  ```
* To view the contents of a local package file:
  ```
  $ sudo dpkg -c <package>.deb
  ```
* To show the files that a package has installed:
  ```
  $ sudo dpkg -L <package>
  ```
* To search which package contains a specific file:
  ```
  $ dpkg -S </path/to/file>
  ```

If, for example, we want to check which files the (installed)
`cmatrix` package has created on our system, we run `dpkg -L` in the
following way:

```
$ sudo dpkg -L cmatrix
/.
/usr
/usr/bin
/usr/bin/cmatrix
/usr/share
/usr/share/applications
/usr/share/applications/cmatrix.desktop
/usr/share/consolefonts
/usr/share/consolefonts/matrix.fnt
/usr/share/consolefonts/matrix.psf.gz
/usr/share/doc
/usr/share/doc/cmatrix
/usr/share/doc/cmatrix/README
/usr/share/doc/cmatrix/README.md
/usr/share/doc/cmatrix/changelog.Debian.gz
/usr/share/doc/cmatrix/copyright
/usr/share/man
/usr/share/man/man1
/usr/share/man/man1/cmatrix.1.gz
```

From the preceding printout, we learn that the `cmatrix` binary is
installed in **/usr/bin/**, and that the `cmatrix` man page and `README`
are located in **/usr/share/**.

If we want to find out which Debian package installs a particular
Linux command, for example `ls`, we run `dpkg -S` in the following
way:

```
$ sudo dpkg -S /bin/ls
coreutils: /bin/ls

$ sudo dpkg -l coreutils
Desired=Unknown/Install/Remove/Purge/Hold
| Status=Not/Inst/Conf-files/Unpacked/halF-conf/Half-inst/trig-aWait/Trig-pend
|/ Err?=(none)/Reinst-required (Status,Err: uppercase=bad)
||/ Name           Version       Architecture Description
+++-==============-=============-============-=================================
ii  coreutils      8.30-3ubuntu2 amd64        GNU core utilities
```

From the preceding printout, we learn that `ls` comes with the
`coreutils` package.
