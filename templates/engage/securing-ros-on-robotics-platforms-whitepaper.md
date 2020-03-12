---
wrapper_template: "engage/_base_engage_markdown.html"
context:
  title: "Securing ROS robotics platforms"
  meta_description: "The steps you need to take to maximise robotics security with Ubuntu"
  meta_image: "https://assets.ubuntu.com/v1/3afb18e7-Meta+data+img.jpg"
  meta_copydoc: "https://docs.google.com/document/d/156Oa3Oz3RiUQcFLTKNqtfKXiuFtzZm0fRMsrv6XV5Wc/edit"
  header_title: "Securing ROS robotics platforms"
  header_subtitle: "Steps to maximise robotics security with Ubuntu"
  header_url: '#register-section'
  header_cta: Download whitepaper
  header_class: p-engage-banner--grad
  header_image: "https://assets.ubuntu.com/v1/5ee71af0-Robot+arm+-+white.svg"
  header_lang: en
  form_include: en
  form_id: 3537
  form_return_url: "https://pages.ubuntu.com/Whitepaper_ROSonrobotics_TY.html"
---

The Robot Operating System (ROS) is a popular open-source platform for advanced robotics. Its flexibility and ease-of-use make it well-suited to a wide array of robotics applications – however, these robots are not always sufficiently protected against security threats.

Opportunistic attacks are by far the most prevalent, and robots with inadequate ROS security make tempting targets for bad actors. With that in mind, approaching robotics security proactively is crucial to preventing breaches and saving resources in the long run. Security starts with the underlying operating system, and building robots on Ubuntu unlocks a number of easy, yet effective, measures for maximising protection against the most dominant threats.

Using the Raspberry Pi based model of TurtleBot3 as an example, this whitepaper details practical steps for securing robots on Ubuntu, including:

<ul class="p-list">
  <li class="p-list__item is-ticked">How to minimise the attack surface by installing the Ubuntu Server image, and by disabling USB, IPv6, core dump, and other functionalities that are not in use.</li>
  <li class="p-list__item is-ticked">Enabling unattended upgrades to keep automatically up-to-date with the latest security vulnerability patches.</li>
  <li class="p-list__item is-ticked">Mitigating brute force attacks through SSH hardening and firewall configuration.</li>
</ul>