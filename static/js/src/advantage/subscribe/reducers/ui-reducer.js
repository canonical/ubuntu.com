import { createSlice } from "@reduxjs/toolkit";
import { loadState } from "../../../utils/persitState";

const initialUIState = {
  otherVersionsModal: {
    show: false,
  },
};

const UISlice = createSlice({
  name: "ui",
  initialState: loadState("ua-subscribe-state", "ui", initialUIState),
  reducers: {
    toggleOtherVersionsModal(state) {
      state.otherVersionsModal.show = !state.otherVersionsModal.show;
    },
  },
});

// Extract the action creators object and the reducer
const { actions, reducer } = UISlice;

export const { toggleOtherVersionsModal } = actions;

export default reducer;
