---
wrapper_template: "engage/_base_engage_markdown.html"
context:
  title: "Utilising cloud-init on Microsoft Azure"
  meta_description: "Simplify cloud instance deployment with Ubuntu on Azure"
  meta_image: "https://assets.ubuntu.com/v1/1168ff35-azure-cloud-init.png"
  meta_copydoc: "https://docs.google.com/document/d/1f3iY3D3T8zCiLcM23M_Ba31RF5LYHKPFMr7SUxOsYNI/edit"
  header_title: "Utilising cloud-init on Microsoft Azure"
  header_subtitle: "Simplify cloud instance deployment with Ubuntu on Azure"
  header_image: "https://assets.ubuntu.com/v1/43eb9383-cloud-init+azure-white.svg"
  header_image_width: "320"
  header_image_height: "304"
  header_url: "#register-section"
  header_cta: Download whitepaper
  header_cta_class: p-button--positive
  header_class: p-engage-banner--grad
  form_include: en
  form_id: 3542
  form_return_url: "https://pages.ubuntu.com/AzureCloudInit_TY.html"
---

Cloud-init is the industry standard for initialising cloud instances. Available on Ubuntu images by default, it enables users to automate the provisioning of an operating system image into a fully running state – with key initialisation tasks handled at the first boot of an instance.

Cloud-init delivers significant time savings over manually producing and maintaining cloud images, and it can be used to seamlessly deploy Ubuntu virtual machines within Microsoft Azure.

This guide, joint with Microsoft, will explain how to utilise cloud-init with Ubuntu on Azure, including:

- An overview of the roles of metadata and user data
- How to customise instances when deploying through the Azure Marketplace, Azure CLI, or Azure Resource Manager
- Writing scripts with Azure SDK for Python to further streamline deployment and achieve even greater customisation
