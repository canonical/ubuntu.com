import { configureStore, createAction, createReducer } from "@reduxjs/toolkit";

import formReducer from "./reducers/form-reducer";

console.log("woaah mama");

const increment = createAction("increment");
const decrement = createAction("decrement");

const counter = createReducer(0, {
  [increment]: (state) => state + 1,
  [decrement]: (state) => state - 1,
});

const store = configureStore({
  reducer: {
    form: formReducer,
  },
});
const valueEl = document.getElementById("value");

function render() {
  valueEl.innerHTML = store.getState().toString();
}

render();
store.subscribe(render);

document.getElementById("increment").addEventListener("click", function () {
  store.dispatch(increment());
});

document.getElementById("decrement").addEventListener("click", function () {
  store.dispatch(decrement());
});

document
  .getElementById("incrementIfOdd")
  .addEventListener("click", function () {
    if (store.getState() % 2 !== 0) {
      store.dispatch(increment());
    }
  });

document
  .getElementById("incrementAsync")
  .addEventListener("click", function () {
    setTimeout(function () {
      store.dispatch(increment());
    }, 1000);
  });
