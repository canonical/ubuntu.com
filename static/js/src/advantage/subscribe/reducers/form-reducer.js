import { createSlice } from "@reduxjs/toolkit";

const initialFormState = {
  type: "physical",
  version: "18.04",
  feature: "infra",
  support: "essential",
  quantity: 1,
};

const formSlice = createSlice({
  name: "form",
  initialState: initialFormState,
  reducers: {
    changeType(state, action) {
      state.type = action.payload;
    },
    changeVersion(state, action) {
      state.version = action.payload;
    },
    changeFeature(state, action) {
      state.feature = action.payload;
    },
    changeSupport(state, action) {
      state.support = action.payload;
    },
    changeQuantity(state, action) {
      if (action.payload >= 1) {
        state.quantity = action.payload;
      }
    },
  },
});

// Extract the action creators object and the reducer
const { actions, reducer } = formSlice;

export const {
  changeType,
  changeVersion,
  changeFeature,
  changeSupport,
  changeQuantity,
} = actions;

export default reducer;
