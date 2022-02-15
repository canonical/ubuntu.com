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

<div class="p-notification--caution">
  <p markdown="1" class="p-notification__response">
    <span class="p-notification__status">Caution:</span>
Your cluster will need to have at least two running worker units for the `e2e` test to run properly.
  </p>
</div>

## Deploying the kubernetes-e2e charm

Add the charm to your cluster:

```bash
juju deploy cs:~containers/kubernetes-e2e --constraints mem=4G --channel edge
```

We also need to configure the charm to select the appropriate version of tests.
This relates to the installed version of Kubernetes. You can check which
version your cluster is set to by running:

```bash
juju config kubernetes-master channel
```

The output will be in the form of 'version.number/risk', e.g '1.12/stable'. You should set
the `kubernetes-e2e` channel to the same value.

```
juju config kubernetes-e2e channel=1.12/stable
```

Finally we relate the charm to `easyrsa` and `kubernetes-master`:

```bash
juju config kubernetes-master allow-privileged=true
juju config kubernetes-worker allow-privileged=true
juju add-relation kubernetes-e2e easyrsa
juju add-relation kubernetes-e2e:kubernetes-master kubernetes-master:kube-api-endpoint
juju add-relation kubernetes-e2e:kube-control kubernetes-master:kube-control
```

It may take some moments for these relations to establish. Once the connections are made, the charm will update its status to "Ready to test."

## Running the default tests

The tests are configured as a **Juju** _action_. To run the default tests:

```bash
juju run-action kubernetes-e2e/0 test
```

The command will return with a uuid for that specific test run. See the section
on _Test output_ below for details.

## Running specific tests

The complete set of **Kubernetes** e2e tests is more fully described in the
[upstream Kubernetes documentation][e2e-upstream]. In some cases you may wish
to omit particular groups of tests. This is possible by applying a regular
expression defining the tests to omit when initiating the action.

By default, the standard tests marked `[Flaky]` or `[Serial]` are skipped. To
also omit the tests marked as `[Slow]`, you could run:

```bash
juju run-action kubernetes-e2e/0 test skip='\[(Flaky|Slow|Serial)\]'
```

Note that the brackets for the regex need to be escaped as shown.

Running this command will return a uuid for that specific test run, as with the default case.

## Test output

You can check on the current status of the test by running:

```bash
juju show-action-status 8f8ec748-6ca7-4bbb-86f8-f37e44ba46f9
```

where `8f8ec748-6ca7-4bbb-86f8-f37e44ba46f9` is the uuid of the action returned
when we initiated the test. This will return YAML output indicating the current
status, which can be either `running`, `completed` or `failed`.

```yaml
actions:
- action: test
  completed at: n/a
  id: 8f8ec748-6ca7-4bbb-86f8-f37e44ba46f9
  status: running
  unit: e2e/0
```

Once completed, you can see more detail on the timing by running:

```bash
juju show-action-status  8f8ec748-6ca7-4bbb-86f8-f37e44ba46f9
```

Which will return output similar to:

```yaml
results:
  junit: /home/ubuntu/8f8ec748-6ca7-4bbb-86f8-f37e44ba46f9-junit.tar.gz
  log: /home/ubuntu/8f8ec748-6ca7-4bbb-86f8-f37e44ba46f9.log.tar.gz
status: completed
timing:
  completed: 2018-10-06 18:33:15 +0000 UTC
  enqueued: 2018-10-06 18:25:30 +0000 UTC
  started: 2018-10-06 18:25:30 +0000 UTC
```

If the tests fail, or you want to look through the detail of each test, you can examine the
detailed log.

## Viewing test logs

The test logfile is stored as a file on the test instance. The filename
corresponds to the uuid of the action which created it, with a '.log'
extension, and it is stored in the `/home/ubuntu/` directory of the machine
where the tests are running. A compressed version is also stored with the
extension `.log.tar.gz`

This log can be copied to your local machine for easier viewing:

```bash
juju scp kubernetes-e2e/0:4ceed33a-d96d-465a-8f31-20d63442e51b.log  .
```

Note that the captured test logfile uses ANSI output, and is best viewed with
`cat`, `tail` or a similar command which can handle this type of output.
Alternatively, you can strip the ANSI parts of the output:

```bash
fn=<your log file name>
echo -ne $(cat $fn | sed  's/$/\\n/' | sed 's/\x1B\[[0-9]*\w//g')
```

<div class="p-notification--caution">
  <p markdown="1" class="p-notification__response">
    <span class="p-notification__status">Caution:</span>
If you are running regular tests in this way, it is advisable to remove the generated logs from the test unit. The uncompressed logs in particular can be very large and quickly fill up storage.
  </p>
</div>

## Upgrading the e2e tests

When an update is available, the `kubernetes-e2e` charm can be upgraded with the command:

```bash
juju upgrade-charm kubernetes-e2e
```

<!--LINKS -->

[e2e-upstream]: https://github.com/kubernetes/community/blob/master/contributors/devel/sig-testing/e2e-tests.md

<!-- FEEDBACK -->
<div class="p-notification--information">
  <p class="p-notification__response">
    We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/validation.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new" >file a bug here</a>.
  </p>
</div>
