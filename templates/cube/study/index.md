---
wrapper_template: "cube/study/_markdown.html"
markdown_includes:
  nav: "cube/study/_navigation.md"
context:
  title: "CUBE Study Materials"
  description: "CUBE Study Materials"
  auto_paginate: True
---

Refresh your understanding of key Ubuntu concepts and methods with the following study materials. The materials on these pages are available free of charge, and may be distributed in accordance with [Canonical’s intellectual property rights policy](/legal/intellectual-property-policy).

Note that these study materials are not intended as a training program. Rather, they are meant to complement your existing knowledge. If any of the terms or procedures encountered in these materials feel unfamiliar, it may indicate that further preparation is needed in that subject area before attempting the corresponding CUBE exam.

## Further preparation

For additional practise, enroll in Canonical’s Study Labs. The labs enhance the free study materials, adding new interactive exercises that feature virtual Ubuntu terminals. They offer a hands-on study experience that simulates working with the real thing. No more worrying about experimenting on your personal computer; use our simulated ones to avoid altering your own files.

Our study labs provide terminal access via your browser and are formatted similarly to what you will see during exams.

A single purchase grants 90 days of access to the full set of Study Labs for every microcertification.

<a class="p-button--positive js-study-button u-hide"></a>

<div class="p-notification--negative js-study-notification u-hide">
  <div class="p-notification__content" role="status">
    <span class="p-notification__title">Error:</span>
    <p class="p-notification__message">We could not verify if you have access to the study labs.</p>
  </div>
</div>

<script>
  const button = document.querySelector(".js-study-button");
  const notification = document.querySelector(".js-study-notification");
  fetch("/cube/study/labs")
    .then((response) => {
      if (!response.ok) {
        throw new Error('Response was not ok');
      }
      return response.json()
    })
    .then((json) => {
      button.href = json.redirect_url;
      button.text = json.text;
      button.classList.toggle("u-hide")
    })
    .catch(() => {
      notification.classList.toggle("u-hide")
    });
</script>
