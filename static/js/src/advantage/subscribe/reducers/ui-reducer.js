import { createSlice } from "@reduxjs/toolkit";

const initialUIState = {
  otherVersionsModal: {
    show: false,
  },
};

const UISlice = createSlice({
  name: "ui",
  initialState: initialUIState,
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
