---
wrapper_template: "appliance/shared/_base_appliance_index.html"
context:
  name: "Adguard"
  short_name: "adguard"
  appliance_name: "Adguard"
  company_name: "AdGuard, (ameshkov)"
  logo: "https://assets.ubuntu.com/v1/1ec45573-AdGuard.png"
  category: "Security"
  meta_description: "Build your Adgaurd appliance with Ubuntu Appliance images with preinstalled snaps. AdGuard Home is a network-wide software for blocking ads & tracking."
  downloads:
    raspberrypi: True
    pc: True
    intelnuc: True
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
      url: "https://adguard.com/"
    3:
      title: "AdGuard Home developer license"
      url: "https://adguard.com/en/rewards.html"
    4:
      title: "AdGuard Home issue tracker"
      url: "https://github.com/AdguardTeam/AdGuardHome/issues"
  compliance:
    1: "EU GDPR"
    2: "California law"
  base: "core20"
  published_date: "YYYY-MM-DD"
  maintenance_date: "YYYY-MM-DD"
  snaps:
    1:
      name: "AdGuard Home"
      icon: "https://assets.ubuntu.com/v1/1ec45573-AdGuard.png"
      link: "https://snapcraft.io/adguard-home"
      publisher: "AdGuard, (ameshkov)"
      channel: "latest/stable"
      version: "0.101.0"
      published_date: "24 April 2020"
---

#### Network-wide ads & trackers blocking DNS server</h2>

AdGuard Home is a network-wide software for blocking ads & tracking. After you set it up, it'll cover ALL your home devices, and you don't need any client-side software for that.

It operates as a DNS server that re-routes tracking domains to a &ldquo;black hole,&rdquo; thus preventing your devices from connecting to those servers. It's based on software we use for our public AdGuard DNS servers &mdash; both share a lot of common code.
