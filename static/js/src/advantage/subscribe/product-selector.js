import { configureStore } from "@reduxjs/toolkit";
import { debounce } from "../../utils/debounce";
import { saveState } from "../../utils/persitState";
import { getCustomerInfo } from "../contracts-api";
import initFormInputs from "./listeners/form-event-listeners";
import initUIControls from "./listeners/ui-event-listeners";

import formReducer from "./reducers/form-reducer";
import UIReducer from "./reducers/ui-reducer";
import UserInfoReducer, { initUserInfo } from "./reducers/user-info-reducer";

import render from "./renderers/main-renderer";

// We add a solid background to the footer so we can hide the "cart" behind it.
const footer = document.querySelector("footer.p-footer");
footer.style.backgroundColor = "white";

const store = configureStore({
  reducer: {
    form: formReducer,
    ui: UIReducer,
    userInfo: UserInfoReducer,
  },
});

getCustomerInfo(window.accountId)
  .then((res) => {
    store.dispatch(initUserInfo(res.data));
  })
  .catch((e) => console.error({ e }));

initFormInputs(store);
initUIControls(store);

render(store.getState());
store.subscribe(() => {
  render(store.getState());
  debounce(function () {
    saveState(store.getState(), "ua-subscribe-state");
  }, 1000)();
});
