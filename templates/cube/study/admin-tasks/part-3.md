---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Administrative Tasks"
  description: "Administrative Tasks"
  auto_paginate: True
---

## User Management

User management means:

* Creating users.
* Creating groups.
* Adding users to groups.
* Changing users' passwords.
* Removing users from groups.
* Removing groups.
* Removing users.

Users can represent humans that need to log in to a server in order
to perform certain tasks, or services that need to communicate with
other services.

While it is a common practice to force users to use a strong password
and to change passwords periodically, changing a service password
regularly is not. It is the sysadmin that must
take care of changing passwords for users created for services.

If you want to enforce passwords of a certain length, this can be done
by configuring `pam`. If, for example, you want to use passwords that
have a minimum length of 32 characters, you have to add the following
line in `cat /etc/pam.d/common-password`:

```
password  requisite   pam_cracklib.so try_first_pass retry=3 minlen=32
```

Then you can generate 32 character long passwords with the `openssl`
command, for example.

```
$ openssl rand -base64 32
9Hq5NNmUtR4Ab1ezrkJzbYeHqUVWdABNZyJB1HQO5ks=
```

To set an expiration date on a password, you can use the `chage` command.

```
$ sudo chage -M 30 alice
$ sudo chage -l alice
Last password change					: Nov 13, 2020
Password expires					: Dec 28, 2020
Password inactive					: never
Account expires						: never
Minimum number of days between password change		: 0
Maximum number of days between password change		: 30
Number of days of warning before password expires	: 7
```

You can force a user to change the password the next time they try to
log in with the `passwd` command:

```
$ sudo passwd -e alice
passwd: password expiry information changed.
```
