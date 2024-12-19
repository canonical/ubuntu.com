import {
  Currencies,
  DistributorProductTypes,
  Support,
  SLA,
} from "advantage/distributor/utils/utils";
import {
  currencyFormatter,
  generateUniqueId,
  getPreCurrency,
  getPreDuration,
  getPreSelectedItem,
  getProductId,
} from "../utils";
import { OfferItem } from "advantage/offers/types";

describe("Test generateUniqueId", () => {
  test("should return a string", () => {
    const id = generateUniqueId();
    expect(typeof id).toBe("string");
  });

  test("should generate unique Ids on multiple calls", () => {
    const id_1 = generateUniqueId();
    const id_2 = generateUniqueId();
    expect(id_1).not.toBe(id_2);
  });
});

describe("Test currencyFormatter", () => {
  test("should format USD currency correctly", () => {
    const formatter = currencyFormatter(Currencies.usd);
    expect(formatter.format(1234.56)).toBe("$1,234.56");
  });

  test("should format EUR currency correctly", () => {
    const formatter = currencyFormatter(Currencies.eur);
    expect(formatter.format(1234.56)).toBe("€1,234.56");
  });

  test("should format GBP currency correctly", () => {
    const formatter = currencyFormatter(Currencies.gbp);
    expect(formatter.format(1234.56)).toBe("£1,234.56");
  });
});

describe("Test getProductId", () => {
  test("should return uio-standard-physical for physical-infra-weekday", () => {
    const productId = getProductId(
      DistributorProductTypes.physical,
      Support.infra,
      SLA.weekday,
    );
    expect(productId).toBe("uio-standard-physical");
  });

  test("should return uaia-essential-physical for physical-none-none", () => {
    const productId = getProductId(
      DistributorProductTypes.physical,
      Support.none,
      SLA.none,
    );
    expect(productId).toBe("uaia-essential-physical");
  });

  test("should return uaia-essential-virtual for virtual-none-none", () => {
    const productId = getProductId(
      DistributorProductTypes.virtual,
      Support.none,
      SLA.none,
    );
    expect(productId).toBe("uaia-essential-virtual");
  });

  test("should return no-product for invalid combination", () => {
    const productId = getProductId(
      DistributorProductTypes.desktop,
      Support.infra,
      SLA.weekday,
    );
    expect(productId).toBe("no-product");
  });

  test("should return no-product for unsupported SLA", () => {
    const productId = getProductId(
      DistributorProductTypes.physical,
      Support.full,
      "invalid-sla" as SLA,
    );
    expect(productId).toBe("no-product");
  });
});

const mockItem: OfferItem = {
  allowance: 2,
  id: "test-id",
  productID: "uaia-standard-physical",
  name: "Product Name",
  price: 10.99,
};

describe("Test getPreSelectedItem", () => {
  test("should return pre-selected item for valid productID", () => {
    const result = getPreSelectedItem(mockItem);

    expect(result).toEqual({
      id: "test-id",
      type: DistributorProductTypes.physical,
      support: Support.full,
      sla: SLA.weekday,
      quantity: 2,
    });
  });

  test("should return null for invalid productID", () => {
    const item = {
      ...mockItem,
      productID: "invalid-id",
    };
    const result = getPreSelectedItem(item);
    expect(result).toBeNull();
  });

  test("should handle missing productID", () => {
    const item = {
      id: "test-id",
      name: "Product Name",
      allowance: 2,
      price: 10.99,
    };
    const result = getPreSelectedItem(item);
    expect(result).toBeNull();
  });
});

describe("Test getPreCurrency", () => {
  test("should return correct currency for valid input", () => {
    const item = {
      ...mockItem,
      currency: "eur",
    };
    const result = getPreCurrency(item);
    expect(result).toBe(Currencies.eur);
  });

  test("should default to USD for invalid currency", () => {
    const item = { ...mockItem, currency: "unknown" };
    const result = getPreCurrency(item);
    expect(result).toBe(Currencies.usd);
  });

  test("should default to USD if currency field is missing", () => {
    const result = getPreCurrency(mockItem);
    expect(result).toBe(Currencies.usd);
  });
});

describe("Test getPreDuration", () => {
  test("should return 1 for 365 days", () => {
    const result = getPreDuration({ ...mockItem, effectiveDays: 365 });
    expect(result).toBe(1);
  });

  test("should return 2 for 730 days", () => {
    const result = getPreDuration({ ...mockItem, effectiveDays: 730 });
    expect(result).toBe(2);
  });

  test("should return 3 for 1095 days", () => {
    const result = getPreDuration({ ...mockItem, effectiveDays: 1095 });
    expect(result).toBe(3);
  });

  test("should default to 1 for invalid effectiveDays", () => {
    const result = getPreDuration({ ...mockItem, effectiveDays: 400 });
    expect(result).toBe(1);
  });

  test("should default to 1 if effectiveDays is missing", () => {
    const result = getPreDuration({ ...mockItem });
    expect(result).toBe(1);
  });
});
