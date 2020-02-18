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
  selectionListeners(boardSelection, 'board');
  selectionListeners(osSelection, 'os');

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