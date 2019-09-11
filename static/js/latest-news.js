(function() {
  function _slugify(string) {
    const a = 'àáäâãåăæąçćčđďèéěėëêęğǵḧìíïîįłḿǹńňñòóöôœøṕŕřßşśšșťțùúüûǘůűūųẃẍÿýźžż·/_,:;'
    const b = 'aaaaaaaaacccddeeeeeeegghiiiiilmnnnnooooooprrsssssttuuuuuuuuuwxyyzzz------'
    const p = new RegExp(a.split('').join('|'), 'g')
  
    return string.toString().toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
      .replace(/&/g, '-and-') // Replace & with 'and'
      .replace(/[^\w\-]+/g, '') // Remove all non-word characters
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, '') // Trim - from end of text
  }

  function _articleDiv(article, gtmEventLabel) {
    const parsedDate = new Date(article.date);
    var monthNames = [
      "January", "February", "March",
      "April", "May", "June", "July",
      "August", "September", "October",
      "November", "December"
    ];
    const formattedDate = parsedDate.getDate() + ' ' + monthNames[parsedDate.getMonth()] + ' ' + parsedDate.getFullYear();
    const link = '<a href="/blog/' + article.slug + '">' + article.title.rendered + '</a>';
    const header = "<h4>" + link + "</h4>";
    const date = '<p class="u-no-padding--top"><em><time pubdate datetime="' + article.date + '">' + formattedDate + '</time></em></p>';
    const div = document.createElement("div");
    div.classList.add("col-3");
    div.innerHTML = header + date;

    div.querySelector('a').onclick = function() {
      dataLayer.push(
        {
          'event': 'GAEvent',
          'eventCategory': 'blog',
          'eventAction': gtmEventLabel + ' news link',
          'eventLabel': _slugify(article.title)
        }
      );
    }

    return div
  }

  function _latestArticlesCallback(latestNewsContainer, spotlightContainer, gtmEventLabel) {
    return function(event) {
      const containerForLatestNews = document.querySelector(latestNewsContainer);

      // Clear out latest news container
      while (containerForLatestNews.hasChildNodes()) {
        containerForLatestNews.removeChild(containerForLatestNews.lastChild);
      }

      const data = JSON.parse(event.target.responseText);
      const latestPinned = data.latest_pinned_articles[0];

      if (latestPinned) {
        const containerForSpotlight = document.querySelector(spotlightContainer);
        article = _articleDiv(latestPinned, gtmEventLabel);
        article.classList.remove("col-3");
        containerForSpotlight.appendChild(article);
        containerForSpotlight.classList.remove("u-hide");
      }

      if (data.latest_articles) {
        data.latest_articles.forEach(function(article) {
          containerForLatestNews.appendChild(_articleDiv(article, gtmEventLabel));
        });
      }
    };
  }

  function fetchLatestNews(articlesContainerSelector, spotlightContainerSelector, gtmEventLabel) {
    const oReq = new XMLHttpRequest();
    oReq.addEventListener(
      "load",
      _latestArticlesCallback(articlesContainerSelector, spotlightContainerSelector, gtmEventLabel)
    );
    oReq.open("GET", "/blog/latest-news");
    oReq.send();
  }

  if(typeof(window.fetchLatestNews) == "undefined") {
    window.fetchLatestNews = fetchLatestNews
  }
})()
