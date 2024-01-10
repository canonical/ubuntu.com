---
wrapper_template: "templates/docs/markdown.html"
markdown_includes:
  nav: "kubernetes/docs/shared/_side-navigation.md"
context:
  title: "Quick start"
  description: With this quick start guide and some tools from Canonical, you'll have a Kubernetes cluster running on the cloud of your choice in minutes!
keywords: quickstart
tags: [getting_started]
sidebar: k8smain-sidebar
permalink: quickstart.html
layout: [base, ubuntu-com]
toc: False
---

Charmed Kubernetes<sup>&reg;</sup> delivers a 'pure K8s' experience, tested
across a wide range of clouds and integrated with modern metrics and monitoring.
It works across all major public clouds and private infrastructure, enabling your
teams to operate Kubernetes clusters on demand, anywhere.

With this quick start guide and some tools from Canonical, you'll have a
Kubernetes cluster running on the cloud of your choice in minutes!

## What you'll need

- An Ubuntu 22.04 LTS, 20.04 LTS or 18.04 LTS environment to run the commands (or another operating system which supports `snapd` - see the [snapd documentation][snapd-docs])
- Account credentials for one of the following public clouds:
  - [Amazon Web Services][cloud-aws], including AWS-China and AWS-gov
  - [CloudSigma][cloud-cloudsigma]
  - [Google Cloud platform ][cloud-google]
  - [Joyent][cloud-joyent]
  - [Microsoft Azure][cloud-azure], including Azure-China
  - [Oracle Cloud][cloud-oracle]
  - [Rackspace][cloud-rackspace]

<div class="p-notification--positive is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">If you don't meet these requirements, there are additional ways of installing <emphasis>Charmed Kubernetes<sup>&reg;</sup></emphasis>, including additional OS support and an entirely local deploy. Please see the more general <a href="/kubernetes/docs/install-manual">Installing Charmed Kubernetes</a> page for details. </p>
  </div>
</div>

<section class="p-strip is-bordered">
  <div class="u-fixed-width">
    <ol class="p-stepped-list--detailed">
      <li class="p-stepped-list__item">
        <h3 class="p-stepped-list__title"><span class="p-stepped-list__bullet">1</span>Install Juju</h3>
        <div class="p-stepped-list__content">
<a href="https://jaas.ai" >Juju</a> is a tool for
deploying, configuring, and operating complex software on public or private
clouds. It can be installed with a snap:
          <div class="p-code-snippet">
            <pre class="p-code-snippet__block--icon"><code>sudo snap install juju ---channel=3.1/stable</code></pre>
          </div>
          <script id="asciicast-254739" src="https://asciinema.org/a/254739.js" async data-autoplay="true" data-rows="4"></script>
        </div>
      </li>

      <li class="p-stepped-list__item">
        <h3 class="p-stepped-list__title"><span class="p-stepped-list__bullet">2</span>Find your cloud</h3>
        <div class="p-stepped-list__content">

Juju has baked in knowledge of many public clouds such as AWS, Azure and
Google. You can see which ones are ready to use by running this command:

          <div class="p-code-snippet">
            <pre class="p-code-snippet__block--icon"><code>juju clouds</code></pre>
          </div>
          <script id="asciicast-254740" src="https://asciinema.org/a/254740.js" async data-rows="18" ></script>

          <p><a href="https://juju.is/docs/juju/clouds">Find out more about Clouds in Juju</a></p>
        </div>
      </li>

      <li class="p-stepped-list__item">
        <h3 class="p-stepped-list__title"><span class="p-stepped-list__bullet">3</span>Add Credentials</h3>
        <div class="p-stepped-list__content">

<p>Most clouds require credentials so that the cloud knows which operations are authorised, so you will need to supply these for Juju. If you choose to use AWS, for example, you would run:</p>
          <div class="p-code-snippet">
            <pre class="p-code-snippet__block--icon"><code>juju add-credential aws</code></pre>
          </div>        
<p>For a different cloud, just substitute in the name from the previous
  list output by Juju. The data you need to supply will vary depending on the cloud. </p>
            <script id="asciicast-Wo12W39et3IJzF15rAyVunbbl" src="https://asciinema.org/a/Wo12W39et3IJzF15rAyVunbbl.js" async data-rows="18" ></script>
        </div>

      </li>

      <li class="p-stepped-list__item">
        <h3 class="p-stepped-list__title"><span class="p-stepped-list__bullet">4</span>Add a Controller</h3>
        <div class="p-stepped-list__content">
          <p>The Juju controller is used to manage the software deployed through Juju, from deployment to upgrades to day-two operations. One Juju controller can manage multiple projects or workspaces, which in Juju are known as 'models'.</p>
          <div class="p-code-snippet">
            <pre class="p-code-snippet__block--icon"><code>juju bootstrap aws my-controller</code></pre>
          </div>               
          <script id="asciicast-2FOd2qvaJL0wWqvZqFeVbwUsz" src="https://asciinema.org/a/2FOd2qvaJL0wWqvZqFeVbwUsz.js" async data-rows="18"></script>
        </div>
      </li>

      <li class="p-stepped-list__item">
        <h3 class="p-stepped-list__title"><span class="p-stepped-list__bullet">5</span>Add a Model</h3>
        <div class="p-stepped-list__content">
          <p>The model holds a specific deployment. It is a good idea to create a new one specifically for each deployment.</p>
          <div class="p-code-snippet">
            <pre class="p-code-snippet__block--icon"><code>juju add-model k8s</code></pre>
          </div>   
                      <p>Remember that you can have multiple models on each controller, so you can deploy multiple Kubernetes clusters, or other applications.</p>
        </div>
      </li>

      <li class="p-stepped-list__item">
        <h3 class="p-stepped-list__title"><span class="p-stepped-list__bullet">6</span>Deploy Kubernetes</h3>
        <div class="p-stepped-list__content">
          <p>Deploy the Kubernetes bundle to the model. This will add instances to the model and deploy the required applications.</p>
          <div class="p-code-snippet">
            <pre class="p-code-snippet__block--icon"><code>juju deploy charmed-kubernetes</code></pre>
          </div>            
          <script id="asciicast-8YAPb63aB9kfB7j1M9X6COGer" src="https://asciinema.org/a/8YAPb63aB9kfB7j1M9X6COGer.js" async></script>
        </div>
      </li>
      <li class="p-stepped-list__item">
        <h3 class="p-stepped-list__title"><span class="p-stepped-list__bullet">6</span>Monitor the deployment</h3>
        <div class="p-stepped-list__content">
          <p>Juju is now busy creating instances, installing software and connecting the different parts of the cluster together, which can take several minutes. You can monitor what's going on by running:</p>
          <div class="p-code-snippet">
            <pre class="p-code-snippet__block--icon"><code>watch -c juju status --color</code></pre>
          </div>           
        </div>
      </li>
      <li class="p-stepped-list__item">
        <h3 class="p-stepped-list__title"><span class="p-stepped-list__bullet">6</span>Start using your cluster!</h3>
        <div class="p-stepped-list__content">
          <p>Congratulations! You have a Kubernetes cluster up and running - now let's use it! The link below takes you to the operations guide, detailing some of the common things you'll want to do next: </p>
          <p>
          <a href="/kubernetes/docs/operations">Get started with your new cluster&nbsp;›</a>
          </p>
        </div>
      </li>


      </ol>

    </div>

  </section>

<div class="p-notification--positive is-inline">
  <div markdown="1" class="p-notification__content">
    <span class="p-notification__title">Note:</span>
    <p class="p-notification__message">This guide gets you up and running with Charmed Kubernetes quickly. If you want to explore how to customise your install, please see the <a href="/kubernetes/docs/install-manual">Installing Charmed Kubernetes</a> page for a more detailed guide. </p>
  </div>
</div>


<!-- LINKS -->

[jujucharms-com]: https://charmhub.io
[install]: /kubernetes/docs/install-manual
[overview]: /kubernetes/docs/overview
[snapd-docs]: https://docs.snapcraft.io/core/install
[cloud-aws]: https://aws.amazon.com
[cloud-cloudsigma]: https://www.cloudsigma.com
[cloud-google]: https://cloud.google.com/
[cloud-oracle]: https://cloud.oracle.com/home
[cloud-rackspace]: https://www.rackspace.com/cloud/
[cloud-azure]: https://azure.microsoft.com/
[cloud-joyent]: https://www.joyent.com/

<!-- FEEDBACK -->
<div class="p-notification--information">
  <div class="p-notification__content">
    <p class="p-notification__message">We appreciate your feedback on the documentation. You can
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/edit/main/pages/k8s/quickstart.md" >edit this page</a>
    or
    <a href="https://github.com/charmed-kubernetes/kubernetes-docs/issues/new">file a bug here</a>.</p>
    <p>See the guide to <a href="/kubernetes/docs/how-to-contribute"> contributing </a> or discuss these docs in our <a href="https://chat.charmhub.io/charmhub/channels/kubernetes"> public Mattermost channel</a>.</p>
  </div>
</div>

