---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Using GPU workers"
  description: How to run workloads with GPU support.
keywords: gpu, nvidia, cuda
tags: [operating]
sidebar: k8smain-sidebar
permalink: gpu-workers.html
layout: [base, ubuntu-com]
toc: False
---

**Charmed Kubernetes** can automatically detect GPU-enabled hardware and install
required drivers from NVIDIA repositories. With the release of Charmed Kubernetes 1.29,
the [NVIDIA GPU Operator charm][nvidia-gpu-operator] is available to simplify GPU
software management and configuration.

This page describes recommended deployment and verification steps for using GPU workers
with Charmed Kubernetes.

## Deploying Charmed Kubernetes with GPU workers

GPU support varies depending on the underlying cloud, so you will need to determine a
particular instance type for the `kubernetes-worker` application.

For example, when deploying to AWS, you may decide to use a `p3.2xlarge` instance from
the available [AWS GPU-enabled instance types][aws-instance].
Similarly, you could choose an Azure `Standard_NC6s_v3` instance from the available
[Azure GPU-enabled instance types][azure-instance].

NVIDIA updates its list of supported GPUs frequently, so be sure to cross-reference the
GPU included in a specific cloud instance against the
[Supported NVIDIA GPUs and Systems][nvidia-gpu-support] documentation.

When deploying the Charmed Kubernetes bundle, you can use a YAML overlay file to ensure
application instance types and configuration are optimised for use in a GPU-enabled
environemnt. Broadly, the following should be noted when constructing an overlay file:

- The GPU operator charm manages software packages and drivers on a host. Therefore,
the `kubernetes-control-plane` application needs to be deployed in privileged mode.
- The automatic configuration of NVIDIA software repositories should be disabled for
the `containerd` application as this is now managed by the GPU operator charm.
- A suitable GPU-enabled instance constraint will need to be specified for the
`kubernetes-worker` application.

The following is an example overlay file that meets the above considerations for AWS:

```yaml
# AWS gpu-overlay.yaml
applications:
  containerd:
    options:
      gpu_driver: none
  kubernetes-control-plane:
    options:
      allow-privileged: "true"
  kubernetes-worker:
    constraints: "instance-type=p3.2xlarge root-disk=128G"
    num_units: 1
```

Deploy Charmed Kubernetes with your overlay(s) like this:

```bash
juju deploy charmed-kubernetes --overlay ~/path/my-overlay.yaml --overlay ~/path/gpu-overlay.yaml
```

As demonstrated here, you can use multiple overlay files when deploying, so you
can combine GPU support with an integrator charm or other custom configuration.

### Adding GPU workers post deployment

It isn't necessary for all worker units to have GPU support. You can add
GPU-enabled workers to an existing cluster. The recommended way to do this is
to first set a new constraint for the `kubernetes-worker` application:

```bash
juju set-constraints kubernetes-worker instance-type=p3.2xlarge
```

Then add as many new GPU worker units as required. For example, to add two new
units:

```bash
juju add-unit kubernetes-worker -n2
```

### Adding GPU workers with GCP

Google supports GPUs slightly differently to most clouds. There are no GPU
variations included in the general instance templates, and therefore they have
to be added manually.

To begin, add a new machine with Juju. Include any desired constraints for
cpu cores, memory, etc:

```bash
juju add-machine --constraints 'cores=4 mem=16G'
```

The command will return with the unit number of the machine that was created -
take note of this number.

Next you will need to use the gcloud tool or the GCP console to stop the
newly created instance, edit its configuration and then restart the machine.

Once it is up and running, add the `kubernetes-worker` application to it:

```bash
juju add-unit kubernetes-worker --to 10
```

...replacing `10` in the above with the previously noted number. As the charm
installs, the GPU will be detected and the relevant support will be installed.

## Deploying the GPU Operator

Operator charms use Kubernetes as a secondary cloud on your Juju controller. The primary
cloud (e.g. AWS) hosts machine-style workloads like Charmed Kubernetes, which in turn
provides the platform needed for Kubernetes operators.

Create an `operator-cloud` based on the Charmed Kubernetes configuration:

```bash
kubeconfig="$(juju ssh kubernetes-control-plane/leader -- cat config)"
controller="$(juju controller-config controller-name)"
echo "$kubeconfig" | \
    juju add-k8s operator-cloud --controller "$controller" --skip-storage
```

Switch to this cloud and create a model for our GPU operator:

```bash
juju switch operator-cloud
juju add-model operator-model operator-cloud
```

Now deploy the NVIDIA GPU Operator charm. As mentioned above, this charm will install
requisite drivers and software packages on the worker machine, therefore we use the
`--trust` flag to ensure the charm has host administrative privileges:

```bash
juju deploy nvidia-gpu-operator --channel 1.29/stable --trust
```

Deployment of this charm will typically take 15-30 minutes. Once complete, Kubernetes
will be ready to run GPU optimised workloads.

<a  id="test"> </a>
## Testing

As GPU instances can be costly, it is useful to test that they can actually be
used. A simple test job can be created to run NVIDIA's hardware reporting tool.
Please note that you may need to replace the image tag in the following
YAML with [the latest supported one][nvidia-supported-tags].

This can also be [downloaded here][asset-nvidia].

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: nvidia-smi
spec:
  template:
    metadata:
      name: nvidia-smi
    spec:
      restartPolicy: Never
      containers:
      - image: nvidia/cuda:12.1.0-base-ubuntu22.04
        name: nvidia-smi
        args:
          - nvidia-smi
        resources:
          limits:
            nvidia.com/gpu: 1
          requests:
            nvidia.com/gpu: 1
        volumeMounts:
        - mountPath: /usr/bin/
          name: binaries
        - mountPath: /usr/lib/x86_64-linux-gnu
          name: libraries
      volumes:
      - name: binaries
        hostPath:
          path: /usr/bin/
      - name: libraries
        hostPath:
          path: /usr/lib/x86_64-linux-gnu
```

Download the file and run it with:

```bash
kubectl create -f nvidia-test.yaml
```

You can inspect the logs to find the hardware report.

```bash
kubectl logs job.batch/nvidia-smi

Tue Apr 11 22:46:04 2023
+---------------------------------------------------------------------------------------+
| NVIDIA-SMI 530.30.02              Driver Version: 530.30.02    CUDA Version: 12.1     |
|-----------------------------------------+----------------------+----------------------+
| GPU  Name                  Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf            Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|                                         |                      |               MIG M. |
|=========================================+======================+======================|
|   0  Tesla V100-SXM2-16GB            On | 00000000:00:1E.0 Off |                    0 |
| N/A   36C    P0               23W / 300W|      0MiB / 16384MiB |      0%      Default |
|                                         |                      |                  N/A |
+-----------------------------------------+----------------------+----------------------+

+---------------------------------------------------------------------------------------+
| Processes:                                                                            |
|  GPU   GI   CI        PID   Type   Process name                            GPU Memory |
|        ID   ID                                                             Usage      |
|=======================================================================================|
|  No running processes found                                                           |
+---------------------------------------------------------------------------------------+
```

<!-- LINKS -->

[nvidia-gpu-operator]: https://charmhub.io/nvidia-gpu-operator?channel=1.29/stable
[asset-nvidia]: https://raw.githubusercontent.com/charmed-kubernetes/kubernetes-docs/main/assets/nvidia-test.yaml
[nvidia-supported-tags]: https://gitlab.com/nvidia/container-images/cuda/blob/master/doc/README.md#supported-tags
[quickstart]: /kubernetes/docs/quickstart
[aws-instance]: https://aws.amazon.com/ec2/instance-types/#Accelerated_Computing
[azure-instance]: https://learn.microsoft.com/en-us/azure/virtual-machines/sizes-gpu
[nvidia-gpu-support]: https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/platform-support.html#supported-nvidia-gpus-and-systems

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/gpu-workers.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://chat.charmhub.io/charmhub/channels/kubernetes"> public Mattermost channel</a>.</p>
  </div>
</div>

