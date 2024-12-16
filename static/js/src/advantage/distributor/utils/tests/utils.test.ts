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

describe("Test generateUniqueId", () => {
  test("should return a string", () => {
    const id = generateUniqueId();
    expect(typeof id).toBe("string");
  });

  test("should generate unique Ids on multiple calls", () => {
    const id1 = generateUniqueId();
    const id2 = generateUniqueId();
    expect(id1).not.toBe(id2);
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

  test("should return no-product", () => {
    const productId = getProductId(
      DistributorProductTypes.desktop,
      Support.infra,
      SLA.weekday,
    );
    expect(productId).toBe("no-product");
  });
});

describe("Test getPreSelectedItem", () => {
  test("should return pre-selected item for valid productID", () => {
    const item = {
      allowance: 2,
      id: "lAIeXbXxG9D_nA5v5C5DQeisJ4E2DkLrmxtjXzvCU2nE",
      name: "uai-advanced-desktop-1y-channel-eur-v1",
      price: 60000,
      currency: "eur",
      effectiveDays: 365,
      productID: "uai-advanced-desktop",
      productName: "Ubuntu Pro Desktop + Support (24/7)",
    };

    const result = getPreSelectedItem(item);

    expect(result).toEqual({
      id: "lAIeXbXxG9D_nA5v5C5DQeisJ4E2DkLrmxtjXzvCU2nE",
      type: DistributorProductTypes.desktop,
      support: Support.full,
      sla: SLA.everyday,
      quantity: 2,
    });
  });

  test("should return null for invalid productID", () => {
    const item = {
      id: "lAIeXbXxG9D_nA5v5C5DQeisJ4E2DkLrmxtjXzvCU2nE",
      name: "unknown-item",
      allowance: 2,
      price: 60000,
      currency: "eur",
      effectiveDays: 365,
      productID: "invalid-id",
      productName: "Unknown Product",
    };

    const result = getPreSelectedItem(item);

    expect(result).toBeNull();
  });

  test("should handle missing fields", () => {
    const item = {
      id: "missing-fields",
      name: "uai-advanced-desktop-1y-channel-eur-v1",
      allowance: 2,
      price: 60000,
    };

    const result = getPreSelectedItem(item);

    expect(result).toBeNull();
  });
});

describe("Test getPreCurrency", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test("should return correct currency from item", () => {
    const item = {
      allowance: 3,
      id: "test-id",
      name: "uio-advanced-virtual-2y-channel-gbp-v1",
      price: 80000,
      currency: "gbp",
    };

    const result = getPreCurrency(item);
    expect(result).toBe("gbp");
  });

  test("should default to 'usd' when currency is missing", () => {
    const item = {
      allowance: 3,
      id: "test-id",
      name: "uio-advanced-virtual-2y-channel-v1",
      price: 80000,
    };

    const result = getPreCurrency(item);
    expect(result).toBe("usd");
  });

  test("should return lowercase currency", () => {
    const item = {
      allowance: 3,
      id: "test-id",
      name: "uio-advanced-virtual-2y-channel-USD-v1",
      price: 80000,
      currency: "USD",
    };

    const result = getPreCurrency(item);
    expect(result).toBe("usd");
  });
});

describe("Test getPreDuration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test("should return 1 year for effectiveDays 365", () => {
    const item = {
      allowance: 3,
      id: "test-id",
      name: "uio-advanced-virtual-1y-channel-v1",
      price: 80000,
      effectiveDays: 365,
    };

    const result = getPreDuration(item);
    expect(result).toBe(1);
  });

  test("should return 2 years for effectiveDays 730", () => {
    const item = {
      allowance: 3,
      id: "test-id",
      name: "uio-advanced-virtual-2y-channel-v1",
      price: 80000,
      effectiveDays: 730,
    };

    const result = getPreDuration(item);
    expect(result).toBe(2);
  });

  test("should return 3 years for effectiveDays 1095", () => {
    const item = {
      allowance: 3,
      id: "test-id",
      name: "uio-advanced-virtual-3y-channel-v1",
      price: 80000,
      effectiveDays: 1095,
    };

    const result = getPreDuration(item);
    expect(result).toBe(3);
  });

  test("should default to 1 year when effectiveDays is missing", () => {
    const item = {
      allowance: 3,
      id: "test-id",
      name: "uio-advanced-virtual-2y-channel-v1",
      price: 80000,
    };

    const result = getPreDuration(item);
    expect(result).toBe(1);
  });

  test("should default to 1 year for invalid effectiveDays", () => {
    const item = {
      allowance: 3,
      id: "test-id",
      name: "uio-advanced-virtual-2y-channel-v1",
      price: 80000,
      effectiveDays: 500,
    };

    const result = getPreDuration(item);
    expect(result).toBe(1);
  });
});
