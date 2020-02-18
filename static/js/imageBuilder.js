(function () {
  const STATE = {
    'board': '',
    'os': '',
    'snaps': []
  };
  const boardSelection = document.querySelectorAll('.js-boards .js-selection');
  const osSelection = document.querySelectorAll('.js-os .js-selection');
  const summaryBoard = document.querySelector('.js-summary-board');
  const summaryOS = document.querySelector('.js-summary-os');
  const summarySnaps = document.querySelector('.js-summary-snaps');
  const snapSearch = document.querySelector('.js-snap-search');
  const snapResults = document.querySelector('.js-snap-results');
  selectionListeners(boardSelection, 'board');
  selectionListeners(osSelection, 'os');
  searchHandler();

  function searchHandler() {
    if (snapSearch) {
      snapSearch.addEventListener('submit', e => {
        e.preventDefault();
        const searchInput = snapSearch.querySelector('.p-search-box__input');
        if (searchInput) {
          const searchValue = encodeURI(searchInput.value);
          fetch(`/static/snapcraft-fixture.json?q=${searchValue}`)
            .then((response) => {
              return response.json();
            })
            .then((json) => {
              renderSnapList(json["_embedded"]["clickindex:package"]);
            });
        }
      });
    }
  }

  function renderSnapList(snapResponce) {
    if (snapResults) {
      snapResponce.innerHTML = '';
      snapResponce.forEach((item, index) => {
        snapResults.insertAdjacentHTML('beforeend',
          `<div class="p-media-object">
            <img src="${item.icon_url}" alt="${item.title}" class="p-media-object__image">
            <div class="p-media-object__details">
              <h1 class="p-media-object__title">${item.title}</h1>
              <p class="p-media-object__content">${item.developer_name}</p>
              <a href="" class="p-button--neutral" data-index="${index}">Add</a>
            </div>
          </div>`
        );
      });
    }
  }

  function selectionListeners(collection, stateIndex) {
    collection.forEach(selection => {
      selection.addEventListener('click', function() {
        selectCollection(collection, selection);
        const value = this.querySelector('.p-card__content').innerText;
        changeState(stateIndex, value);
        updateOSs();
      });
    });
  }

  function selectCollection(collection, selected) {
    collection.forEach(item => {
      item.classList.remove('is-selected');
    });
    selected.classList.add('is-selected');
  }

  function updateOSs() {
    osSelection.forEach(selection => {
      const osSupport = selection.dataset.supports;
      const selectedBoard = STATE.board.replace(' ', '-').toLowerCase();

      // Check if the currently selected OS supports the this board
      if (osSupport.includes(selectedBoard)) {
        selection.classList.remove('u-hide');
      } else {
        selection.classList.add('u-hide');

        // If current OS selection is not supported by the board reset OS
        if (selection.classList.contains('is-selected')) {
          changeState('os', '');
          selection.classList.remove('is-selected');
        }
      }
    });
  }

  function renderSummary() {
    if (summaryBoard) {
      summaryBoard.innerText = STATE.board;
    }
    if (summaryOS) {
      summaryOS.innerText = STATE.os;
    }
    if (summarySnaps) {
      summarySnaps.innerText = STATE.snaps.length;
    }
  }

  function render() {
    renderSummary();
  }

  function changeState(key, value) {
    STATE[key] = value;
    render();
  }
})()