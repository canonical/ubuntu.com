---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Introduction"
  description: "Introduction"
  auto_paginate: True
---

A shell script is a computer program that is run by a Unix shell.
We write and execute shell scripts when we want to replace manually
running repetitive tasks or automate the execution of a long
sequence of commands.

Usually, a shell script is a text file that incorporates the
commands to be executed. Instead of typing each command on the
command line, we add the commands to a shell script file.
We then  make the shell script file executable, and we run the shell
script file to execute all the commands in one go.

If all the commands in a shell script run in the foreground,
the commands are executed sequentially, in the order they are listed
in the shell script file. The shell waits for the current command to
finish executing before moving on to the next one.

If we want to run commands in parallel in a shell script, we can run
some commands in the background using the `&` control operator.

## Types of Shells

Some of the most common shell scripting languages are `sh`, `bash`,
`csh`, `rsh`, and `tcl`.

To see the shells available on Ubuntu, check the **/etc/shells** file.

```
~$ cat /etc/shells 
# /etc/shells: valid login shells
/bin/sh
/bin/bash
/usr/bin/bash
/bin/rbash
/usr/bin/rbash
/bin/dash
/usr/bin/dash
/usr/bin/tmux
/usr/bin/screen
```

The Bourne shell, `sh`,  is the oldest shell still in common use.
Ubuntu also includes:

* The Bourne Again Shell, `bash`.
* A Restricted Shell, `rbash`.
* The Debian Almquist shell, `dash`, for faster shell script execution.
* A terminal multiplexer, `tmux`.
* A screen manager with terminal emulation, `screen`.

Shell scripts are executed by the Operating System itself, and the
invocation of their interpreters is handled as a core operating system
feature. This means that a user on a `dash` shell can execute a `bash`
shell, for example:

```
ubuntu@deploy:~$ dash
$ cat bash_script.sh
#!/bin/bash

echo "Hello!"
$ ./bash_script.sh
Hello!
$
```
