---
wrapper_template: "appliance/shared/_base_appliance_index.html"
context:
  name: "Gitea"
  short_name: "gitea"
  appliance_name: "Gitea"
  company_name: "Gitea"
  logo: "https://assets.ubuntu.com/v1/9f584e65-gitea.png"
  category: "Developer"
  meta_description: "Gitea, a painless self-hosted Git service."
  downloads:
    raspberrypi: True
    pc: True
    intelnuc: True
  pi:
    2: True
    3: True
    4: True
  screenshots:
    1: https://assets.ubuntu.com/v1/fa328332-gitea-1.png
    2: https://assets.ubuntu.com/v1/a93620ee-gitea-2.png
    3: https://assets.ubuntu.com/v1/03c1ed84-gitea-3.png
  links:
    1:
      title: "License: MIT"
      url: "https://github.com/go-gitea/gitea/blob/master/LICENSE"
    2:
      title: "Website"
      url: "https://gitea.io"
    3:
      title: "Privacy Policy"
      url: "https://discourse.gitea.io/privacy"
  compliance:
    1: EU GDPR
  base: "core18"
  published_date: "2020-09"
  maintenance_date: "2030-09"
  snaps:
    1:
      name: "gitea"
      icon: "https://assets.ubuntu.com/v1/9f584e65-gitea.png"
      link: "https://snapcraft.io/gitea"
      publisher: "By Gitea"
      channel: "latest/stable"
      version: "1.12.4"
      published_date: "4 September 2020"
---

#### Gitea - A painless self-hosted Git service

The goal of this project is to make the easiest, fastest, and most painless way of setting up a self-hosted Git service. With Go, this can be done with an independent binary distribution across ALL platforms that Go supports, including Linux, Mac OS X, Windows and ARM.
