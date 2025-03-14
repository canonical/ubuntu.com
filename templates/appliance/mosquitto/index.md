---
wrapper_template: "appliance/shared/_base_appliance_index.html"
context:
  name: "Mosquitto"
  short_name: "mosquitto"
  appliance_name: "Mosquitto"
  company_name: "Mosquitto Team (mosquitto)"
  logo: "https://dashboard.snapcraft.io/site_media/appmedia/2018/08/mosquitto-logo-only.svg.png"
  category: "MQTT Broker"
  meta_description: "Mosquitto is a message broker from the Eclipse Foundation. MQTT provides a method of carrying out messaging using a publish/subscribe model. It is lightweight, both in terms of bandwidth usage and ease of implementation."
  meta_copydoc: https://docs.google.com/document/d/1Gg4Ltt550H8zN4dmZpd5cjIeRz52AyXFL-nDrGI5rb8/edit?tab=t.0
  downloads:
    raspberrypi: True
    pc: True
    intelnuc: True
  pi:
    2: True
    3: True
    4: True
  screenshots:
    1: https://dashboard.snapcraft.io/site_media/appmedia/2018/06/mosquitto_dbIlbAp.png
    2: https://dashboard.snapcraft.io/site_media/appmedia/2018/06/mosquitto_sub_d1aBoJH.png
  links:
    1:
      title: "Mosquitto privacy policies"
      url: "https://www.eclipse.org/legal/privacy.php"
    2:
      title: "Mosquitto website"
      url: "https://mosquitto.org/"
    3:
      title: "Mosquitto license"
      url: "https://github.com/eclipse/mosquitto/blob/master/LICENSE.txt"
  compliance:
    1: "EU GDPR"
    2: "California law"
  base: "core18"
  published_date: "2020-06-12"
  maintenance_date: "2030-06-16"
  snaps:
    1:
      name: "Mosquitto"
      icon: "https://dashboard.snapcraft.io/site_media/appmedia/2018/08/mosquitto-logo-only.svg.png"
      link: "https://snapcraft.io/mosquitto"
      publisher: "By Mosquitto Team"
      channel: "latest/stable"
      version: "1.6.10"
      published_date: "26 May 2020"
---

<h2>Eclipse Mosquitto MQTT broker</h2>

<br />
This is a message broker that supports version 5.0, 3.1.1, and 3.1 of the MQTT protocol. MQTT provides a method of carrying out messaging using a publish/subscribe model. It is lightweight, both in terms of bandwidth usage and ease of implementation. This makes it particularly useful at the edge of the network where a sensor or other simple device may be implemented using an arduino for example.

By default mosquitto will be installed as a system service, using the default configuration at `/snap/mosquitto/current/default_config.conf`. If this does not meet your needs, create the file `/var/snap/mosquitto/common/mosquitto.conf` and this will be used instead. Note that only files inside `/var/snap/mosquitto/common` can be read by mosquitto, you cannot put other configuration files in `/etc/mosquitto`.
