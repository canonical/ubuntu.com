import { createSlice } from "@reduxjs/toolkit";

const initialFormState = {
  type: "physical",
  version: "18.04",
  feature: "infra",
  support: "unset",
  quantity: 1,
  billing: "yearly",
  product: {
    ok: false,
  },
};

const prefixMap = {
  infra: "uai",
  apps: "uaa",
  "infra+apps": "uaia",
};

function matchingProduct(testItem, selectedProductId, selectedBillingPeriod) {
  if (
    testItem.productID === selectedProductId &&
    testItem.period === selectedBillingPeriod
  ) {
    return true;
  }
  return false;
}

const productsArray = Object.entries(window.productList);

function getProduct(state) {
  const prefix = prefixMap[state.feature];
  const suffix =
    state.feature === "apps" && state.type === "physical"
      ? ""
      : `-${state.type}`; //the suffix is always the type except for UA Apps
  const productId = `${prefix}-${state.support}${suffix}`;
  var selectedProduct = {
    ok: false,
  };
  productsArray.forEach((product) => {
    const listingProduct = product[1];
    listingProduct.id = product[0];
    if (matchingProduct(listingProduct, productId, state.billing)) {
      selectedProduct = { ...listingProduct, ok: true };
      return listingProduct;
    }
  });
  return selectedProduct;
}

const formSlice = createSlice({
  name: "form",
  initialState: initialFormState,
  reducers: {
    changeType(state, action) {
      state.type = action.payload;
      console.log(getProduct(state));
      state.product = getProduct(state);
    },
    changeVersion(state, action) {
      state.version = action.payload;
    },
    changeFeature(state, action) {
      state.feature = action.payload;
      state.product = getProduct(state);
    },
    changeSupport(state, action) {
      state.support = action.payload;
      state.product = getProduct(state);
    },
    changeQuantity(state, action) {
      if (action.payload >= 1) {
        state.quantity = action.payload;
      }
    },
    changeBilling(state, action) {
      state.billing = action.payload;
      if (action.payload === "monthly") {
        state.support = "essential";
      }
      state.product = getProduct(state);
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
  changeBilling,
} = actions;

export default reducer;
