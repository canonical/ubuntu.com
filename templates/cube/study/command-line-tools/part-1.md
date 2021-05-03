---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "Linux Commands"
  description: "Linux Commands"
  auto_paginate: True
---

Linux commands are directives to computer programs to perform specific
tasks. We issue the commands via a command-line interface (CLI), such
as a shell.

To modify the default behaviour of a command, we use flags, options, and arguments.

Some Linux commands are part of the shell itself; we call these
*built-in commands,* or *builtins.* Others are executable programs, usually
located in the directories listing in the `$PATH` environment variable.

*Aliases* are typically shortcut commands to reference longer
commands. Users can define aliases and come up with their own shorter
commands.

To find out whether a command is a builtin, an alias, or an executable
program from one of the `$PATH` directories, use the `type` command:

```
$ type cd
cd is a shell builtin

$ type ls
ls is aliased to `ls --color=auto'

$ type mkdir
mkdir is /bin/mkdir

$ type type
type is a shell builtin
```

These outputs show that:

* The change directory `cd` command is a shell built-in command. 
* The list `ls` command is an alias to the list command with colorized output.
* The make directory `mkdir` command is a binary located in the **/bin** directory.
* The `type` command is yet another shell built-in command.

## Built-In Shell Commands

Built-in shell commands are available once the shell is loaded, and
they are executed from memory. They are not separate executables.
We can look at the built-in commands as commands that are
used frequently. As a consequence, they are moved into the shell
itself, so they do not require executing a process every time someone
runs them.

To list all the built-in commands available in a shell, use the `compgen -b` command.
For example, we can list all the commands available in the `bash` shell like this:

```
$ bash
$ compgen -b
.
:
[
alias
bg
bind
break
builtin
caller
cd
command
compgen
complete
compopt
continue
declare
dirs
disown
echo
enable
eval
exec
exit
export
false
fc
fg
getopts
hash
help
history
jobs
kill
let
local
logout
mapfile
popd
printf
pushd
pwd
read
readarray
readonly
return
set
shift
shopt
source
suspend
test
times
trap
true
type
typeset
ulimit
umask
unalias
unset
wait
```

## Executable Programs

When we run a command that is an executable program, the shell checks
the directories listed in the `$PATH` environment variable for a
filename matching the name of the command we issued. When it finds a matching
file, the shell creates a copy of itself in the computer's memory
and executes the file.

Let's find out the directories listed in the `$PATH` variable:

```
$ echo $PATH
/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin
```

The **/snap/bin** directory is on the `$PATH` directory list. Let's find
out what commands are available in this directory:

```
$ ls /snap/bin/
lxc  lxd.benchmark  lxd.check-kernel  lxd.lxc-to-lxd
lxd  lxd.buginfo    lxd.lxc           lxd.migrate
```

The applications installed using snap are under the **/snap/bin**
directory, and because this directory is in the `$PATH`, we can access
commands directly from the command line:

```
$ which lxc
/snap/bin/lxc

$ lxc list
+------+-------+------+------+------+-----------+
| NAME | STATE | IPV4 | IPV6 | TYPE | SNAPSHOTS |
+------+-------+------+------+------+-----------+
```

## Aliases

Aliases come in handy when we want to create shortcuts for longer
commands. To create an alias, use the `alias` command in the
following way:

```
alias short_command='long_command'
```

We can see all the aliases defined on the system using the
`alias` command:

```
$ alias
alias alert='notify-send --urgency=low -i "$([ $? = 0 ] && echo terminal || echo error)" "$(history|tail -n1|sed -e '\''s/^\s*[0-9]\+\s*//;s/[;&|]\s*alert$//'\'')"'
alias egrep='egrep --color=auto'
alias fgrep='fgrep --color=auto'
alias grep='grep --color=auto'
alias l='ls -CF'
alias la='ls -A'
alias ll='ls -alF'
alias ls='ls --color=auto'
```
