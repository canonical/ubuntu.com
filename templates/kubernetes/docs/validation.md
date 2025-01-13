---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Validation"
  description: How to run end-to-end (e2e) tests for Kubernetes.
keywords: juju, validation, e2e, debug-log
tags: [operating]
sidebar: k8smain-sidebar
permalink: validation.html
layout: [base, ubuntu-com]
toc: False
---

End-to-end (e2e) tests for **Kubernetes** provide a mechanism to test the behaviour of the system. This is a useful indicator that the cluster is performing properly, as well as a good validation of any code changes.

For **Charmed Kubernetes**, these tests are encapsulated in an additional
**Juju** charm which can be added to your cluster. Actual testing is then run
through the charm's actions.

<div class="p-notification--caution is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Caution:</span>
    <p class="p-notification__message">Your cluster will need to have at least two running worker units for the `e2e` test to run properly.</div>
  </div>
</div>

## Deploying the kubernetes-e2e charm

Add the charm to your cluster:

```bash
juju deploy kubernetes-e2e --constraints mem=4G
```

We also need to configure the charm to select the appropriate version of tests.
This relates to the installed version of Kubernetes. You can check which
version your cluster is set to by running:

```bash
juju config kubernetes-control-plane channel
```

The output will be in the form of `version.number/risk`, e.g `1.24/stable`. You should set
the `kubernetes-e2e` channel to the same value.

```
juju config kubernetes-e2e channel=1.24/stable
```

Finally we relate the charm to `easyrsa` and `kubernetes-control-plane`:

```bash
juju config kubernetes-control-plane allow-privileged=true
juju integrate kubernetes-e2e easyrsa
juju integrate kubernetes-e2e kubernetes-control-plane:kube-api-endpoint
juju integrate kubernetes-e2e:kube-control kubernetes-control-plane:kube-control
```

It may take some moments for these relations to establish. Once the connections are made, the charm will update its status to "Ready to test."

## Running the default tests

The tests are configured as a **Juju** _action_. To run the default tests:

```bash
juju run kubernetes-e2e/0 test --background
```

The command will return with a number for that specific action operation. 
```console
Scheduled operation 25 with task 26
Check operation status with 'juju show-operation 25'
Check task status with 'juju show-task 26'
```

See the section on _Test output_ below for details.

## Running specific tests

The complete set of **Kubernetes** e2e tests is more fully described in the
[upstream Kubernetes documentation][e2e-upstream]. In some cases you may wish
to omit particular groups of tests. This is possible by applying a regular
expression defining the tests to omit when initiating the action.

By default, the standard tests marked `[Flaky]` or `[Serial]` are skipped. To
also omit the tests marked as `[Slow]`, you could run:

```bash
juju run kubernetes-e2e/0 test skip='\[(Flaky|Slow|Serial)\]'  --background
```

Note that the brackets for the regex need to be escaped as shown.

Running this command will return a uuid for that specific test run, as with the default case.

## Test output

You can check on the current status of the test by running:

```bash
juju show-operation 25
```

where `25` is the id of the scheduled operation when the test was initiated.
This will return YAML output indicating the current status, 
which can be either `running`, `completed` or `failed`.

```yaml
summary: test run on unit-kubernetes-e2e-0
status: running
action:
  name: test
  parameters: {}
timing:
  enqueued: 2023-03-13 11:01:34 -0500 CDT
  started: 2023-03-13 11:01:34 -0500 CDT
tasks:
  "26":
    host: kubernetes-e2e/0
    status: running
    timing:
      enqueued: 2023-03-13 11:01:34 -0500 CDT
      started: 2023-03-13 11:01:34 -0500 CDT
```

Once completed, you can see more detail on the timing by running:

```bash
juju show-operation 25
```

Which will return output similar to:

```yaml
summary: test run on unit-kubernetes-e2e-0
status: running
action:
  name: test
  parameters: {}
timing:
  enqueued: 2023-03-13 11:01:34 -0500 CDT
  started: 2023-03-13 11:01:34 -0500 CDT
  completed: 2023-03-13 11:10:15 -0500 CDT
tasks:
  "26":
    host: kubernetes-e2e/0
    status: completed
    timing:
      enqueued: 2023-03-13 11:01:34 -0500 CDT
      started: 2023-03-13 11:01:34 -0500 CDT
      completed: 2023-03-13 11:10:15 -0500 CDT
    results:
      junit: /home/ubuntu/26-junit.tar.gz
      log: /home/ubuntu/26.log.tar.gz
```

If the tests fail, or you want to look through the detail of each test, you can examine the
detailed log.

## Viewing test logs

The test logfile is stored as a file on the test instance. The filename
corresponds to the id of the action which created it, with a '.log'
extension, and it is stored in the `/home/ubuntu/` directory of the machine
where the tests are running. A compressed version is also stored with the
extension `.log.tar.gz`

This log can be copied to your local machine for easier viewing:

```bash
juju scp kubernetes-e2e/0:26.log  .
```

Note that the captured test logfile uses ANSI output, and is best viewed with
`cat`, `tail` or a similar command which can handle this type of output.
Alternatively, you can strip the ANSI parts of the output:

```bash
fn=<your log file name>
echo -ne $(cat $fn | sed  's/$/\\n/' | sed 's/\x1B\[[0-9]*\w//g')
```

<div class="p-notification--caution is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Caution:</span>
    <p class="p-notification__message">If you are running regular tests in this way, it is advisable to remove the generated logs from the test unit. The uncompressed logs in particular can be very large and quickly fill up storage.</p>
  </div>
</div>

## Upgrading the e2e tests

When an update is available, the `kubernetes-e2e` charm can be upgraded with the command:

```bash
release=(juju status kubernetes-worker -m charmed-kubernetes --format json | jq -r '.applications["kubernetes-worker"]["charm-channel"]')
juju refresh kubernetes-e2e --channel=${release}
```

<!--LINKS -->

[e2e-upstream]: https://github.com/kubernetes/community/blob/master/contributors/devel/sig-testing/e2e-tests.md

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/validation.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://chat.charmhub.io/charmhub/channels/kubernetes"> public Mattermost channel</a>.</p>
  </div>
</div>
