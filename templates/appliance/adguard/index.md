---
wrapper_template: "appliance/shared/_base_appliance_index.html"
context:
  name: "AdGuard"
  short_name: "adguard"
  appliance_name: "AdGuard"
  company_name: "AdGuard, (ameshkov)"
  logo: "https://assets.ubuntu.com/v1/1ec45573-AdGuard.png"
  category: "Security"
  meta_description: "AdGuard Home is a network-wide software for blocking and tracking ads. After you set it up, it'll cover ALL your home devices, and you don't need any client-side software for that."
  downloads:
    raspberrypi: True
    pc: True
    intelnuc: True
  pi:
    2: True
    3: True
    4: True
  screenshots:
    1: https://assets.ubuntu.com/v1/1febeddd-adguard-main-image.png
    2: https://assets.ubuntu.com/v1/21176b69-adguard-advert.png
    3: https://assets.ubuntu.com/v1/9eb41b64-adguard-advert-1.png
  links:
    1:
      title: "AdGuard Home Privacy Policies"
      url: "https://adguard.com/en/privacy.html"
    2:
      title: "AdGuard Home website"
      url: "https://adguard.com/en/adguard-home/overview.html"
    3:
      title: "AdGuard Home license"
      url: "https://github.com/AdguardTeam/AdGuardHome/blob/master/LICENSE.txt"
  compliance:
    1: "EU GDPR"
    2: "California law"
  base: "core20"
  published_date: "2020-06-16"
  maintenance_date: "2030-06-16"
  snaps:
    1:
      name: "AdGuard Home"
      icon: "https://assets.ubuntu.com/v1/1ec45573-AdGuard.png"
      link: "https://snapcraft.io/adguard-home"
      publisher: "AdGuard, (ameshkov)"
      channel: "latest/stable"
      version: "0.106.3"
      published_date: "15 May 2020"
---

#### Network-wide ads and trackers blocking DNS server</h2>

AdGuard Home is a network-wide software for blocking and tracking ads. After you set it up, it'll cover ALL your home devices, and you don't need any client-side software for that.

It operates as a DNS server that re-routes tracking domains to a "black hole", thus preventing your devices from connecting to those servers. It's based on software we use for our public AdGuard DNS servers &mdash; both share a lot of common code.
