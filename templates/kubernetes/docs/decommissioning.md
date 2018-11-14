---
wrapper_template: base_docs.html
context:
    title: Decommissioning
markdown_includes:
    nav: shared/_side-navigation.md
---

Decommissioning a cluster requires only a few commands, but beware that it will irretrievably destroy the cluster, its workloads and any information that was stored within. Before proceeding, it is important to verify that you:

 - Have the correct details for the cluster you wish to decommission
 - Have retrieved any valuable data from the cluster

## Destroying the model

 It is always preferable to use a new **Juju** _model_ for each **Kubernetes** cluster.  Removing the model is then a simple operation.

 It is useful to list all the current models to make sure you are about to destroy the correct one:

 ```bash
 juju models
 ```

 This will list all the models running on the current controller, for example:

 ```no-highlight
 Controller: k8s-controller

 Model           Cloud/Region   Status     Machines  Cores  Access  Last connection
 controller      aws/us-east-1  available         1         4          admin   just now
 default           aws/us-east-1  available         0         -           admin   8 hours ago
 k8s-devel       aws/us-east-1  available         9        24        admin   3 hours ago
 k8s-production  aws/us-east-1  available         12     28  admin   5 minutes ago
k8s-testing      aws/us-east-1  available         9        24        admin   2 hours ago
```

To proceed, use the `juju destroy-model` command to target the model you wish
to remove. For example:

```bash
 juju destroy-model k8s-testing
 ```

 You will see a warning, and be required to confirm the action. **Juju** will
 then continue to free up the resources, giving feedback on the process. It may
 take some minutes to complete depending on the size of the deployed model and
 the nature of the cloud it is running on.

 ```no-highlight
 WARNING! This command will destroy the "k8s-testing" model.
 This includes all machines, applications, data and other resources.

 Continue [y/N]? y
 Destroying model
 Waiting on model to be removed, 7 machine(s), 4 application(s)...
 Waiting on model to be removed, 6 machine(s)...
 ...
 Waiting on model to be removed, 3 machine(s)...
 Waiting on model to be removed...
 Model destroyed.
```

You should confirm that the cloud instances have been terminated with the
relevant cloud console/utilities.


## Destroying a controller

 If there are no longer any cluster models attached to the controller, you may wish to
 remove the controller instance as well. This is performed with a similar command:

 ```bash
 juju destroy-controller <controller-name>
 ```

As previously, there is a confirmation step to make sure you wish to remove the
controller.

The command will return an error if there are populated models still attached
to the controller.

## Removing/editing Kube config

If you have permanently removed clusters, it is also advisable to remove their
entries in the **Kubernetes** configuration file (or remove the file entirely
if you have removed all the clusters).

By default the file is located at `~/.kube/config`.  It is a YAML format file, and each cluster
block looks similar to this:

```yaml
- cluster:
    certificate-authority-data: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURPekNDQWlPZ0F3SUJBZ0lKQU9HTm9PM1pNb3RGTUEwR0NTcUdTSWIzRFFFQkN3VUFNQmd4RmpBVUJnTlYKQkFNTURUTTBMakkwTkM0eE9USXVORGt3SGhjTk1UZ3hNREF4TURnek5qVTFXaGNOTWpnd09USTRNRGd6TmpVMQpXakFZTVJZd0ZBWURWUVFEREEwek5DNHlORFF1TVRreUxqUTVNSUlCSWpBTkJna3Foa2lHOXcwQkFRRUZBQU9DCkFROEFNSUlCQ2dLQ0FRRUE4YThJVytCUTM5c0p3OENyR0c5MmlYSUlWczNQOElEVVJvOTMyVFVYcG05UWkwSUgKeVF0a2N1WEVpREhlbUgwK1RORHRmaFZ4cm9BRjQrVEczR3JWZXc0YzgrZE0zNWJMY0lMRkl1L1UydlR4NkRXbgpDa2lwblhJVlc1QUxXa1hqRUh3NTUvWnk3S0F2SjVjS0h5WnhMYzY1ZFZqVjJYNkQxRHhJRXh0c2dDVnB2R1gvCmRpK1ppZlJXeFIwR0l5SkM3b29VaEVjcitvQVpMOFc2YklUMUlwcklXUGQ1eWhJck10MmpmaE42NWVkV1hjYkoKNERQeEpIOVlDNFFqSC84OHNJdWVJMWo4S1NYQjdwbUJxMzJHYXZuaFp3K2M5bG1KSlE5WjNZM2dla3lBUlZDRQpwUUU5T3BYR01QOCtCdng4QXdrQW9obE83RE1xQTlMaTl3QXExUUlEQVFBQm80R0hNSUdFTUIwR0ExVWREZ1FXCkJCUXRaa3paWmxKSmZKMGZtbWNPZU9pR0VBL3d1REJJQmdOVkhTTUVRVEEvZ0JRdFprelpabEpKZkowZm1tY08KZU9pR0VBL3d1S0VjcEJvd0dERVdNQlFHQTFVRUF3d05NelF1TWpRMExqRTVNaTQwT1lJSkFPR05vTzNaTW90RgpNQXdHQTFVZEV3UUZNQU1CQWY4d0N3WURWUjBQQkFRREFnRUdNQTBHQ1NxR1NJYjNEUUVCQ3dVQUE0SUJBUUJnCjVndFpyY0FLUlFSYUJFZDFiVm5vRXpoZkxld2RXU2RYaEZGRXB6bjlzdG05VGdVM2ZLREJ0NktUY3JKN2hqQWQKMUlUbUc1L2ExaUlDM29qQ2d3c1o3cnFmRlhkRGQzcVZGdjJySmZEN2ljeGV2c0NjWTdiS1hlYy9QdVgxQmxlMwo1amRjSWRkZnhqZ1M3K2dibCtQcGowbm9OR0c5MUgydWtBWTlaei9FUHdZckhuV1V1V1o5Z3JTZlVGam1ZMTNWCjkxZmF0S2R2dlU1blFPUXdkdThPVHlFRGk2blA4ckN4bEJjRW1hN3hkM3c5djI0NUlaRnd5QTJBMlR6emFJM04KYm0vMVNyL2tTNlZCSi9sZ2s3ampxRWFicmpFakluMlU4aGkzRkluRnBkZkZlUXhBaW5JcUx5dGRzeXY5aFZVbQpKQ3luNW8yaGVjSTFsaDU3RFRtYQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0t
    server: https://54.229.190.254:443
  name: conjure-canonical-kubern-fc3
contexts:
- context:
    cluster: conjure-canonical-kubern-fc3
    user: conjure-canonical-kubern-fc3
  name: conjure-canonical-kubern-fc3
current-context: conjure-canonical-kubern-fc3
kind: Config
preferences: {}
users:
- name: conjure-canonical-kubern-fc3
  user:
    password: sZVKhY7bZK8oG7vLkkOssNhTzKZlBmcG
    username: admin
```
