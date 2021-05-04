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
  defaultPaymentMethod: {
    id: "",
  },
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
          defaultPaymentMethod: { id: paymentMethodId },
        },
      } = action.payload;

      return {
        email: { value: email, validity: VALIDITY.VALID },
        name: { value: name, validity: VALIDITY.VALID },
        organisation: { value: organisation, validity: VALIDITY.VALID },
        street: { value: street, validity: VALIDITY.VALID },
        city: { value: city, validity: VALIDITY.VALID },
        postalCode: { value: postalCode, validity: VALIDITY.VALID },
        country: { value: country, validity: VALIDITY.VALID },
        countryState: { value: countryState, validity: VALIDITY.VALID },
        VATNumber: { value: "", validity: VALIDITY.VALID },
        defaultPaymentMethod: {
          id: paymentMethodId,
        },
        isGuest: false,
      };
    },
  },
});

// Extract the action creators object and the reducer
const { actions, reducer } = userInfoSlice;

export const { validateField, updateField, initUserInfo } = actions;

export default reducer;
