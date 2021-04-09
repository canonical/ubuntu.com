import { createSlice } from "@reduxjs/toolkit";

export const VALIDITY = {
  PRISTINE: "pristine",
  ERROR: "error",
  VALID: "valid",
};

const initialFormState = {
  email: { value: "", validity: VALIDITY.PRISTINE },
  name: { value: "", validity: VALIDITY.PRISTINE },
  organisation: { value: "", validity: VALIDITY.PRISTINE },
  street: { value: "", validity: VALIDITY.PRISTINE },
  city: { value: "", validity: VALIDITY.PRISTINE },
  postalCode: { value: "", validity: VALIDITY.PRISTINE },
  country: { value: "", validity: VALIDITY.PRISTINE },
  countryState: { value: "", validity: VALIDITY.PRISTINE },
  VATNumber: { value: "", validity: VALIDITY.PRISTINE },
  isGuest: true,
};

const userInfoSlice = createSlice({
  name: "userInfo",
  initialState: initialFormState,
  reducers: {
    updateField(state, action) {
      state[action.payload.field].value = action.payload.value;
    },
    validateField(state, action) {
      state[action.payload.field].validity = action.payload.valid
        ? VALIDITY.VALID
        : VALIDITY.ERROR;
    },

    initUserInfo(state, action) {
      console.log(action);

      const {
        accountInfo: { name: organisation },
        customerInfo: {
          name,
          email,
          address: {
            city,
            country,
            line1: street,
            postal_code: postalCode,
            state: countryState,
          },
        },
      } = action.payload;

      return {
        email: { value: email, validity: VALIDITY.PRISTINE },
        name: { value: name, validity: VALIDITY.PRISTINE },
        organisation: { value: organisation, validity: VALIDITY.PRISTINE },
        street: { value: street, validity: VALIDITY.PRISTINE },
        city: { value: city, validity: VALIDITY.PRISTINE },
        postalCode: { value: postalCode, validity: VALIDITY.PRISTINE },
        country: { value: country, validity: VALIDITY.PRISTINE },
        countryState: { value: countryState, validity: VALIDITY.PRISTINE },
        VATNumber: { value: "", validity: VALIDITY.PRISTINE },
        isGuest: false,
      };
    },
  },
});

// Extract the action creators object and the reducer
const { actions, reducer } = userInfoSlice;

export const { validateField, updateField, initUserInfo } = actions;

export default reducer;
