(function() {
  // Toogles classes the active and open classes on the footer titles
  var footerTitlesA = document.querySelectorAll('footer li h2');
  footerTitlesA.forEach(function(node) {
    node.addEventListener('click', function(e) {
      e.target.classList.toggle('active');
    });
  });

  // Adds click eventlistener to the copy-to-clipboard buttons. Selects the input
  // and tries to copy the value to the clipboard.
  var codeCopyable = document.querySelectorAll('.p-code-copyable');
  codeCopyable.forEach(function(node) {
    var copyButton = node.querySelector('.p-code-copyable__action');
    var commandInput = node.querySelector('.p-code-copyable__input');
    if (copyButton && commandInput) {
      copyButton.addEventListener('click', function(e) {
        commandInput.select();
        e.preventDefault;
        try {
          dataLayer.push({
            'event': 'GAEvent',
            'eventCategory': 'Copy to clipboard',
            'eventAction': commandInput.value,
            'eventLabel': document.URL,
            'eventValue': undefined
          });
          node.classList.add('is-copied');
          setTimeout(function() {
            node.classList.remove('is-copied');
          }, 300);
        } catch(err) {
          node.classList.add('is-not-copied');
          console.log('Unable to copy');
        }
      });
    }

    if (commandInput) {
      commandInput.addEventListener('click', function() {
        this.select();
      });
    }
  });
}());
