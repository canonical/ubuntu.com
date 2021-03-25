import { configureStore } from "@reduxjs/toolkit";
import initFormInputs from "./listeners/form-event-listeners";

import formReducer from "./reducers/form-reducer";

import render from "./renderers/main-renderer";

// We add a solid background to the footer so we can hide the "cart" behind it.
const footer = document.querySelector("footer.p-footer");
footer.style.backgroundColor = "white";

const store = configureStore({
  reducer: {
    form: formReducer,
  },
});

initFormInputs(store);

render(store.getState());
store.subscribe(() => {
  render(store.getState());
});
