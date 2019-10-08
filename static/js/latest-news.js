(function() {
  function _slugify(string) {
    var a =
      "àáäâãåăæąçćčđďèéěėëêęğǵḧìíïîįłḿǹńňñòóöôœøṕŕřßşśšșťțùúüûǘůűūųẃẍÿýźžż·/_,:;";
    var b =
      "aaaaaaaaacccddeeeeeeegghiiiiilmnnnnooooooprrsssssttuuuuuuuuuwxyyzzz------";
    var p = new RegExp(a.split("").join("|"), "g");
    return string
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(p, function(c) {
        return b.charAt(a.indexOf(c));
      }) // Replace special characters
      .replace(/&/g, "-and-") // Replace & with 'and'
      .replace(/[^\w\-]+/g, "") // Remove all non-word characters
      .replace(/\-\-+/g, "-") // Replace multiple - with single -
      .replace(/^-+/, "") // Trim - from start of text
      .replace(/-+$/, ""); // Trim - from end of text
  }

  function _formatDate(date) {
    const parsedDate = new Date(date);
    var monthNames = [
      "January", "February", "March",
      "April", "May", "June", "July",
      "August", "September", "October",
      "November", "December"
    ];
    return parsedDate.getDate() + ' ' + monthNames[parsedDate.getMonth()] + ' ' + parsedDate.getFullYear();
  }

  function _articleDiv(article, articleTemplateSelector, gtmEventLabel) {
    const articleFragment = _getTemplate(articleTemplateSelector);

    const time = articleFragment.querySelector('.article-time');
    const link = articleFragment.querySelector('.article-link');
    const title = articleFragment.querySelector('.article-title');

    if (time) {
      time.datetime = article.date;
      time.innerText = _formatDate(article.date);
    }

    if (link) {
      link.href = '/blog/' + article.slug;
      if (gtmEventLabel) {
        link.onclick = function() {
          dataLayer.push(
            {
              'event': 'GAEvent',
              'eventCategory': 'blog',
              'eventAction': gtmEventLabel + ' news link',
              'eventLabel': _slugify(article.title.rendered)
            }
          );
        }
      }
    }

    if (title) {
      title.innerHTML = article.title.rendered;
    }

    return articleFragment
  }

  function _getTemplate(selector) {
    var template = document.querySelector(selector);

    if ('content' in template) {
      var fragment = document.importNode(template.content, true);
    } else {
      var fragment = document.createDocumentFragment();

      for (var i = 0; i < template.childNodes.length; i++) {
        fragment.appendChild(template.childNodes[i].cloneNode(true));
      }
    }

    return fragment;
  }

  function _latestArticlesCallback(options) {
    return function(event) {
      const articlesContainer = document.querySelector(options.articlesContainerSelector);

      // Clear out latest news container
      while (articlesContainer.hasChildNodes()) {
        articlesContainer.removeChild(articlesContainer.lastChild);
      }

      const data = JSON.parse(event.target.responseText);

      if ("spotlightContainerSelector" in options) {
        const spotlightContainer = document.querySelector(options.spotlightContainerSelector);
        const latestPinned = data.latest_pinned_articles[0];

        if (latestPinned) {
          spotlightContainer.appendChild(_articleDiv(latestPinned, options.spotlightTemplateSelector, options.gtmEventLabel));
        }
      }

      if (data.latest_articles) {
        data.latest_articles.forEach(function(article) {
          articlesContainer.appendChild(_articleDiv(article, options.articleTemplateSelector, options.gtmEventLabel));
        });
      }
    };
  }

  function fetchLatestNews(options) {
    var url = "/blog/latest-news"
    var params = []

    if (options.limit) {params.push("limit=" + options.limit);}
    if (options.tagId) {params.push("tag-id=" + options.tagId);}
    if (options.groupId) {params.push("group-id=" + options.groupId);}

    if (params.length) {
      url += "?" + params.join('&')
    }

    const oReq = new XMLHttpRequest();
    oReq.addEventListener(
      "load",
      _latestArticlesCallback(options)
    );
    oReq.open("GET", url);
    oReq.send();
  }

  if(typeof(window.fetchLatestNews) == "undefined") {
    window.fetchLatestNews = fetchLatestNews
  }
})()
