function setupUtmInheritance(selector) {
  const urlParams = new URLSearchParams(document.location.search);
  const azureUtmParams = [
    "utm_campaign",
    "utm_content",
    "utm_medium",
    "utm_source",
    "OCID",
  ];

  const links = document.querySelectorAll(selector);

  links.forEach((link) => {
    let url = new URL(link);

    azureUtmParams.forEach((azureUtmParam) => {
      let paramValue = urlParams.get(azureUtmParam);

      if (paramValue) {
        url.searchParams.set(azureUtmParam, paramValue);
      }
    });

    link.href = url.href;
  });
}

setupUtmInheritance('a[href*="https://azuremarketplace.microsoft.com"]');
