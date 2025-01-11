---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "NVIDIA DGX"
  description: DGX certified Kubernetes.
keywords: gpu, nvidia, dgx
tags: [operating]
sidebar: k8smain-sidebar
permalink: nvidia-dgx.html
layout: [base, ubuntu-com]
toc: False
---

Charmed Kubernetes is a certified [DGX-Ready][] Kubernetes.

Charmed Kubernetes will automatically detect DGX hardware and
install the required drivers from NVIDIA repositories. Prior to Charmed
Kubernetes 1.24+ck1, ensure `containerd` is configured for the correct
driver versions with the following:

```bash
juju config containerd \
  nvidia_apt_key_urls='https://nvidia.github.io/nvidia-container-runtime/gpgkey https://developer.download.nvidia.com/compute/cuda/repos/{id}{version_id_no_dot}/x86_64/3bf863cc.pub'
```

## Verify the installation

A simple test job can be created to run NVIDIA's hardware reporting tool.
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
      - image: nvidia/cuda:11.6.0-base-ubuntu20.04
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

Tue May 17 21:57:41 2022       
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 515.43.04    Driver Version: 515.43.04    CUDA Version: 11.7     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|                               |                      |               MIG M. |
|===============================+======================+======================|
|   0  NVIDIA A100-SXM...  On   | 00000000:07:00.0 Off |                    0 |
| N/A   25C    P0    50W / 400W |      0MiB / 81920MiB |      0%      Default |
|                               |                      |             Disabled |
+-------------------------------+----------------------+----------------------+
|   1  NVIDIA A100-SXM...  On   | 00000000:0F:00.0 Off |                    0 |
| N/A   24C    P0    53W / 400W |      0MiB / 81920MiB |      0%      Default |
|                               |                      |             Disabled |
+-------------------------------+----------------------+----------------------+
|   2  NVIDIA A100-SXM...  On   | 00000000:47:00.0 Off |                    0 |
| N/A   25C    P0    54W / 400W |      0MiB / 81920MiB |      0%      Default |
|                               |                      |             Disabled |
+-------------------------------+----------------------+----------------------+
|   3  NVIDIA A100-SXM...  On   | 00000000:4E:00.0 Off |                    0 |
| N/A   25C    P0    49W / 400W |      0MiB / 81920MiB |      0%      Default |
|                               |                      |             Disabled |
+-------------------------------+----------------------+----------------------+
|   4  NVIDIA A100-SXM...  On   | 00000000:87:00.0 Off |                    0 |
| N/A   29C    P0    53W / 400W |      0MiB / 81920MiB |      0%      Default |
|                               |                      |             Disabled |
+-------------------------------+----------------------+----------------------+
|   5  NVIDIA A100-SXM...  On   | 00000000:90:00.0 Off |                    0 |
| N/A   27C    P0    50W / 400W |      0MiB / 81920MiB |      0%      Default |
|                               |                      |             Disabled |
+-------------------------------+----------------------+----------------------+
|   6  NVIDIA A100-SXM...  On   | 00000000:B7:00.0 Off |                    0 |
| N/A   28C    P0    50W / 400W |      0MiB / 81920MiB |      0%      Default |
|                               |                      |             Disabled |
+-------------------------------+----------------------+----------------------+
|   7  NVIDIA A100-SXM...  On   | 00000000:BD:00.0 Off |                    0 |
| N/A   28C    P0    52W / 400W |      0MiB / 81920MiB |      0%      Default |
|                               |                      |             Disabled |
+-------------------------------+----------------------+----------------------+
                                                                               
+-----------------------------------------------------------------------------+
| Processes:                                                                  |
|  GPU   GI   CI        PID   Type   Process name                  GPU Memory |
|        ID   ID                                                   Usage      |
|=============================================================================|
|  No running processes found                                                 |
+-----------------------------------------------------------------------------+
```
[nvidia-supported-tags]: https://gitlab.com/nvidia/container-images/cuda/blob/master/doc/supported-tags.md
[asset-nvidia]: https://raw.githubusercontent.com/charmed-kubernetes/kubernetes-docs/main/assets/nvidia-test.yaml
[dgx-ready]: https://www.nvidia.com/en-gb/data-center/dgx-ready-software/
